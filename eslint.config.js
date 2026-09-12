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
);
