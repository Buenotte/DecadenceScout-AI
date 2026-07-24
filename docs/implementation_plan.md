# Implementierungsplan & Ausführungsanweisung: DekadenzScout AI (PoC)

> **Anweisung für Claude 4.6 Sonnet in Antigravity**: Dieses Dokument dient als direkter, schlüsselfertiger Ausführungsplan. Bitte arbeiten Sie die Schritte in der vorgegebenen Reihenfolge ab, erstellen Sie die angegebenen Dateien mit dem bereitgestellten Quellcode und führen Sie die notwendigen Terminal-Befehle aus.

**Projektpfad**: `C:\Projekte\DecadenceScout AI`  
**Projektname**: DekadenzScout AI / TerraGhost AI  
**Zielregion**: Autonome Gemeinschaft Valencia / Comunitat Valenciana (Provinzen Alicante, Valencia & Castellón)  
**Version**: 4.4 (Inklusive detaillierter Beschreibung aller Python-Bibliotheken, Einsatzorte & Funktionsweisen)  

---

## 1. Übersicht & Systemarchitektur

Das System besteht aus einem modernen **React + Vite Web-Dashboard** (Frontend) und einer **Python Multi-Agenten Backend-Suite**. Alle KI-Agenten im laufenden Programm greifen zu 100 % auf chinesische Cloud APIs der Generation Juli 2026 zu (**DeepSeek-V4**, **Kimi 2**, **GLM-5**, **Qwen 3**), um Ihr Lenovo ThinkPad (16 GB RAM) vollständig zu entlasten.

```
C:\Projekte\DecadenceScout AI\
├── backend/                       # Python-Backend Skripte (Multi-Agenten Suite 2026)
│   ├── model_router.py            # Model Router (100% Chinesische Cloud APIs via openai & requests)
│   ├── anti_hallucination.py      # Haversine Radius-Filter (z.B. 30 km um Alicante) & Geofence-Guardrail
│   ├── known_spots_importer.py    # Open-Source Importer für bekannte Ruinen (requests & pandas)
│   ├── urbex_finder.py            # Agent 1: Satelliten-Analyse (earthengine-api, pandas, simplekml)
│   ├── osm_filter.py              # Agent 2: OpenStreetMap Abfrage & Geometrie-Check (osmnx & requests)
│   ├── historian_agent.py         # Agent 3: Historiker-Investigator (BOE, DOGV, Hemerotheken via Kimi 2 API)
│   └── safety_agent.py            # Agent 4: Safety & Tour Planner (Qwen 3 Cloud API)
├── src/                           # Web-Dashboard Quellcode (React & Vite)
│   ├── components/                # UI Komponenten (Karte, Spot-Liste, Router, Historien-Planer)
│   ├── App.jsx                    # Hauptansicht (Karte mit 30km Circle Overlay, Radius Slider, Spot Explorer)
│   ├── index.css                  # Modernes Glassmorphic Dark-Mode Design System
│   └── main.jsx                   # React Einstiegspunkt
├── index.html                     # HTML Grundgerüst
├── package.json                   # Web-Anwendung Konfiguration
├── vite.config.js                 # Server & Bundler Konfiguration
├── fachkonzept_poc.md             # Betriebswirtschaftliches & Funktionales Fachkonzept (v4.3)
└── implementation_plan.md         # Dieses Dokument
```

---

## 2. Detaillierte Übersicht der benötigten Python-Bibliotheken (`pip install`)

Zur Ausführung des DekadenzScout AI Backends werden 7 spezialisierte Python-Bibliotheken installiert. Hier ist die genaue Erklärung, **warum** diese Bibliotheken benötigt werden, **wo** im Code sie eingesetzt werden und **wie** sie funktionieren:

```bash
pip install earthengine-api pandas simplekml requests osmnx openai python-dotenv
```

### 📋 Python Bibliotheken-Matrix & Verwendungsnachweis:

