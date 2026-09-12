import { createClient, type SanityClient } from '@sanity/client';
import { DEMO_CONTENT, SANITY_DATASET, SANITY_PROJECT_ID } from 'astro:env/server';

/**
 * Skąd biorą się treści.
 *
 * - `sanity` — jest SANITY_PROJECT_ID, pobieramy z Content Lake przy buildzie.
 * - `demo`   — brak projektu. W `astro dev` włącza się samo (z ostrzeżeniem),
 *              w `astro build` wymaga jawnego DEMO_CONTENT=true, żeby treści
 *              demo nie trafiły przez pomyłkę na produkcję klienta.
 */
export type ContentSource = 'sanity' | 'demo';

function resolveContentSource(): ContentSource {
	if (SANITY_PROJECT_ID) {
		if (DEMO_CONTENT) {
			console.warn('[sanity] SANITY_PROJECT_ID jest ustawione — DEMO_CONTENT=true zignorowane.');
		}
		return 'sanity';
	}
	if (DEMO_CONTENT) return 'demo';
	if (import.meta.env.PROD) {
		throw new Error(
			[
				'Brak SANITY_PROJECT_ID. Build produkcyjny wymaga projektu Sanity.',
				'Ustaw zmienną środowiskową (patrz web/.env.example)',
				'albo — wyłącznie dla wersji demo — DEMO_CONTENT=true.',
			].join(' '),
		);
	}
	console.warn('[sanity] Brak SANITY_PROJECT_ID — dev używa treści demo z fixtures.ts.');
	return 'demo';
}

export const contentSource: ContentSource = resolveContentSource();

export const sanityProjectId = SANITY_PROJECT_ID ?? '';
export const sanityDataset = SANITY_DATASET;

/**
 * Klient tylko do odczytu, tylko na czas builda.
 * `useCdn: false` — chcemy świeżych danych zaraz po publikacji, a przy SSG
 * kilka zapytań do API i tak nic nie kosztuje.
 * `perspective: 'published'` — nigdy nie budujemy z wersji roboczych.
 */
export const sanityClient: SanityClient | null =
	contentSource === 'sanity'
		? createClient({
				projectId: sanityProjectId,
				dataset: sanityDataset,
				apiVersion: '2026-09-12',
				useCdn: false,
				perspective: 'published',
			})
		: null;
