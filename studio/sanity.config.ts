import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

// FAZA 2: tu wejdą typy dokumentów, obiekt `seo`, osiem typów sekcji
// oraz własna `structure.ts` z singletonami. Na razie Studio startuje puste.
const projectId = process.env['SANITY_STUDIO_PROJECT_ID'] ?? '';
const dataset = process.env['SANITY_STUDIO_DATASET'] ?? 'production';

export default defineConfig({
	name: 'default',
	title: 'Panel treści',
	projectId,
	dataset,
	plugins: [structureTool(), visionTool()],
	schema: {
		types: [],
	},
});
