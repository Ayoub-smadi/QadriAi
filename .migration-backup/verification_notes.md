# Verification Notes

- The Arabic-first public landing page, plant selector, image diagnosis flow, knowledge hub, expert control center, and mobile layouts were visually checked in the managed preview.
- The live agricultural storefront was verified after the catalog request settled. It renders two published products with images, prices in JOD, and add-to-cart controls.
- The persisted knowledge hub renders seven curated published reference items, including a regional growing-guidance item.
- The invalid shared-report route displays an explicit unavailable state until an expert review has finalized a report.
- The automated suite passed with 13 tests, 5 test files, and 1 intentional environment-dependent skip.
- The live cart flow was also exercised: a published irrigation-kit variant was added successfully, the cart count updated to one, and the cart drawer displayed the correct item, total, quantity controls, removal control, and secure-checkout handoff.

## Multimodal chat browser check — 2026-08-30
- `/engineer` loads without authentication and shows the text composer, attachment button, and microphone button.
- Arabic question `كيف أحافظ على الزيتون؟` appears in the user bubble.
- At the next check the assistant indicator was still loading, so the live proxy response path needs further verification.

## Chat response diagnosis — 2026-08-30
- The chat route had no browser-console exception, but the request stayed on the assistant loading state during the first live check.
- The model proxy catalog responds successfully from the sandbox; consultation preference was reordered to use the faster `gpt-5-mini` first.

## Live text retry — 2026-08-30
- After reloading `/engineer` with the faster model order, the Arabic question was submitted successfully and remained in the user bubble while the assistant indicator waited for completion.
