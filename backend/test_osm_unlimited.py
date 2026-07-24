import requests

url = "https://overpass-api.de/api/interpreter"
headers = {"User-Agent": "DecadenceScoutAI/4.4"}
query = """
[out:json][timeout:60];
(
  node["historic"="ruins"](37.80,-1.50,40.80,0.60);
  way["historic"="ruins"](37.80,-1.50,40.80,0.60);
  relation["historic"="ruins"](37.80,-1.50,40.80,0.60);

  node["building"="ruins"](37.80,-1.50,40.80,0.60);
  way["building"="ruins"](37.80,-1.50,40.80,0.60);

  node["abandoned"="yes"](37.80,-1.50,40.80,0.60);
  way["abandoned"="yes"](37.80,-1.50,40.80,0.60);

  node["disused"="yes"](37.80,-1.50,40.80,0.60);
  way["disused"="yes"](37.80,-1.50,40.80,0.60);

  node["historic"="castle"](37.80,-1.50,40.80,0.60);
  way["historic"="castle"](37.80,-1.50,40.80,0.60);
);
out center;
"""

print("Rufe ALLE verlassenen Objekte & Ruinen in Comunitat Valenciana ab...")
try:
    res = requests.post(url, data={"data": query}, headers=headers, timeout=50)
    print("Status code:", res.status_code)
    elements = res.json().get("elements", [])
    print(f"GESAMT-ANZAHL echte verlassene Objekte gefunden: {len(elements)}")
    named = [e for e in elements if "name" in e.get("tags", {})]
    print(f"Davon mit eigenem Namen: {len(named)}")
except Exception as e:
    print("Error:", e)
