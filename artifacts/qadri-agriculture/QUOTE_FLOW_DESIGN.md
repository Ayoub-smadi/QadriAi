# Al-Qadri Smart Agriculture
## Quote-request flow and admin quote editor

### Design direction

**Layout paradigm:** guided workbench. The customer request is a calm, three-step consultation rather than a long checkout form. The admin surface is a split-pane operations desk: an actionable queue on the right, the selected quote workspace on the left.

**Mood:** botanical editorial. Keep the existing dark-green identity, but soften the working canvas with warm mineral neutrals and a single saffron accent for attention. The experience should feel like a knowledgeable local nursery, not a generic SaaS form.

**Typography:** Arabic-first `Tajawal` for all UI copy, with a compact monospace face such as `Space Mono` only for quote IDs, timestamps, and audit metadata. Use sentence case in English and natural Arabic phrasing rather than literal word-for-word translations.

**Palette recommendation:**

- Forest: `#063F33` for navigation, primary actions, and selected states
- Moss: `#6D8B62` for guidance and secondary status
- Saffron: `#C8893D` for pending attention and required follow-up
- Clay: `#B95D48` for destructive or overdue states
- Canvas: `#F4F0E8` for the quote workspace
- Surface: `#FBFAF6` for cards and form fields
- Ink: `#17342D` for primary text
- Quiet ink: `#687A72` for labels and helper copy

Use visible borders and soft tinted shadows. Avoid gradients and decorative imagery inside operational forms. Plant photography may appear in plant selection cards and the quote summary only.

---

## Shared behavior across all three routes

### Language and direction

- Default to Arabic and `dir="rtl"` for `/quotes`, `/quotes/request`, and `/quotes-admin`.
- Place an always-visible language switch in the page header: `العربية` / `English`.
- Switching language changes labels, helper text, validation messages, date formatting, and alignment without losing entered values.
- Plant names retain Arabic as the primary label and show the English name and scientific name as supporting text.
- Keep quote IDs, phone numbers, email addresses, and numeric quantities left-to-right using `dir="ltr"` where appropriate.
- Do not use emoji in labels, statuses, buttons, placeholders, empty states, or notifications.

### Shared feedback

- Use inline validation adjacent to the field, with an `aria-describedby` connection.
- Reserve a live region at the top of each page for mutation results. Announce success and failure in the active language.
- Save browser-local state on each meaningful interaction, not only on submit.
- Preserve unfinished customer drafts under a versioned key such as `qadri.quoteDraft.v1`.
- On a browser refresh, show a discreet “draft restored” message with a clear dismiss action.
- Confirm destructive actions with a modal dialog. The destructive action must be the visually quieter button.
- Use skeleton rows and field blocks for loading-like transitions; never rely on a spinner alone.

---

## `/quotes` — quote hub

### Purpose

Give visitors a fast choice between requesting a new plant quote and finding a previous request. This is a customer-facing landing surface, not a dashboard.

### Composition

1. **Header**
   - Qadri wordmark linked to the home route.
   - Page title: `طلبات عروض الأسعار` / `Quote requests`.
   - Language switch.
   - Secondary link to plant knowledge.

2. **Intro band**
   - Arabic headline: `لنزرع ما يناسب مكانك`
   - Supporting copy: `شاركنا تفاصيل المساحة والنباتات التي تفكر بها، وسنعود إليك بعرض واضح قابل للتنفيذ.`
   - English equivalent: `Let’s choose what fits your place.`
   - One primary action: `ابدأ طلب عرض سعر` / `Start a quote request`.
   - A small trust line: `يُحفظ الطلب على هذا الجهاز حتى ترسله.` / `Your draft stays on this device until you send it.`

3. **Three consultation principles**
   - `اختيار مناسب للمناخ`
   - `كميات وتسعير واضح`
   - `متابعة من فريق زراعي`
   Use numbered text markers rather than illustrations or emojis.

4. **Previous requests panel**
   - If local records exist: show a compact list with ID, requested date, plant count, and status.
   - Status labels: `مسودة`, `مرسل`, `قيد المراجعة`, `تم إرسال العرض`, `مقبول`, `مغلق`.
   - Actions: `فتح`, `متابعة الطلب`, and `حذف المسودة` where applicable.
   - If empty: composed empty state with a short explanation and a primary create button.

5. **Footer reassurance**
   - Contact channel and response expectation, for example: `يراجع الفريق الطلبات خلال يومي عمل.`
   - Do not promise a precise SLA unless the business confirms it.

### Hub interactions

- Clicking `Start a quote request` navigates to `/quotes/request`.
- A previous draft opens `/quotes/request?draft=<id>`.
- A submitted local request opens a read-only customer summary view within the same route, with `طلب عرض جديد` available.
- Delete draft requires confirmation and removes only that draft from local storage.

---

## `/quotes/request` — guided bilingual request

