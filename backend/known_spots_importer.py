"""
Open-Source Importer fuer bekannte Ruinen in der Comunitat Valenciana.
Quellen: OpenStreetMap Overpass API, Wikidata Despoblados.
"""
import requests
from anti_hallucination import validate_geofence


class KnownSpotsImporter:
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"

    def fetch_osm_ruins(self, bbox: str = "37.80,-1.50,40.80,0.60") -> list:
        print(f"[KnownSpots Importer] OpenStreetMap Import fuer Comunitat Valenciana (bbox={bbox})...")
        query = f"""
        [out:json][timeout:30];
        (
          node["historic"="ruins"]({bbox});
          way["historic"="ruins"]({bbox});
          node["building"="ruins"]({bbox});
          way["building"="ruins"]({bbox});
          node["abandoned"="yes"]({bbox});
          way["abandoned"="yes"]({bbox});
        );
        out body 50;
        >;
        out skel qt;
        """
        try:
            res = requests.post(self.OVERPASS_URL, data={"data": query}, timeout=25)
            res.raise_for_status()
            elements = res.json().get("elements", [])
            spots = []
            for elem in elements:
                lat = elem.get("lat") or elem.get("center", {}).get("lat")
                lon = elem.get("lon") or elem.get("center", {}).get("lon")
                tags = elem.get("tags", {})
                name = tags.get("name", "Unbenannte Ruine")
                if lat and lon and validate_geofence(lat, lon):
                    spots.append({
                        "name": name, "lat": lat, "lon": lon,
                        "type": tags.get("historic", tags.get("building", "ruins")),
                        "status": "KNOWN_HISTORIC_SITE",
                        "source": "OpenStreetMap"
                    })
            print(f"[OK] {len(spots)} bekannte Ruinen aus OSM importiert.")
            return spots
        except Exception as e:
            print(f"[WARN] OSM Import fehlgeschlagen ({e}), verwende Fallback-Daten.")
            return self._fallback_spots()

    def _fallback_spots(self) -> list:
        return [
            {"name": "Colonia de Santa Eulalia (Sax)", "lat": 38.5689, "lon": -0.8542,
             "type": "historic", "status": "KNOWN_HISTORIC_SITE", "source": "fallback"},
            {"name": "Sanatorio de Aigues (Alicante)", "lat": 38.5031, "lon": -0.4132,
             "type": "historic", "status": "KNOWN_HISTORIC_SITE", "source": "fallback"},
            {"name": "Reisfabrik Sueca (Valencia)", "lat": 39.2021, "lon": -0.3112,
             "type": "ruins", "status": "KNOWN_HISTORIC_SITE", "source": "fallback"},
        ]


if __name__ == "__main__":
    importer = KnownSpotsImporter()
    spots = importer.fetch_osm_ruins()
    print(f"Erste 3 Ergebnisse: {spots[:3]}")
