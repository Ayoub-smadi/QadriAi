# Findings: knowledge expansion

## Current repository

The current `knowledgeItems` table stores one item per record with category, Arabic/English names, scientific name, summaries, and a JSON `growingData` field. The current seed is a small hand-authored tree dataset in `server/knowledgeSeed.ts`. The Knowledge page currently displays search, a country selector, and cards; it does not yet have a dedicated growth-stage image model.

## Candidate sources

1. GBIF Occurrence API: https://techdocs.gbif.org/en/openapi/v1/occurrence
   - Provides occurrence search, species multimedia endpoints, geographic filters, and asynchronous bulk downloads.
   - Search results are paginated up to 300 records and have a 100,000-record query limit; bulk downloads require a registered GBIF user.
2. GBIF Occurrence Image API: https://techdocs.gbif.org/en/openapi/images
   - Provides cached image URLs, but image licenses may be more restrictive than occurrence data. Each multimedia record must be checked for license and attribution before reuse.
3. Plants of the World Online (Kew): https://powo.science.kew.org/
   - Provides plant names, synonyms, distributions, descriptions, and images. Kew terms must be checked before automated reuse or bulk mirroring.
4. Wikimedia Commons reuse guidance: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia
   - Images have file-specific licenses. Reuse may require attribution, license links, and share-alike compliance; each file's license must be stored with the asset.
5. FAO Crop Calendar: https://cropcalendar.apps.fao.org/
   - Provides crop-calendar information for over 100 crops in over 50 countries, useful for cultivated crops but not sufficient for a 4,000-species ornamental/woody catalogue.
6. Regional checklists are incomplete as a single horticultural source. A 2026 Palestine checklist reports 1,710 taxa, while Qatar and Jordan sources are separate floristic checklists and do not by themselves establish garden suitability or growth-stage images.

## Important scope constraint

A trustworthy catalogue of more than 4,000 plants can be built from taxonomic and occurrence sources, but it cannot honestly claim that every item is suitable for all five countries, nor can it guarantee real seed-to-adult photographs for every item from open sources. The implementation should therefore store per-country suitability as `native`, `cultivated`, `ornamental`, `trial`, or `not_recommended`, attach source/license metadata per image, and distinguish real lifecycle photos from generated educational illustrations or missing stages.

## Recommended architecture direction

Add structured JSON or normalized tables for plant type, per-country suitability, lifecycle stages, image URLs, photographer/source, license, attribution, and confidence/review state. Import a validated species list first, then enrich records in batches. Use lazy-loaded images and pagination/search rather than rendering thousands of cards at once. Do not publish records as fully reviewed until the source, suitability, and image license have been checked.

7. iNaturalist API: https://api.inaturalist.org/v1/docs/
   - Supplies taxon and observation data plus photos, but API usage is throttled (maximum 100 requests/minute, recommended 60/minute and under 10,000/day).
   - Photos on `inaturalist-open-data` are open-licensed; photos on `static.inaturalist.org` are not necessarily open-licensed. The photo domain and license must be retained per image.
   - This is useful for adult/flower/leaf observations, but it does not guarantee a full seed-to-adult lifecycle sequence for each species.

## Decision needed before bulk implementation

The user must choose whether the catalogue should include only species with verified cultivation evidence in at least one target country, or also ornamental/exotic species that can grow under controlled conditions. The user must also approve a two-track image policy: real licensed photographs where available, and clearly labeled educational lifecycle illustrations where seed/seedling/juvenile/adult photographs are unavailable. Without that policy, claiming 4,000 species with complete real lifecycle photography would be inaccurate and may violate image licenses.