### Form model

```ts
type QuoteStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "quoted"
  | "accepted"
  | "closed";

type QuoteRequest = {
  id: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    preferredContact: "phone" | "whatsapp" | "email";
    country: "الأردن" | "فلسطين" | "مصر" | "قطر";
    city: string;
  };
  site: {
    spaceType: "home_garden" | "balcony" | "farm" | "commercial" | "public_landscape" | "other";
    areaValue?: number;
    areaUnit: "m2" | "donum" | "ft2";
    sunExposure: "full_sun" | "partial_shade" | "shade" | "unknown";
    irrigationAvailable: "yes" | "no" | "planning";
    plantingDate?: string;
    notes?: string;
  };
  plants: Array<{
    plantId: string;
    quantity: number;
    size?: "seedling" | "small" | "medium" | "mature";
    notes?: string;
  }>;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  }>;
  admin?: {
    internalNotes?: string;
    quotedItems?: Array<{
      plantId: string;
      quantity: number;
      unitPrice: number;
      lineNote?: string;
    }>;
    deliveryFee?: number;
    installationFee?: number;
    discount?: number;
    currency: "JOD" | "EGP" | "QAR" | "ILS";
    validUntil?: string;
    customerMessageAr?: string;
    customerMessageEn?: string;
  };
};
```

### Step pattern

Use a fixed progress rail on desktop and a compact progress header on mobile:

1. `المكان` / `Your space`
2. `النباتات` / `Plants`
3. `بيانات التواصل` / `Contact`

The current step has a filled forest marker, completed steps use a check icon, and upcoming steps remain outlined. The progress rail must expose `aria-current="step"` and not rely on color alone.

#### Step 1: Your space

Required:

- Space type: segmented controls with Arabic label and English sublabel.
- Country select from `countryLabels`.
- City text input.
- Sun exposure.
- Irrigation availability.

Optional:

- Area and unit.
- Intended planting date.
- Notes about access, soil, wind, or existing plants.

Inline guidance should update after country and space type are chosen. Example: for balcony, explain that container depth and load should be confirmed before recommending trees.

#### Step 2: Plants

Use `plantKnowledge` as the source of truth.

- Search input with Arabic and English matching.
- Filter chips for category and country suitability.
- Plant result rows with image, Arabic name, English name, scientific name, and one short suitability line.
- Selecting a plant adds a row to the request tray.
- Quantity uses a labelled numeric input with min `1`; do not make plus/minus controls the only input method.
- Optional size and plant-specific note.
- Show a selected-plant count and total quantity.
- Provide a clear `إزالة` / `Remove` action per row.

Recommended empty state: `ابحث باسم النبات أو اختر فئة للبدء` / `Search by plant name or choose a category to begin.`

#### Step 3: Contact

Required:

- Full name.
- Phone number.
- Preferred contact method.
- Consent checkbox: `أوافق على التواصل معي بخصوص هذا الطلب.` / `I agree to be contacted about this request.`

Optional:

- Email.
- Photo attachments for the space. Accept image files only, show file name and size, and provide remove actions. Browser-local persistence should use a size cap and a clear note that photos remain on this device.

### Review and submission

Before submission, show a review card with sections for space, plants, and contact. Every section has an `تعديل` / `Edit` button that returns to the relevant step without clearing later values.

Primary submit action:

- Arabic: `إرسال طلب عرض السعر`
- English: `Send quote request`

On submit:

1. Validate all required fields.
2. Generate a human-readable local ID such as `QDR-2025-0417`.
3. Set status to `submitted`.
4. Save the full record in `localStorage`.
5. Show a success state with the ID, timestamp, expected next step, and actions to copy the ID, view request, or start another request.

Never show the success state only as a toast. The confirmation must be the page content so it survives refresh and is announced to assistive technology.

### Draft handling

- Auto-save status is visible as text: `محفوظ على هذا الجهاز` / `Saved on this device`.
- If required fields are incomplete, the request remains a draft.
- `حفظ والعودة لاحقًا` / `Save and return later` returns to `/quotes`.
- `بدء من جديد` / `Start over` requires confirmation and clears the current draft only.

---

## `/quotes-admin` — admin quote editor

### Purpose

Provide a practical local-only queue for staff to triage incoming requests, prepare an itemized quote, and update status.

### Desktop layout

- **Top bar:** `إدارة عروض الأسعار` / `Quote administration`, local-storage indicator, language switch, and a `تصدير البيانات` / `Export data` action.
- **Queue rail:** filterable request list, approximately 320 px wide.
- **Editor canvas:** selected request details and quote controls.
- On mobile, queue and editor become stacked sections. Include a prominent `العودة إلى الطلبات` / `Back to requests` action.

### Queue rail

Controls:

- Search by request ID, name, phone, or plant name.
- Status filter.
- Country filter.
- Sort: newest, oldest, highest quantity.

