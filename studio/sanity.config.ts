import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes, singletonTypeNames } from './schemaTypes';
import { structure } from './structure';

const projectId = process.env['SANITY_STUDIO_PROJECT_ID'] ?? '';
const dataset = process.env['SANITY_STUDIO_DATASET'] ?? 'production';

// Vision to konsola GROQ dla dewelopera. Klient nie ma powodu jej widzieć,
// więc wpinamy ją wyłącznie w trybie deweloperskim.
const isDev = process.env['NODE_ENV'] !== 'production';

/** Akcje, które przy singletonach nie mają sensu i mogłyby zepsuć stronę. */
const SINGLETON_FORBIDDEN_ACTIONS = ['delete', 'duplicate', 'unpublish'];

export default defineConfig({
	name: 'default',
	title: 'Panel treści',
	projectId,
	dataset,
	plugins: [structureTool({ structure }), ...(isDev ? [visionTool()] : [])],
	schema: {
		types: schemaTypes,
		// Singletony powstają wyłącznie przez strukturę panelu, nie przez „+”.
		templates: (prev) =>
			prev.filter((template) => !singletonTypeNames.includes(template.schemaType)),
	},
	document: {
		// Klient nie usunie ani nie zduplikuje ustawień strony czy nawigacji.
		actions: (prev, context) =>
			singletonTypeNames.includes(context.schemaType)
				? prev.filter((action) => !SINGLETON_FORBIDDEN_ACTIONS.includes(action.action ?? ''))
				: prev,
		newDocumentOptions: (prev) =>
			prev.filter((item) => !singletonTypeNames.includes(item.templateId)),
	},
});
