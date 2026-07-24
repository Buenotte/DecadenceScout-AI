import json
import re

print("[Inject] Lade 472 echte Spots aus backend/all_valencia_spots.json...")
with open("backend/all_valencia_spots.json", "r", encoding="utf-8") as f:
    new_spots = json.load(f)

print(f"[Inject] Gelandet: {len(new_spots)} echte Objekte.")

app_content = open("src/App.jsx", "r", encoding="utf-8").read()

start_marker = "const ALL_SPOTS = ["
end_marker = "// Haversine distance calculation"

idx_start = app_content.find(start_marker)
idx_end = app_content.find(end_marker)

if idx_start == -1 or idx_end == -1:
    print("[ERROR] Markers in App.jsx nicht gefunden!")
    exit(1)

js_spots_str = json.dumps(new_spots, ensure_ascii=False, indent=2)
new_all_spots_decl = f"const ALL_SPOTS = {js_spots_str};\n\n\n"

updated_app = app_content[:idx_start] + new_all_spots_decl + app_content[idx_end:]

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(updated_app)

print(f"[OK] App.jsx ERFOLGREICH mit {len(new_spots)} echten Objekten aktualisiert!")
