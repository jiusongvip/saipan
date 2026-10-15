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

## Four-theme hero

Hero images: existing Saipan lagoon aerial, one-to-one consultation, American flag, airplane wing. Manual theme tabs, previous/next buttons, keyboard arrow support and touch swipe; reduced-motion preference removes transitions. All active homepage languages use localized theme captions. Flag slide refers to birth registration and applicable documentation rather than promising nationality.

Additional downloaded illustrative photos:
- american-flag.jpg: https://images.unsplash.com/photo-1508433957232-3107f5fd5995
- flight-wing.jpg: https://images.unsplash.com/photo-1436491865332-7a61a109cc05

TypeScript, 50-page demo build, 969 links and generated-site audit passed. Browser interaction QA remains unavailable.

## Automatic hero and explicit explanations

Hero now advances every 6.5 seconds and synchronizes each image with its own localized headline and short description. Copy explicitly covers island rest alongside medical visits, one-to-one communication, nationality rules and birth documents, and flight/appointment planning. No nationality or route availability guarantee is added. Pause/resume control, hover/focus suspension, offscreen/tab-hidden suspension and reduced-motion handling are included. Manual navigation and swiping remain available.

## Consultation entry

Removed the hero consultation button. Added a persistent right-side online consultation link with localized simple copy, targeting the existing #consult section. On mobile it sits at the lower right. Its label and href remain directly editable in EditorialHome.

## Expanded consultation invitation

Replaced the thin right-side entry with an immediately visible consultation card: branded header, welcoming message, three topic links and a primary contact action. Starts expanded, supports minimizing and reopening, and collapses when a link takes the visitor to the existing contact area. All three language homepages have localized copy. No live-agent presence or unconnected message submission is simulated.

## Concise promotional copy

Shortened the Chinese headlines to four direct themes: 海岛度假 / 安心求子; 专业医疗 / 温暖相伴; 塞班出生 / 美国公民？; 飞向塞班 / 好孕启程. Citizenship remains phrased as a visitor question, with qualification in the accompanying caption. Updated related section headings and consultation invitation to more direct marketing language, with Traditional Chinese and English counterparts. No success guarantee or unconditional nationality promise added.

## Reference-inspired discovery modules

Reviewed https://globalbaby8.com/ for content organization. Added four quick links for budgets, entry, birth documents and flights; a staggered lifestyle gallery; a local, no-data-collection preparation checklist with treatment/birth/exploration and accommodation preferences; and native FAQ disclosures linked to existing detailed guides. Replaced the older three-link resource section to limit repetition. All three homepage languages supported. Stock photographs are explicitly labeled illustrative; no property affiliation, prices, patient cases or current eligibility assertions are invented.

Additional illustrative image sources:
- stay-room.jpg: https://images.unsplash.com/photo-1611892440504-42a792e24d32
- island-pool.jpg: https://images.unsplash.com/photo-1540541338287-41700207dee6
- daily-meals.jpg: https://images.unsplash.com/photo-1498837167922-ddd27525d352

Verification: TypeScript, 50-page build, 1,013 internal links and generated-site audit passed. Browser visual/interaction QA remains unavailable.

## Six primary navigation groups

Grouped visible content into Why Saipan, Programs, Medical care, Costs & services, Travel guide and Birth & documents. Article links have short localized labels; hidden/unbuilt pages stay excluded. Birth/document navigation falls back to the localized homepage FAQ anchor if no dedicated guide exists. Corrected the misleading Simplified Chinese labels, localized online consultation CTA, added dropdown indicators, single-open menus, outside-click/Escape dismissal and responsive wrapping. TypeScript, 60 existing tests, demo build and link audit passed before final fallback adjustment; final build/link check also passed. GitHub branch creation continues to fail with integration 403.

## Four-second hero

Changed automatic advancement to 4,000 ms. Pointer hover no longer stops rotation, so a cursor resting on the hero does not make autoplay appear broken. Explicit pause, keyboard focus, reduced-motion, hidden-tab and offscreen handling remain unchanged.

## Destination page redesign

Added DestinationPage to the existing English/Traditional Chinese why-saipan pages and Simplified Chinese destination-comparison guide (no new unapproved publication route). Shared editorial direction: full-width island hero, three concise advantages, flight/consultation photo overlap, a non-numeric destination comparison checklist, lifestyle gallery and four planning stages. Original MDX details remain available in a disclosure; metadata, publication gates and form behavior are retained. No prices, route availability, clinical superiority or nationality guarantees invented.

Narrow-screen consultation card occupies document flow rather than covering the hero. Navigation now highlights the parent group of the current page and uses clearer full-width accordion summaries on mobile. Added a reusable local preview bundler for homepage/destination and language selection.

Validation: TypeScript and all 60 existing tests passed. Demo build produced 50 pages; 1,433 links and generated-site audit passed. Supported browser QA is unavailable, so visual/interaction rendering remains unverified.

## Costs and services page

Added PricingPage to existing en/zh-hant pricing routes and the Simplified Chinese cost-breakdown guide. Shared editorial styling includes a consultation-image hero, four photographic budget categories, service-scope questions, included/separately-charged verification table and native FAQs. Added a browser-local consultation brief builder with need, travel-party and accommodation selections; changes immediately update the visible brief, with copy-to-clipboard and an honest fallback message. No quotation amount or unverified package inclusion is invented. Existing MDX detail stays available in disclosure, retaining metadata/publication/form gates.

Preview now supports Home, Destination and Costs in all three languages. TypeScript, 60 existing tests, 50-page demo build, 1,443 links and generated-site audit passed. Browser visual and clipboard interaction QA remain unverified due to unavailable supported browser capability.
