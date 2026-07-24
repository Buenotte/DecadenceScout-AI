import requests

url = "https://overpass-api.de/api/interpreter"
headers = {"User-Agent": "DecadenceScoutAI/4.4"}
query = """
[out:json][timeout:30];
(
  node["historic"="ruins"](37.80,-1.50,40.80,0.60);
  way["historic"="ruins"](37.80,-1.50,40.80,0.60);
  node["building"="ruins"](37.80,-1.50,40.80,0.60);
  way["building"="ruins"](37.80,-1.50,40.80,0.60);
  node["abandoned"="yes"](37.80,-1.50,40.80,0.60);
  way["abandoned"="yes"](37.80,-1.50,40.80,0.60);
);
out center 300;
"""

try:
    res = requests.post(url, data={"data": query}, headers=headers, timeout=25)
    print("Status code:", res.status_code)
    elements = res.json().get("elements", [])
    print(f"Echte OSM-Ruinen in Comunitat Valenciana gefunden: {len(elements)}")
    named = [e for e in elements if "name" in e.get("tags", {})]
    print(f"Davon mit eigenem Namen: {len(named)}")
    for e in named[:15]:
        lat = e.get("lat") or e.get("center", {}).get("lat")
        lon = e.get("lon") or e.get("center", {}).get("lon")
        print(f" - {e['tags']['name']} ({lat}, {lon})")
except Exception as e:
    print("Error:", e)
