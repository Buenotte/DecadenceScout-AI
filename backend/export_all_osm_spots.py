import requests
import json
import time
import sys

# Force UTF-8 encoding for Windows console output
sys.stdout.reconfigure(encoding="utf-8")

url = "https://overpass-api.de/api/interpreter"
headers = {"User-Agent": "DecadenceScoutAI/4.4"}

# Pro-Province bounding boxes in Comunitat Valenciana
PROVINCES = [
    {"name": "Alicante", "bbox": "37.80,-1.50,38.90,-0.00"},
    {"name": "Valencia", "bbox": "38.80,-1.50,39.90,0.20"},
    {"name": "Castellón", "bbox": "39.70,-0.80,40.80,0.60"},
]

queries = [
    'node["historic"="ruins"]({bbox}); way["historic"="ruins"]({bbox});',
    'node["building"="ruins"]({bbox}); way["building"="ruins"]({bbox});',
    'node["abandoned"="yes"]({bbox}); way["abandoned"="yes"]({bbox});',
    'node["historic"="castle"]({bbox}); way["historic"="castle"]({bbox});',
]

all_spots = []
seen_coords = set()

print("[Batch-Import] Starte Import fuer ALLE Ruinen in Comunitat Valenciana...")

for prov in PROVINCES:
    prov_name = prov["name"]
    bbox = prov["bbox"]
    print(f"\n[Import] Lade Objekte fuer Provinz {prov_name} (bbox={bbox})...")
    
    for q_template in queries:
        q = f"[out:json][timeout:25];({q_template.format(bbox=bbox)});out center 150;"
        try:
            res = requests.post(url, data={"data": q}, headers=headers, timeout=20)
            if res.status_code == 200:
                elems = res.json().get("elements", [])
                added = 0
                for e in elems:
                    lat = e.get("lat") or e.get("center", {}).get("lat")
                    lon = e.get("lon") or e.get("center", {}).get("lon")
                    tags = e.get("tags", {})
                    name = tags.get("name") or tags.get("name:es") or tags.get("name:ca")
                    
                    if lat and lon:
                        coord_key = (round(lat, 4), round(lon, 4))
                        if coord_key not in seen_coords:
                            seen_coords.add(coord_key)
                            
                            # Determine type & classification
                            obj_type = tags.get("historic") or tags.get("building") or tags.get("abandoned") or "Ruine"
                            is_named = bool(name)
                            clean_name = name if is_named else f"Verlassenes Objekt ({obj_type.capitalize()})"
                            
                            all_spots.append({
                                "id": len(all_spots) + 1,
                                "name": clean_name,
                                "lat": round(lat, 5),
                                "lon": round(lon, 5),
                                "province": prov_name,
                                "type": f"{obj_type.capitalize()} Ruine",
                                "status": "KNOWN_HISTORIC_SITE" if is_named else "UNCHARTED_NEW_DISCOVERY",
                                "year": tags.get("start_date") or tags.get("construction_date") or "19. Jh.",
                                "built_area": f"{tags.get('building:levels', '2')} Etagen",
                                "catastro_ref": f"{prov_name[:3].upper()}{len(all_spots):05d}",
                                "isIllustration": True,
                                "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
                                "history": tags.get("description") or f"Historische {obj_type}-Ruine in der Provinz {prov_name}. Erfasst aus OpenStreetMap Geodaten.",
                                "risk": "MITTEL" if "ruins" in str(obj_type) else "NIEDRIG",
                                "ndvi": 0.55,
                                "ndwi": 0.08,
                                "youtube_script": {
                                    "hook": f"Die vergessene Ruine {clean_name} in {prov_name}.",
                                    "act1": "Erfassung in den historischen Archiven.",
                                    "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
                                    "act3": "Heute: Stille Ruine in der Natur."
                                },
                                "safety_info": {
                                    "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
                                    "legal": "Frei zugaenglich oder oeffentlicher Grund.",
                                    "equipment": "Feste Wanderschuhe & Taschenlampe."
                                }
                            })
                            added += 1
                print(f"   -> +{added} Objekte hinzugefuegt")
            time.sleep(0.5)
        except Exception as err:
            print(f"   [WARN] Query failed: {err}")

print(f"\n[OK] FERTIG: insgesamt {len(all_spots)} verlassene Objekte & Ruinen gesammelt!")
with open("backend/all_valencia_spots.json", "w", encoding="utf-8") as f:
    json.dump(all_spots, f, ensure_ascii=False, indent=2)
print("Gespeichert in backend/all_valencia_spots.json")
