import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
	api: {
		projectId: process.env['SANITY_STUDIO_PROJECT_ID'] ?? '',
		dataset: process.env['SANITY_STUDIO_DATASET'] ?? 'production',
	},
	deployment: {
		// Wersje paczek Sanity pinujemy w package.json i podnosimy świadomie —
		// automatyczna podmiana w locie psuje powtarzalność buildów.
		autoUpdates: false,
	},
	typegen: {
		// Schema jest tutaj, ale zapytania GROQ mieszkają w web/. Typy lądują
		// w web/, żeby strona nie musiała zależeć od paczki `sanity`.
		// Uwaga: sanity-typegen.json jest przestarzały — konfiguracja idzie tutaj.
		path: '../web/src/**/*.ts',
		schema: 'schema.json',
		generates: '../web/src/lib/sanity/types.gen.ts',
	},
});
