import { defineQuery } from 'groq';

/**
 * Wszystkie zapytania GROQ w jednym miejscu. `pnpm typegen` skanuje ten plik
 * i generuje typy wyników do `types.gen.ts` (nazwa zapytania + `Result`).
 *
 * Fragmenty są zwykłymi stałymi — TypeGen rozwiązuje proste interpolacje.
 */

/** Obraz z opisem i wymiarami. Wymiary są potrzebne do width/height w HTML (zero CLS). */
const IMAGE = /* groq */ `{
	_key,
	alt,
	hotspot,
	crop,
	asset->{
		_id,
		url,
		mimeType,
		"width": metadata.dimensions.width,
		"height": metadata.dimensions.height
	}
}`;

/** Odnośnik: wewnętrzny (do podstrony) albo zewnętrzny. */
const LINK = /* groq */ `{
	kind,
	href,
	newTab,
	page->{ "slug": slug.current }
}`;

const LABELED_LINK = /* groq */ `{
	_key,
	label,
	link ${LINK}
}`;

/** Tekst formatowany — odnośniki w markDefs rozwiązane jak wszędzie indziej. */
const RICH_TEXT = /* groq */ `[]{
	...,
	markDefs[]{
		...,
		_type == "link" => ${LINK}
	}
}`;

const SECTIONS = /* groq */ `sections[]{
	_key,
	_type,
	_type == "hero" => {
		heading,
		lead,
		image ${IMAGE},
		buttons[] ${LABELED_LINK}
	},
	_type == "textImage" => {
		heading,
		body ${RICH_TEXT},
		image ${IMAGE},
		imagePosition
	},
	_type == "features" => {
		heading,
		lead,
		items[]{ _key, title, description }
	},
	_type == "pricing" => {
		heading,
		lead,
		plans[]{
			_key,
			name,
			price,
			unit,
			description,
			includes,
			recommended,
			button ${LABELED_LINK}
		}
	},
	_type == "testimonials" => {
		heading,
		items[]{ _key, quote, author, role, avatar ${IMAGE} }
	},
	_type == "faq" => {
		heading,
		items[]{ _key, question, answer ${RICH_TEXT} }
	},
	_type == "gallery" => {
		heading,
		"layout": coalesce(layout, "grid"),
		images[] ${IMAGE}
	},
	_type == "contact" => {
		heading,
		lead,
		"showContactDetails": coalesce(showContactDetails, true),
		"showMap": coalesce(showMap, true)
	},
	_type == "cta" => {
		heading,
		lead,
		button ${LABELED_LINK}
	}
}`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
	*[_id == "siteSettings"][0]{
		companyName,
		tagline,
		nip,
		address,
		geo,
		phone,
		email,
		openingHours[]{ _key, days, closed, opens, closes },
		social[]{ _key, platform, url },
		logo ${IMAGE},
		defaultOgImage ${IMAGE},
		contactForm{
			consentLabel,
			privacyNotice,
			successMessage,
			"privacyPolicySlug": privacyPolicyPage->slug.current
		},
		analytics{ provider, domain, websiteId, scriptHost }
	}
`);

export const NAVIGATION_QUERY = defineQuery(/* groq */ `
	*[_id == "navigation"][0]{
		mainMenu[] ${LABELED_LINK},
		footerMenu[] ${LABELED_LINK}
	}
`);

/** Indeks stron: do getStaticPaths i do sitemapy (lastmod, wykluczenie noindex). */
export const PAGE_INDEX_QUERY = defineQuery(/* groq */ `
	*[_type == "page" && defined(slug.current)]{
		"slug": slug.current,
		_updatedAt,
		"noindex": seo.noindex == true
	}
`);

/** Przekierowania → plik _redirects dla Cloudflare. */
export const REDIRECTS_QUERY = defineQuery(/* groq */ `
	*[_type == "redirect" && defined(from) && defined(to)]{ from, to, permanent }
`);

export const PAGE_BY_SLUG_QUERY = defineQuery(/* groq */ `
	*[_type == "page" && slug.current == $slug][0]{
		_id,
		_updatedAt,
		title,
		"slug": slug.current,
		seo{
			metaTitle,
			metaDescription,
			noindex,
			ogImage ${IMAGE}
		},
		${SECTIONS}
	}
`);
