/**
 * Odczyt formularza (POST) z limitem rozmiaru.
 *
 * Sam nagłówek Content-Length nie wystarcza: zgłoszenie wysłane w kawałkach (chunked) może go
 * nie mieć, a `request.formData()` przeczytałby wtedy całą treść — do limitu Cloudflare
 * (100 MB na darmowym planie). Tu treść jest czytana strumieniem i odczyt przerywa się po
 * przekroczeniu `maxBytes`.
 *
 * Czysty TypeScript bez importów — używają go wszystkie endpointy formularzy w workerze.
 */

export type FormBody = { ok: true; form: FormData } | { ok: false; status: 400 | 413 };

export async function readFormData(request: Request, maxBytes: number): Promise<FormBody> {
	// Szybka odmowa, gdy nagłówek już mówi „za dużo” — bez czytania treści.
	if (Number(request.headers.get('Content-Length') ?? 0) > maxBytes) return { ok: false, status: 413 };
	if (!request.body) return { ok: false, status: 400 };

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > maxBytes) {
			await reader.cancel();
			return { ok: false, status: 413 };
		}
		chunks.push(value);
	}

	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}

	try {
		// Content-Type z oryginału — w nim jest granica części (multipart) albo urlencoded.
		const headers = { 'Content-Type': request.headers.get('Content-Type') ?? '' };
		return { ok: true, form: await new Response(bytes, { headers }).formData() };
	} catch {
		return { ok: false, status: 400 };
	}
}
