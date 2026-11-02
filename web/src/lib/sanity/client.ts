import { createClient, type SanityClient } from '@sanity/client';
import { DEMO_CONTENT, LOCAL_CONTENT, SANITY_DATASET, SANITY_PROJECT_ID } from 'astro:env/server';

/**
 * Skąd biorą się treści.
 *
 * - `sanity` — jest SANITY_PROJECT_ID, pobieramy z Content Lake przy buildzie.
 * - `local`  — LOCAL_CONTENT=true: wariant bez CMS-u, treści klienta z web/src/tresci/
 *              (edytuje je deweloper, nie klient).
 * - `demo`   — brak projektu. W `astro dev` włącza się samo (z ostrzeżeniem),
 *              w `astro build` wymaga jawnego DEMO_CONTENT=true, żeby treści
 *              demo nie trafiły przez pomyłkę na produkcję klienta.
 */
export type ContentSource = 'sanity' | 'local' | 'demo';

function resolveContentSource(): ContentSource {
	if (LOCAL_CONTENT) {
		// Dwa źródła naraz to prawie na pewno pomyłka przy przejściu na panel —
		// lepiej przerwać build, niż po cichu zbudować stronę ze starych plików.
		if (SANITY_PROJECT_ID) {
			throw new Error(
				'Ustawione jednocześnie LOCAL_CONTENT=true i SANITY_PROJECT_ID — wybierz jedno źródło treści.',
			);
		}
		if (DEMO_CONTENT) {
			console.warn('[treści] LOCAL_CONTENT=true — DEMO_CONTENT=true zignorowane.');
		}
		return 'local';
	}
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
				'Ustaw zmienną środowiskową (patrz web/.env.example),',
				'LOCAL_CONTENT=true dla strony bez CMS-u (treści w web/src/tresci/)',
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
