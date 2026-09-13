/**
 * Lighthouse CI na zbudowanym `web/dist`: desktop i mobile, progi w `lighthouserc.*.json`.
 * Ten sam skrypt uruchamia CI i `pnpm lh` lokalnie.
 *
 *   pnpm build && pnpm lh            oba zestawy
 *   pnpm lh desktop                  tylko jeden
 *
 * Raporty HTML: `.lighthouseci/raporty/{desktop,mobile}/`. Oba zestawy przechodzą do
 * końca nawet przy porażce pierwszego — widać wtedy pełny obraz, a nie tylko pierwszy błąd.
 *
 * Windows: `chrome-launcher` (zależność Lighthouse) po każdym przebiegu kasuje katalog
 * profilu Chrome, zanim Chrome zwolni pliki — przebieg kończy się EPERM mimo gotowego
 * wyniku, w praktyce co drugi raz. Obejście: uruchamiamy jeden Chrome sami i podajemy
 * Lighthouse jego port. Lighthouse podłącza się wtedy do istniejącej przeglądarki i niczego
 * nie kasuje. Na Linuksie (CI) działa standardowa ścieżka lhci.
 */

import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';

const PRESETS = ['desktop', 'mobile'] as const;
type Preset = (typeof PRESETS)[number];

/** Podzbiór domyślnych flag chrome-launcher, które wpływają na pomiar. */
const CHROME_FLAGS = [
	'--headless=new',
	'--disable-extensions',
	'--disable-component-extensions-with-background-pages',
	'--disable-background-networking',
	'--disable-component-update',
	'--disable-client-side-phishing-detection',
	'--disable-sync',
	'--disable-default-apps',
	'--disable-backgrounding-occluded-windows',
	'--disable-renderer-backgrounding',
	'--disable-background-timer-throttling',
	'--disable-ipc-flooding-protection',
	'--disable-features=Translate,OptimizationHints,MediaRouter,CalculateNativeWinOcclusion,RenderDocument',
	'--metrics-recording-only',
	'--mute-audio',
	'--no-first-run',
	'--no-default-browser-check',
	'--password-store=basic',
];

const WINDOWS_CHROME_PATHS = [
	process.env.CHROME_PATH,
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
	'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
	path.join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
];

const LOCAL_NOISE = ['*local.adguard.org*'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function freePort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			const port = typeof address === 'object' && address ? address.port : 0;
			server.close(() => resolve(port));
		});
	});
}

async function startChrome(): Promise<{ port: number; stop: () => Promise<void> }> {
	const chromePath = WINDOWS_CHROME_PATHS.find((p) => p && existsSync(p));
	if (!chromePath) throw new Error('Nie znaleziono Chrome. Ustaw CHROME_PATH.');

	const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'lh-chrome-'));
	const port = await freePort();
	const child: ChildProcess = spawn(
		chromePath,
		[...CHROME_FLAGS, `--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`],
		{ stdio: 'ignore' },
	);

	let ready = false;
	for (let attempt = 0; attempt < 100 && !ready; attempt++) {
		try {
			ready = (await fetch(`http://127.0.0.1:${port}/json/version`)).ok;
		} catch {
			await sleep(100);
		}
	}
	if (!ready) {
		child.kill();
		throw new Error('Chrome nie wystawił portu debugowania w 10 s.');
	}

	return {
		port,
		stop: async () => {
			const exited = new Promise((resolve) => child.once('exit', resolve));
			child.kill();
			await exited;
			try {
				rmSync(userDataDir, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 });
			} catch {
				console.warn(`Nie udało się usunąć ${userDataDir} — do usunięcia ręcznie.`);
			}
		},
	};
}

function lhci(command: string, preset: Preset, extra: string[] = []): boolean {
	const result = spawnSync(
		'pnpm',
		['exec', 'lhci', command, `--config=lighthouserc.${preset}.json`, ...extra],
		{ stdio: 'inherit', shell: process.platform === 'win32' },
	);
	return result.status === 0;
}

if (!existsSync('web/dist/index.html')) {
	console.error('Brak web/dist/index.html — najpierw `pnpm build`.');
	process.exit(1);
}

const requested = process.argv.slice(2);
const presets = requested.length > 0 ? PRESETS.filter((p) => requested.includes(p)) : PRESETS;
if (presets.length === 0) {
	console.error(`Nieznany zestaw: ${requested.join(', ')}. Dostępne: ${PRESETS.join(', ')}.`);
	process.exit(1);
}

const chrome = process.platform === 'win32' ? await startChrome() : undefined;
const collectFlags = [
	// Filtry sieciowe działające na poziomie systemu (AdGuard dla Windows) wstrzykują skrypty
	// do każdej strony, także na localhost — zmierzone: +1,7 MB i +9 s do FCP na mobile.
	// Blokujemy je w pomiarze, żeby wynik dotyczył strony, a nie maszyny.
	...LOCAL_NOISE.map((pattern) => `--settings.blockedUrlPatterns=${pattern}`),
	...(chrome
		? [`--settings.port=${chrome.port}`]
		: // Runner CI na Ubuntu 24.04 blokuje sandbox Chrome (AppArmor). Audytujemy własny
			// statyczny build w jednorazowej maszynie, więc wyłączenie sandboxa jest bezpieczne.
			process.env.CI
			? ['--settings.chromeFlags=--no-sandbox']
			: []),
];

const failed: Preset[] = [];
try {
	for (const preset of presets) {
		console.log(`\n=== Lighthouse: ${preset} ===\n`);
		const collected = lhci('collect', preset, collectFlags);
		// Raporty zapisujemy także przy porażce asercji — po to, żeby było widać, co poprawić.
		if (collected) lhci('upload', preset);
		if (!collected || !lhci('assert', preset)) failed.push(preset);
	}
} finally {
	await chrome?.stop();
}

if (failed.length > 0) {
	console.error(`\nLighthouse: progi niespełnione — ${failed.join(', ')}.`);
	process.exit(1);
}
console.log(`\nLighthouse: progi spełnione — ${presets.join(', ')}.`);
