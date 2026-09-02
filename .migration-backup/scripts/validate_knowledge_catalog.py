import json
from collections import Counter
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "client/public/data/gbif-catalog.json"
items = json.loads(path.read_text(encoding="utf-8"))
keys = [item.get("speciesKey") for item in items]
assert len(items) > 4000
assert len(items) == len(set(keys))
assert all(item.get("scientificName") and item.get("countries") and item.get("sourceUrl") for item in items)
country_counts = Counter(country for item in items for country in item["countries"])
image_count = sum(1 for item in items if item.get("image", {}).get("url"))
license_count = sum(1 for item in items if item.get("image", {}).get("license"))
summary = {
    "records": len(items),
    "unique_species_keys": len(set(keys)),
    "image_records": image_count,
    "licensed_image_records": license_count,
    "fallback_records": len(items) - image_count,
    "country_record_counts": dict(country_counts),
    "family_count": len({item.get("family") for item in items if item.get("family")}),
}
Path(__file__).resolve().parents[1].joinpath("knowledge-catalog-validation.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False))
