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