Each row shows:

- Quote ID in monospace.
- Customer name.
- Arabic names of up to two selected plants, with a `+N` text label for more.
- Relative updated time plus a full date in a tooltip or description.
- Status badge with text.

Empty states:

- No requests: explain that customer submissions appear here and offer `إنشاء طلب تجريبي` only if a seeded demo mode exists.
- No filter results: `لا توجد نتائج بهذه الفلاتر` with a `مسح الفلاتر` action.

### Editor sections

1. **Request header**
   - ID, submitted date, current status select, customer name, preferred contact.
   - Status transitions:
     - `مرسل` → `قيد المراجعة`
     - `قيد المراجعة` → `تم إرسال العرض`
     - `تم إرسال العرض` → `مقبول` or `مغلق`
     - Any non-closed state → `مغلق`
   - Require confirmation when moving to `مغلق`.
   - Show a small audit line: `آخر تعديل محفوظ محليًا قبل ...`.

2. **Customer and site summary**
   - Read-only customer and site fields with `نسخ` / `Copy` actions for phone, email, and address-like city text.
   - Render plant suitability facts from `plantKnowledge` alongside each selected plant: light, water, and supported countries.

3. **Quote builder**
   - Editable line-item table: plant, quantity, unit price, line total, note, remove.
   - `إضافة بند مخصص` / `Add custom line` for delivery, soil preparation, pots, or installation.
   - Currency select defaults from country but remains editable.
   - Summary rows: subtotal, delivery, installation, discount, total.
   - Use numeric inputs with explicit currency labels. Format display values but preserve raw numbers for editing.
   - Validate non-negative monetary values and integer quantities.
   - Show a persistent `المجموع النهائي` / `Total` block, not only at the bottom of a long table.

4. **Customer message**
   - Bilingual textareas: Arabic first, English second.
   - Provide a short starter text button that inserts editable copy based on selected plants and city.
   - Include quote validity date.

5. **Internal notes**
   - Clearly labelled as private and never included in the customer-facing preview.

6. **Preview and actions**
   - A `معاينة العرض` / `Preview quote` button opens a modal or route-like sheet showing the customer-facing quote in Arabic-first order.
   - `حفظ التعديلات` / `Save changes` persists to browser-local storage.
   - `نسخ ملخص العرض` / `Copy quote summary` copies plain text for messaging.
   - `طباعة / حفظ PDF` / `Print / save PDF` invokes the browser print dialog with print styles.
   - `حذف الطلب` / `Delete request` is destructive, requires confirmation, and removes the selected request from local storage.

### Admin persistence

Use a single versioned local-storage collection:

```ts
{
  version: 1,
  requests: QuoteRequest[],
  selectedRequestId?: string
}
```

Write through a small storage adapter so parsing failures can fall back to a safe empty collection. Export JSON should include the schema version and all requests. Import should validate the version, show a clear error for malformed files, and ask for confirmation before replacing local data.

Because this is browser-local, show an always-visible note in the admin header: `هذه البيانات محفوظة في هذا المتصفح فقط.` / `This data is stored in this browser only.` Do not imply multi-user security, server backup, or real delivery.

---

## Accessibility checklist

- Set the page language and direction at the document level and update them when the language switch changes.
- Use a single `h1` per route and a logical heading order beneath it.
- Every input has a visible `<label>`; placeholders are not labels.
- Do not use color as the only status signal. Pair each status with text and, where useful, a small icon with an accessible label.
- Maintain visible `:focus-visible` rings with at least 3:1 contrast against adjacent colors.
- Ensure primary and destructive controls have clear Arabic and English accessible names.
- Segmented controls use a real radio group or buttons with `aria-pressed`; do not recreate controls from plain divs.
- Search results announce count changes through a polite live region without interrupting typing.
- Modal dialogs trap focus, restore focus to the trigger on close, and close with Escape.
- File inputs explain accepted types and size limits; errors identify the file by name.
- Numeric quantity and money inputs expose units in their label or description.
- On validation failure, focus the first invalid field and provide a summary link list for multiple errors.
- Touch targets should be at least 44 by 44 CSS pixels.
- Respect `prefers-reduced-motion`; transition opacity and transform only, and never make progress dependent on animation.
- Print output should omit admin controls, private notes, and browser-local warnings.

## Suggested acceptance criteria

1. A user can switch Arabic/English at any step without losing form data.
2. A request can be started, refreshed, restored, edited, submitted, and found again from `/quotes`.
3. Plant search is driven by `plantKnowledge`, including Arabic, English, category, and country suitability.
4. Admin can filter, open, edit, price, preview, print, copy, update status, export, and delete a request.
5. All mutations have an in-page success or error state and update the local list immediately.
6. Keyboard-only users can complete the customer flow and the admin quote editor.
7. No user-facing copy or control depends on emoji, hover alone, or color alone.