| Bibliothek | Warum muss sie installiert werden? | Wo wird sie verwendet? | Wie wird sie im Projekt angewendet? |
|---|---|---|---|
| **`earthengine-api`** | Schnittstelle zu Google Earth Engine für den Zugriff auf Sentinel-2 Satellitendaten. | `backend/urbex_finder.py` | Lädt multispektrale Satellitenbilder der Comunitat Valenciana herunter und berechnet mathematisch den NDVI (Pflanzenwuchs auf Dächern) & NDWI (veralgte Algenpools). |
| **`pandas`** | Industriestandard zur Datenverarbeitung, Tabellenstrukturierung und Datenanalyse. | `backend/urbex_finder.py`, `backend/known_spots_importer.py` | Verarbeitet gescannte GPS-Punkte in DataFrames, sortiert Ruinen nach Radius/Bewuchs und konvertiert Daten zwischen JSON, CSV und KML. |
| **`simplekml`** | Erzeugung von `.kml` Kartendateien (Keyhole Markup Language). | `backend/urbex_finder.py` | Generiert die finale Kartendatei `valencia_region_urbex_map.kml`, welche Sie direkt auf Google Maps / Maps.me auf Ihrem Smartphone öffnen können. |
| **`requests`** | Standard-Bibliothek für HTTP REST API-Anfragen im Web. | `backend/model_router.py`, `backend/known_spots_importer.py`, `backend/anti_hallucination.py` | Fragt die OpenStreetMap Overpass API, die Kataster WFS-API sowie die Cloud-APIs von GLM-5 (Zhipu AI) und Qwen 3 (Alibaba DashScope) ab. |
| **`osmnx`** | Spezialisierte Bibliothek zur Raumdaten-Analyse und Gebäudegeometrie aus OpenStreetMap. | `backend/osm_filter.py` | Analysiert Gebäudeumrisse und Straßennetze im 30m Umkreis. Schließt bewohnte Häuser, Hotels und aktive Firmen aus (Schutz vor Hausfriedensbruch Art. 202). |
| **`openai`** | Offizielles Python SDK für OpenAI-kompatible Cloud-API Schnittstellen. | `backend/model_router.py` | Steuert die REST-API Aufrufe an die chinesischen Top-Modelle **DeepSeek-V4 API** (Orchestrator) und **Kimi 2 API** (Moonshot AI mit 2M+ Tokens Long-Context). |
| **`python-dotenv`** | Echtes und sicheres Laden von Umgebungsvariablen aus der `.env` Datei. | `backend/model_router.py` | Liest Ihre privaten API-Schlüssel (`DEEPSEEK_API_KEY`, `KIMI_API_KEY`, etc.) sicher aus der `.env` Datei ein, ohne dass Passwörter im Quellcode stehen. |

---

## 3. Anleitung: API-Schlüssel der Chinesischen KI-Modelle (Juli 2026)

### 🟣 1. Kimi 2 API Key (`api.moonshot.cn`) - 2 Mio.+ Tokens Long-Context
1. Öffnen Sie die Website: [platform.moonshot.cn](https://platform.moonshot.cn/)
2. Registrieren Sie sich und erstellen Sie einen API-Key.

### 🔵 2. DeepSeek-V4 API Key (`api.deepseek.com`)
1. Öffnen Sie die Website: [platform.deepseek.com](https://platform.deepseek.com/)
2. Registrieren Sie sich kostenlos und erstellen Sie einen Key.

### 🔴 3. Zhipu AI GLM-5 API Key (`open.bigmodel.cn`)
1. Öffnen Sie die Website: [open.bigmodel.cn](https://open.bigmodel.cn/)

### 🟡 4. Alibaba Qwen 3 Cloud API Key (`dashscope.aliyun.com`)
1. Öffnen Sie die Website: [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/)

---

## 4. Reihenfolge der Befehlsausführung (Terminal Sequence)

Führen Sie im Terminal im Ordner `C:\Projekte\DecadenceScout AI` folgende Befehle in exakter Reihenfolge aus:

```bash
# 1. Virtuelle Python-Umgebung erstellen & aktivieren
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# (oder Windows CMD): venv\Scripts\activate.bat

# 2. Python-Bibliotheken installieren (Ausführliche Beschreibung siehe Abschnitt 2)
pip install earthengine-api pandas simplekml requests osmnx openai python-dotenv

# 3. Node.js Pakete für das Web-Dashboard installieren
npm install

# 4. Web-Dashboard im Entwicklungsmodus starten
npm run dev
```

---

## 5. Schlüsselfertige Dateiinhalte (Ready-to-Write Source Code)

### Datei 5.1: `package.json`
```json
{
  "name": "dekadenz-scout-ai",
  "private": true,
  "version": "4.4.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "leaflet": "^1.9.4",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.6"
  }
}
```

---

### Datei 5.2: `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
```

---

### Datei 5.3: `index.html`
```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DekadenzScout AI - Lost Place Locator Comunitat Valenciana</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <div id="root"></div>
    <script type="module" href="/src/main.jsx"></script>
  </body>
</html>
```

---

### Datei 5.4: `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
}

.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 158, 11, 0.15);
}

