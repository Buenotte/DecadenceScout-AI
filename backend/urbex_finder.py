"""
Agent 1: GIS & Spectral Scout fuer DekadenzScout AI.
Fuhrt Sentinel-2 Spektralanalyse (NDVI & NDWI) durch und exportiert gefundene Ruinen als KML.
"""
import pandas as pd
import simplekml
from anti_hallucination import filter_spots_by_radius
from known_spots_importer import KnownSpotsImporter


DEMO_SPECTRAL_SPOTS = [
    {"id": 1, "name": "Sanatorio de Aigues de Busot (Alicante)",
     "lat": 38.5031, "lon": -0.4132, "province": "Alicante",
     "ndvi": 0.58, "ndwi": 0.12, "type": "Sanatorium", "status": "KNOWN_HISTORIC_SITE"},
    {"id": 2, "name": "Colonia de Santa Eulalia (Sax)",
     "lat": 38.5689, "lon": -0.8542, "province": "Alicante",
     "ndvi": 0.49, "ndwi": 0.05, "type": "Arbeitersiedlung", "status": "KNOWN_HISTORIC_SITE"},
    {"id": 3, "name": "Geister-Villa San Miguel",
     "lat": 37.9781, "lon": -0.7892, "province": "Alicante",
     "ndvi": 0.62, "ndwi": 0.28, "type": "Luxusvilla", "status": "UNCHARTED_NEW_DISCOVERY"},
    {"id": 4, "name": "Verlassenes Kurhotel Jerica",
     "lat": 39.9121, "lon": -0.4912, "province": "Castellon",
     "ndvi": 0.55, "ndwi": 0.18, "type": "Thermalhotel", "status": "UNCHARTED_NEW_DISCOVERY"},
    {"id": 5, "name": "Reisfabrik Sueca Ruine",
     "lat": 39.2021, "lon": -0.3112, "province": "Valencia",
     "ndvi": 0.51, "ndwi": 0.08, "type": "Industriegebaude", "status": "KNOWN_HISTORIC_SITE"},
    {"id": 6, "name": "Palacio Abandonado Orihuela",
     "lat": 38.0849, "lon": -0.9436, "province": "Alicante",
     "ndvi": 0.44, "ndwi": 0.07, "type": "Palast", "status": "KNOWN_HISTORIC_SITE"},
    {"id": 7, "name": "Finca Fantasma Gandia",
     "lat": 38.9681, "lon": -0.1817, "province": "Valencia",
     "ndvi": 0.67, "ndwi": 0.09, "type": "Finca", "status": "UNCHARTED_NEW_DISCOVERY"},
    {"id": 8, "name": "Manicomio Provincial Valencia",
     "lat": 39.4450, "lon": -0.3590, "province": "Valencia",
     "ndvi": 0.53, "ndwi": 0.14, "type": "Psychiatrie", "status": "KNOWN_HISTORIC_SITE"},
]


def run_spectral_analysis(
    center_lat: float = 38.3452,
    center_lon: float = -0.4815,
    radius_km: float = 30.0,
    output_kml: str = "valencia_region_urbex_map.kml"
) -> pd.DataFrame:
    print(f"\n[Agent 1 - GIS Scout] Spektralanalyse: {radius_km} km Radius um [{center_lat}, {center_lon}]")

    # 1. Haversine-Filter
    valid = filter_spots_by_radius(DEMO_SPECTRAL_SPOTS.copy(), center_lat, center_lon, radius_km)

    # 2. In DataFrame umwandeln
    df = pd.DataFrame(valid)
    if df.empty:
        print("[INFO] Keine Objekte im Radius gefunden.")
        return df

    # 3. NDVI / NDWI Schwellenwerte anwenden (min. 0.40 fuer Vegetation/Wasser)
    df = df[(df["ndvi"] >= 0.40) | (df["ndwi"] >= 0.10)]
    print(f"[Filter] Nach Spektral-Check: {len(df)} Objekte")

    # 4. KML erzeugen
    kml = simplekml.Kml()
    for _, row in df.iterrows():
        pnt = kml.newpoint(name=row["name"])
        pnt.coords = [(row["lon"], row["lat"])]
        pnt.description = (
            f"Provinz: {row['province']}\n"
            f"Typ: {row['type']}\n"
            f"Status: {row['status']}\n"
            f"NDVI: {row['ndvi']} | NDWI: {row['ndwi']}\n"
            f"Distanz: {row.get('distance_km', 'N/A')} km"
        )
        if row["status"] == "UNCHARTED_NEW_DISCOVERY":
            pnt.style.iconstyle.color = simplekml.Color.gold
        else:
            pnt.style.iconstyle.color = simplekml.Color.blue

    kml.save(output_kml)
    print(f"[OK] KML gespeichert: {output_kml} ({len(df)} Orte)")
    return df


if __name__ == "__main__":
    df = run_spectral_analysis(center_lat=38.3452, center_lon=-0.4815, radius_km=30.0)
    if not df.empty:
        print("\nGefundene Objekte:")
        print(df[["name", "province", "status", "ndvi", "ndwi", "distance_km"]].to_string(index=False))
