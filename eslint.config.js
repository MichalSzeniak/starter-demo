import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.astro/**',
			'**/.sanity/**',
			'**/.wrangler/**',
			'.agents/**',
			'.claude/**',
			'web/src/lib/sanity/types.gen.ts',
		],
	},
	js.configs.recommended,
	tseslint.configs.recommended,
	astro.configs.recommended,
	astro.configs['jsx-a11y-recommended'],
	{
		rules: {
			// Preflight Tailwinda ustawia list-style: none, a Safari/VoiceOver gubi wtedy
			// semantykę listy. Jawne role="list" na ul/ol to znany, celowy fix — nie redundancja.
			'astro/jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
			// Przewijany w bok region bez focusowalnej treści (karuzela zdjęć) musi przyjmować
			// fokus, żeby dało się go przewinąć klawiaturą — axe: scrollable-region-focusable.
			// Dopuszczamy tabindex tylko na role="region" (z etykietą), nie ogólnie.
			'astro/jsx-a11y/no-noninteractive-tabindex': [
				'error',
				{ tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
			],
		},
	},
);