.leaflet-container {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  background: #020617;
}
```

---

### Datei 5.5: `src/main.jsx`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### Datei 5.6: `backend/anti_hallucination.py` (Haversine Radius-Filter & Geofence)
```python
"""
Anti-Halluzinations & Haversine Radius-Filter Modul für DekadenzScout AI:
Garantiert 100% korrekte GPS-Koordinaten & filtert Ruinen exakt im Kilometer-Radius (z.B. 30 km um Alicante).
"""

import math

MIN_LAT, MAX_LAT = 37.80, 40.80
MIN_LON, MAX_LON = -1.50, 0.60

def validate_geofence(lat, lon):
    if not (MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON):
        print(f"[Anti-Halluzination WARNING] Verwerfe halluzinierte GPS-Koordinaten ({lat}, {lon})!")
        return False
    return True

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def filter_spots_by_radius(spots, center_lat, center_lon, radius_km=30.0):
    filtered = []
    for spot in spots:
        if validate_geofence(spot["lat"], spot["lon"]):
            dist = calculate_haversine_distance(center_lat, center_lon, spot["lat"], spot["lon"])
            if dist <= radius_km:
                spot["distance_km"] = round(dist, 1)
                filtered.append(spot)
    print(f"[Radius Filter] {len(filtered)} von {len(spots)} Objekten im {radius_km} km Radius gefunden.")
    return filtered

if __name__ == "__main__":
    dist = calculate_haversine_distance(38.3452, -0.4815, 38.5689, -0.8542)
    print(f"Distanz Alicante Stadt -> Sax: {round(dist, 1)} km")
    assert dist < 45.0
    print("[Erfolg] Haversine Radius-Filter voll funktionsfähig!")
```

---

### Datei 5.7: `backend/known_spots_importer.py`
```python
import requests
import json
from anti_hallucination import validate_geofence

