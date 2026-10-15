# Homepage editorial refresh

The root Chinese marketing homepage uses warm ivory, deep lagoon green and blush, with serif display headings, an arched editorial photograph, quieter feature rows, a laboratory image, an island feature, a four-stage journey and native FAQ disclosures. Existing content routes, conditional links, multilingual pages and form handling remain unchanged.

## Image sources

Downloaded locally from Unsplash image CDN (photographic illustrations, not clinic personnel or facilities):
- couple-editorial.jpg: https://images.unsplash.com/photo-1573497620053-ea5300f94f21
- care-consultation.jpg: https://images.unsplash.com/photo-1576091160399-112ba8d25d1d
- laboratory-care.jpg: https://images.unsplash.com/photo-1579154204601-01588f351e67

The existing Saipan lagoon aerial is reused. No invented doctors, patient quotes, awards or success rates were added.

## Verification

TypeScript check passed; all 60 existing tests passed using node --import tsx --test; demo Astro build produced 50 pages. Browser visual QA was unavailable in this environment. Production build retains the existing publication gates. Root homepage layout has explicit 1100, 900 and 600px responsive rules; other language homepages retain their existing structure.

## Second pass: image-led multilingual homepage

Replaced the root-only marketing page with EditorialHome shared by the root, zh-hans, zh-hant and en home routes. Reduced homepage prose to short editorial headings, captions and navigation. The homepage now combines a full-bleed family image, staggered photo portals, overlapping care/lab imagery, a full-width Saipan landscape with an inset panel, a compact four-step strip and resource links. Language-specific copy and English typography are provided; article and service pages remain available through build-verified links. Existing metadata, noindex and form gates are preserved.

Additional illustrative Unsplash sources:
- family-moment.jpg: https://images.unsplash.com/photo-1511895426328-dc8714191300
- quiet-botanical.jpg: https://images.unsplash.com/photo-1497250681960-ef046c08a56e

Verification: TypeScript, 60 existing tests, 50-page demo build, 957 internal links and generated-site audit passed. Browser rendering remains unverified because the supported browser QA capability is unavailable.
