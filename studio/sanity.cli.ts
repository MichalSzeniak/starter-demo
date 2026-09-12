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
});