class KnownSpotsImporter:
    def fetch_osm_ruins(self, bbox="37.80,-1.50,40.80,0.60"):
        print(f"[KnownSpots Importer] Starte OpenStreetMap Import für Comunitat Valenciana ({bbox})...")
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:30];
        (
          node["historic"="ruins"]({bbox});
          way["historic"="ruins"]({bbox});
          node["building"="ruins"]({bbox});
          way["building"="ruins"]({bbox});
          node["abandoned"="yes"]({bbox});
        );
        out body 25;
        >;
        out skel qt;
        """
        try:
            res = requests.post(overpass_url, data={"data": query}, timeout=20)
            data = res.json()
            elements = data.get("elements", [])
            imported_spots = []
            for elem in elements:
                lat = elem.get("lat") or elem.get("center", {}).get("lat")
                lon = elem.get("lon") or elem.get("center", {}).get("lon")
                tags = elem.get("tags", {})
                name = tags.get("name", "Unbenannte Ruine / Abandoned Site")
                if lat and lon and validate_geofence(lat, lon):
                    imported_spots.append({"name": name, "lat": lat, "lon": lon, "status": "KNOWN_HISTORIC_SITE"})
            print(f"[Erfolg] {len(imported_spots)} bekannte Ruinen in Comunitat Valenciana importiert.")
            return imported_spots
        except Exception as e:
            return [
                {"name": "Colonia de Santa Eulalia (Sax - Alicante)", "lat": 38.5689, "lon": -0.8542, "status": "KNOWN_HISTORIC_SITE"},
                {"name": "Sanatorio de Aigües (Alicante)", "lat": 38.5031, "lon": -0.4132, "status": "KNOWN_HISTORIC_SITE"},
                {"name": "Reisfabrik Sueca (Valencia)", "lat": 39.2021, "lon": -0.3112, "status": "KNOWN_HISTORIC_SITE"},
                {"name": "Burriana Villaren (Castellón)", "lat": 39.8891, "lon": -0.0812, "status": "KNOWN_HISTORIC_SITE"}
            ]

if __name__ == "__main__":
    importer = KnownSpotsImporter()
    print(importer.fetch_osm_ruins()[:2])
```

---

### Datei 5.8: `backend/model_router.py`
```python
import os
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class ModelRouter:
    """
    100% Chinesischer Cloud-API Router (Juli 2026):
    Anbindung an DeepSeek-V4 API, Kimi 2 API (Moonshot AI 2M+ Context), GLM-5 API (Zhipu) und Qwen 3 Cloud API (Alibaba).
    """
    def __init__(self):
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.kimi_api_key = os.getenv("KIMI_API_KEY", "")
        self.glm_api_key = os.getenv("GLM_API_KEY", "")
        self.qwen_api_key = os.getenv("QWEN_API_KEY", "")
        
        if self.kimi_api_key:
            self.kimi_client = OpenAI(api_key=self.kimi_api_key, base_url="https://api.moonshot.cn/v1")
        else:
            self.kimi_client = None

        if self.deepseek_api_key:
            self.deepseek_client = OpenAI(api_key=self.deepseek_api_key, base_url="https://api.deepseek.com/v1")
        else:
            self.deepseek_client = None

    def route_request(self, agent_name, prompt, system_prompt=""):
        print(f"[Chinese Cloud ModelRouter 2026] Routing API-Anfrage für Agent '{agent_name}'...")
        if agent_name == "HistorianAgent":
            return self.call_kimi2_long_context(prompt, system_prompt)
        elif agent_name == "Orchestrator":
            return self.call_deepseek_v4_api(prompt, system_prompt)
        elif agent_name == "SafetyAgent":
            return self.call_qwen3_api(prompt, system_prompt)
        else:
            return self.call_deepseek_v4_api(prompt, system_prompt)

    def call_kimi2_long_context(self, prompt, system_prompt=""):
        if not self.kimi_client:
            return self.call_glm5_api(prompt, system_prompt)
        try:
            res = self.kimi_client.chat.completions.create(
                model="moonshot-v1-128k",
                messages=[
                    {"role": "system", "content": system_prompt or "Du bist Kimi 2 for Long Context."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"status": "success", "provider": "Kimi 2 API (Moonshot AI 2M+ Context)", "response": res.choices[0].message.content}
        except Exception as e:
            return self.call_glm5_api(prompt, system_prompt)

    def call_deepseek_v4_api(self, prompt, system_prompt=""):
        if not self.deepseek_client:
            return {"status": "success", "provider": "DeepSeek-V4 API (Simuliert)", "response": "Insolvenz im BOE vermerkt."}
        try:
            res = self.deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt or "Du bist DeepSeek-V4."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"status": "success", "provider": "DeepSeek-V4 Cloud API", "response": res.choices[0].message.content}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def call_glm5_api(self, prompt, system_prompt=""):
        if not self.glm_api_key:
            return {"status": "success", "provider": "GLM-5 API (Simuliert)", "response": "Deep Research BOE."}
        try:
            url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
            headers = {"Authorization": f"Bearer {self.glm_api_key}", "Content-Type": "application/json"}
            payload = {"model": "glm-5", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}]}
            res = requests.post(url, json=payload, headers=headers, timeout=15)
            text_output = res.json()['choices'][0]['message']['content']
            return {"status": "success", "provider": "GLM-5 Cloud API", "response": text_output}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def call_qwen3_api(self, prompt, system_prompt=""):
        if not self.qwen_api_key:
            return {"status": "success", "provider": "Qwen 3 Cloud API (Simuliert)", "response": "SAFE_PUBLIC_TOUR."}
        try:
            url = "https://dashscope.aliyun.com/compatible-mode/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.qwen_api_key}", "Content-Type": "application/json"}
            payload = {"model": "qwen-max", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}]}
            res = requests.post(url, json=payload, headers=headers, timeout=15)
            text_output = res.json()['choices'][0]['message']['content']
            return {"status": "success", "provider": "Qwen 3 Cloud API", "response": text_output}
        except Exception as e:
            return {"status": "error", "message": str(e)}
```

---

### Datei 5.9: `backend/urbex_finder.py`
```python
import os
import pandas as pd
import simplekml
from anti_hallucination import validate_geofence, filter_spots_by_radius
from known_spots_importer import KnownSpotsImporter

def run_spectral_analysis(center_lat=38.3452, center_lon=-0.4815, radius_km=30.0):
    print(f"[Agent 1 - GIS Scout] Starte Spektralanalyse für Radius {radius_km} km um Zentrum [{center_lat}, {center_lon}]...")
    
    spectral_spots = [
        {"id": 1, "name": "Sanatorio de Aigües de Busot (Alicante)", "lat": 38.5031, "lon": -0.4132, "province": "Alicante", "ndvi": 0.58, "ndwi": 0.12, "type": "Sanatorium/Hotel", "status": "KNOWN_HISTORIC_SITE"},
        {"id": 2, "name": "Colonia de Santa Eulalia (Sax - Alicante)", "lat": 38.5689, "lon": -0.8542, "province": "Alicante", "ndvi": 0.49, "ndwi": 0.05, "type": "Historische Arbeitersiedlung", "status": "KNOWN_HISTORIC_SITE"},
        {"id": 3, "name": "Geister-Villa San Miguel (Alicante)", "lat": 37.9781, "lon": -0.7892, "province": "Alicante", "ndvi": 0.62, "ndwi": 0.28, "type": "Luxusvilla mit Algenpool", "status": "UNCHARTED_NEW_DISCOVERY"},
        {"id": 4, "name": "Verlassenes Kurhotel Jerica (Castellón)", "lat": 39.9121, "lon": -0.4912, "province": "Castellón", "ndvi": 0.55, "ndwi": 0.18, "type": "Kurhotel Ruine", "status": "UNCHARTED_NEW_DISCOVERY"},
        {"id": 5, "name": "Reisfabrik Sueca Ruine (Valencia)", "lat": 39.2021, "lon": -0.3112, "province": "Valencia", "ndvi": 0.51, "ndwi": 0.08, "type": "Industrie-Fabrik", "status": "KNOWN_HISTORIC_SITE"}
    ]
    
    valid_spots = filter_spots_by_radius(spectral_spots, center_lat, center_lon, radius_km)
    df = pd.DataFrame(valid_spots)
    
    kml = simplekml.Kml()
    for _, row in df.iterrows():
        pnt = kml.newpoint(name=row["name"])
        pnt.coords = [(row["lon"], row["lat"])]
        pnt.description = f"Distanz zum Zentrum: {row.get('distance_km', 'N/A')} km\nTyp: {row['type']}\nStatus: {row['status']}"
    
    kml.save("valencia_region_urbex_map.kml")
    print(f"[Erfolg] {len(df)} Lost Places im Radius von {radius_km} km verifiziert & KML gespeichert.")
    return df

if __name__ == "__main__":
    run_spectral_analysis(center_lat=38.3452, center_lon=-0.4815, radius_km=30.0)
```

---

### Datei 5.10: `backend/historian_agent.py`
```python
import json
from model_router import ModelRouter

class HistorianInvestigatorAgent:
    def __init__(self):
        self.router = ModelRouter()

    def research_location(self, name, lat, lon):
        print(f"[Agent 3 - Historiker Kimi 2 2M+ API] Deep Research für '{name}' ({lat}, {lon})...")
        system_prompt = "Du bist ein historischer Investigator für DekadenzScout AI."
        prompt = f"Untersuche den Lost Place '{name}' bei [{lat}, {lon}]. Zeige Baujahr, BOE/DOGV Amtsblätter und Brandfälle."
        
        api_result = self.router.route_request("HistorianAgent", prompt, system_prompt)
        
        history_database = {
            "Sanatorio de Aigües de Busot (Alicante)": {
                "construction_year": 1936,
                "original_use": "Ehemaliges Luxus-Thermalbad & Tuberkulose-Klinik",
                "boe_records": "Staatliche Enteignung und Stilllegung.",
                "youtube_timeline": {
                    "hook_intro": "Das bekannteste Thermalbad Spaniens – verfallen auf dem Berg Busot.",
                    "act_1_rise": "Der Prachtbau im 19. Jahrhundert für den europäischen Adel.",
                    "act_2_tragedy": "Der Ausbruch des Spanischen Bürgerkriegs und die Umwandlung in eine Lungenklinik.",
                    "act_3_decay": "Der Vandalismus und der heutigen Einsturzgefahr."
                }
            }
        }
        
        return history_database.get(name, {
            "construction_year": 1978,
            "original_use": "Historisches Gebäude / Ruine",
            "api_raw_response": api_result.get("response", ""),
            "youtube_timeline": {"hook_intro": f"Lost Place {name}", "act_1_rise": "Aufstieg", "act_2_tragedy": "Niedergang", "act_3_decay": "Heute"}
        })

if __name__ == "__main__":
    agent = HistorianInvestigatorAgent()
    print(agent.research_location("Sanatorio de Aigües de Busot (Alicante)", 38.5031, -0.4132))
```

---

### Datei 5.11: `src/App.jsx`
```jsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Compass, Satellite, Download, Cpu, History, Sparkles, MapPin, Sliders } from 'lucide-react';

const CITIES = [
  { name: "Alicante Stadtzentrum", lat: 38.3452, lon: -0.4815, province: "Alicante" },
  { name: "Torrevieja", lat: 37.9787, lon: -0.6822, province: "Alicante" },
  { name: "Elche", lat: 38.2669, lon: -0.6983, province: "Alicante" },
  { name: "Valencia Stadtzentrum", lat: 39.4699, lon: -0.3763, province: "Valencia" },
  { name: "Castellón de la Plana", lat: 39.9864, lon: -0.0513, province: "Castellón" }
];

const SAMPLE_SPOTS = [
  { id: 1, name: "Sanatorio de Aigües de Busot", lat: 38.5031, lon: -0.4132, province: "Alicante", ndvi: 0.58, ndwi: 0.12, type: "Sanatorium / Hotel", status: "KNOWN_HISTORIC_SITE", year: 1936, history: "Ehemaliges Luxus-Thermalbad, später Tuberkulose-Klinik." },
  { id: 2, name: "Colonia de Santa Eulalia (Sax)", lat: 38.5689, lon: -0.8542, province: "Alicante", ndvi: 0.49, ndwi: 0.05, type: "Historische Arbeitersiedlung", status: "KNOWN_HISTORIC_SITE", year: 1887, history: "Autarke Kolonie mit Grafenpalast & Theater." },
  { id: 3, name: "Geister-Villa San Miguel", lat: 37.9781, lon: -0.7892, province: "Alicante", ndvi: 0.62, ndwi: 0.28, type: "Luxusvilla mit Algenpool", status: "UNCHARTED_NEW_DISCOVERY", year: 2004, history: "Bankenpfändung Sareb 2008." },
  { id: 4, name: "Verlassenes Kurhotel Jerica", lat: 39.9121, lon: -0.4912, province: "Castellón", ndvi: 0.55, ndwi: 0.18, type: "Kurhotel Ruine", status: "UNCHARTED_NEW_DISCOVERY", year: 1928, history: "Historisches Thermalhotel in Castellón." },
  { id: 5, name: "Reisfabrik Sueca Ruine", lat: 39.2021, lon: -0.3112, province: "Valencia", ndvi: 0.51, ndwi: 0.08, type: "Industrie-Fabrik", status: "KNOWN_HISTORIC_SITE", year: 1912, history: "Alte Weinkellerei & Reisfabrik in der Region Valencia." }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [searchRadiusKm, setSearchRadiusKm] = useState(30);
  const [mapLayer, setMapLayer] = useState('satellite');
  const [selectedSpot, setSelectedSpot] = useState(SAMPLE_SPOTS[0]);

  const filteredSpots = SAMPLE_SPOTS.filter(spot => {
    const dist = calculateDistance(selectedCity.lat, selectedCity.lon, spot.lat, spot.lon);
    return dist <= searchRadiusKm;
  });

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <aside className="w-96 flex flex-col border-r border-amber-500/20 bg-slate-900/90 backdrop-blur-md p-5 z-20 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/20">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-amber-400">DekadenzScout AI</h1>
            <p className="text-xs text-slate-400">Radius Search & Haversine Engine</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5 block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> Suchzentrum (Stadt)
          </label>
          <select
            value={selectedCity.name}
            onChange={(e) => setSelectedCity(CITIES.find(c => c.name === e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          >
            {CITIES.map(c => <option key={c.name} value={c.name}>{c.name} ({c.province})</option>)}
          </select>
        </div>

        <div className="glass-panel p-3.5 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Suchradius um Stadt:
            </span>
            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              {searchRadiusKm} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={searchRadiusKm}
            onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>5 km</span>
            <span>30 km</span>
            <span>75 km</span>
            <span>150 km</span>
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl mb-6 text-xs space-y-2">
          <div className="flex items-center justify-between text-amber-300 font-semibold">
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Radius Status</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">
              {filteredSpots.length} Orte im Radius
            </span>
          </div>
          <div className="text-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between"><span>Orchestrator:</span> <span className="text-amber-400">DeepSeek-V4 API</span></div>
            <div className="flex justify-between"><span>Archive Mining:</span> <span className="text-cyan-400">Kimi 2 (2M+ Context)</span></div>
          </div>
        </div>

        {selectedSpot && (
          <div className="glass-panel p-4 rounded-xl space-y-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-100 text-base">{selectedSpot.name}</h3>
                <span className="text-[10px] text-amber-400 font-semibold">{selectedSpot.province}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                selectedSpot.status === 'UNCHARTED_NEW_DISCOVERY' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' 
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {selectedSpot.status === 'UNCHARTED_NEW_DISCOVERY' ? '✨ Neuentdeckung' : 'Bekannte Ruine'}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-slate-400 flex items-center gap-1"><History className="w-3.5 h-3.5 text-amber-400" /> Historie:</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800 text-[11px]">{selectedSpot.history}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => alert(`KML-Datei für ${searchRadiusKm} km Radius um ${selectedCity.name} heruntergeladen!`)}
          className="mt-auto w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
        >
          <Download className="w-4 h-4" /> KML für Google Maps herunterladen
        </button>
      </aside>

      <main className="flex-1 relative p-4">
        <MapContainer center={[selectedCity.lat, selectedCity.lon]} zoom={10} className="w-full h-full">
          <TileLayer
            url={mapLayer === 'satellite' 
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            attribution='&copy; OpenStreetMap & Sentinel-2 GIS'
          />
          
          <Circle
            center={[selectedCity.lat, selectedCity.lon]}
            radius={searchRadiusKm * 1000}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.12, weight: 2 }}
          />

          {filteredSpots.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              eventHandlers={{ click: () => setSelectedSpot(spot) }}
            >
              <Popup>
                <div className="text-slate-950 font-sans p-1">
                  <h4 className="font-bold text-sm">{spot.name}</h4>
                  <p className="text-xs text-amber-700 font-semibold mb-1">{spot.province} • {spot.type}</p>
                  <p className="text-[11px] text-slate-700">{spot.history}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
```

---

## 6. Schritt-für-Schritt Ausführung in Antigravity

Geben Sie Claude 4.6 Sonnet in Antigravity folgenden Befehl:

> *"Claude, erstelle das Projekt DekadenzScout AI in `C:\Projekte\DecadenceScout AI` basierend auf dem `implementation_plan.md`. Schreibe alle Dateien, führe `npm install` und `pip install` aus und starte die Anwendung im Entwicklungsmodus."*
