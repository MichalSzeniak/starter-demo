/**
 * Portable Text → zwykły tekst. Do danych strukturalnych (FAQPage) i opisów.
 *
 * Celowo bez zależności: `@portabletext/toolkit` jest w drzewie tylko przechodnio,
 * a potrzebujemy jednej funkcji na 15 linii. Bloki inne niż `block` (nie ma ich
 * w naszej schemie) są pomijane.
 */

interface SpanLike {
	_type?: string;
	text?: string;
}

interface BlockLike {
	_type?: string;
	children?: readonly SpanLike[];
}

export function portableTextToPlain(blocks: readonly BlockLike[] | null | undefined): string {
	if (!blocks?.length) return '';
	return blocks
		.filter((block) => block._type === 'block')
		.map((block) =>
			(block.children ?? [])
				.map((child) => child.text ?? '')
				.join('')
				.trim(),
		)
		.filter(Boolean)
		.join('\n')
		.trim();
}
