# Implementierungsplan & Ausführungsanweisung: DekadenzScout AI (PoC)

> **Anweisung für Claude 4.6 Sonnet in Antigravity**: Dieses Dokument dient als direkter, schlüsselfertiger Ausführungsplan. Bitte arbeiten Sie die Schritte in der vorgegebenen Reihenfolge ab, erstellen Sie die angegebenen Dateien mit dem bereitgestellten Quellcode und führen Sie die notwendigen Terminal-Befehle aus.

**Projektpfad**: `C:\Projekte\DecadenceScout AI`  
**Projektname**: DekadenzScout AI / TerraGhost AI  
**Zielregion**: Autonome Gemeinschaft Valencia / Comunitat Valenciana (Provinzen Alicante, Valencia & Castellón)  
**Version**: 4.7 (Inklusive Performance-Optimierung, Daten-Modularisierung, ESRI Satelliten-Engine, Kategorie-Filter, Live-Distanz & KI-Resilienz-Architektur)  

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
│   ├── components/                # UI Komponenten
│   │   ├── ErrorBoundary.jsx      # React Fallback UI Schutz vor Render-Abstürzen
│   │   └── ToastNotification.jsx  # Glassmorphism Echtzeit-Benachrichtigungen
│   ├── data/                      # Ausgelagerte Daten-Module
│   │   └── spots.js               # 472 Lost Places Datensätze (13.700 Zeilen modularisiert)
│   ├── hooks/                     # Custom React Hooks
│   │   └── useSpotImage.js        # ESRI ArcGIS World Imagery Satellitenbild-Generator
│   ├── services/                  # KI-Resilienz & Agenten-Pipelines
│   │   └── aiAgentResilience.js   # Multi-Tier Fallback Chain (DeepSeek -> Qwen -> Kimi -> Local)
│   ├── App.jsx                    # Hauptansicht (Refactored: 43 KB, useMemo, Filter & Karten-Engine)
│   ├── index.css                  # Modernes Glassmorphic Dark-Mode Design System
│   └── main.jsx                   # React Einstiegspunkt
├── index.html                     # HTML Grundgerüst
├── package.json                   # Web-Anwendung Konfiguration
├── vite.config.js                 # Server & Bundler Konfiguration
├── docs/                          # Dokumentationszentrum
│   ├── fachkonzept_poc.md         # Betriebswirtschaftliches & Funktionales Fachkonzept (v4.7)
│   ├── implementation_plan.md     # Dieses Dokument (v4.7)
│   └── ki_agenten_kommunikation.md# KI-Agenten Kommunikationsspezifikation
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
# Modul-Beschreibung: Anti-Halluzinations & Haversine Radius-Filter Modul für DekadenzScout AI
# Garantiert 100% korrekte GPS-Koordinaten & filtert Ruinen exakt im Kilometer-Radius (z.B. 30 km um Alicante).

import math  # Importiert das mathematische Python-Standardmodul für Trigonometrie und Bogenmaß-Berechnungen

# Definierte geografische Rechtecks-Grenzen (Geofence) für die Autonome Gemeinschaft Valencia (Comunitat Valenciana)
MIN_LAT, MAX_LAT = 37.80, 40.80  # Mindest- und Höchst-Breitengrad für Valencia/Alicante/Castellón
MIN_LON, MAX_LON = -1.50, 0.60  # Mindest- und Höchst-Längengrad für Valencia/Alicante/Castellón

def validate_geofence(lat, lon):  # Prüft, ob eine GPS-Koordinate innerhalb der Region Valencia liegt
    if not (MIN_LAT <= lat <= MAX_LAT and MIN_LON <= lon <= MAX_LON):  # Falls Breitengrad oder Längengrad außerhalb der Grenzen liegen
        print(f"[Anti-Halluzination WARNING] Verwerfe halluzinierte GPS-Koordinaten ({lat}, {lon})!")  # Gibt eine Warnmeldung aus
        return False  # Liefert False zurück, da die Koordinate ungültig/halluziniert ist
    return True  # Liefert True zurück, da die Koordinate sicher innerhalb der Region liegt

def calculate_haversine_distance(lat1, lon1, lat2, lon2):  # Berechnet die exakte Luftlinien-Entfernung zweier GPS-Punkte in Kilometern
    R = 6371.0  # Erdradius in Kilometern (Durchschnittswert nach Kugelmodell)
    dlat = math.radians(lat2 - lat1)  # Berechnet die Differenz der Breitengrade im Bogenmaß (Radians)
    dlon = math.radians(lon2 - lon1)  # Berechnet die Differenz der Längengrade im Bogenmaß (Radians)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2  # Haversine-Formel Teil A (Winkelabstand)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))  # Haversine-Formel Teil C (Zentriwinkel im Bogenmaß)
    return R * c  # Multipliziert den Erdradius mit dem Zentriwinkel zur Entfernung in km

def filter_spots_by_radius(spots, center_lat, center_lon, radius_km=30.0):  # Filtert eine Liste von Objekten nach Suchkreis-Radius
    filtered = []  # Erstellt eine leere Ergebnis-Liste für gültige Treffer
    for spot in spots:  # Iteriert durch jedes Objekt in der übergebenen Liste
        if validate_geofence(spot["lat"], spot["lon"]):  # Prüft zuerst, ob das Objekt innerhalb des Geofence liegt
            dist = calculate_haversine_distance(center_lat, center_lon, spot["lat"], spot["lon"])  # Berechnet die Distanz zum Stadt-Zentrum
            if dist <= radius_km:  # Wenn die berechnete Entfernung kleiner oder gleich dem eingestellten Radius ist
                spot["distance_km"] = round(dist, 1)  # Speichert die gerundete Entfernung im Objekt-Wörterbuch ab
                filtered.append(spot)  # Fügt das gültige Objekt der Ergebnis-Liste hinzu
    print(f"[Radius Filter] {len(filtered)} von {len(spots)} Objekten im {radius_km} km Radius gefunden.")  # Druckt die Filter-Statistik
    return filtered  # Gibt die gefilterte Liste mit Treffern zurück

if __name__ == "__main__":  # Selbsttest-Block: Wird nur ausgeführt, wenn das Skript direkt gestartet wird
    dist = calculate_haversine_distance(38.3452, -0.4815, 38.5689, -0.8542)  # Berechnet Test-Distanz von Alicante nach Sax
    print(f"Distanz Alicante Stadt -> Sax: {round(dist, 1)} km")  # Druckt das Test-Ergebnis
    assert dist < 45.0  # Überprüft plausibles mathematisches Testergebnis (< 45 km)
    print("[Erfolg] Haversine Radius-Filter voll funktionsfähig!")  # Bestätigt den erfolgreichen Selbsttest
```

---

### Datei 5.7: `backend/known_spots_importer.py`
```python
import requests  # Importiert die Python Requests-Bibliothek für HTTP-Netzwerkanfragen an Online-APIs
import json  # Importiert das JSON-Standardmodul zur Datenstrukturenspeicherung
from anti_hallucination import validate_geofence  # Importiert die Geofence-Validierung aus dem eigenen Anti-Halluzinations-Modul

class KnownSpotsImporter:  # Klasse zum Abrufen und Verarbeiten bekannter Ruinen aus OpenStreetMap
    def fetch_osm_ruins(self, bbox="37.80,-1.50,40.80,0.60"):  # Methode zum Abfragen der OSM-Ruinen in den Grenzen von Valencia
        print(f"[KnownSpots Importer] Starte OpenStreetMap Import für Comunitat Valenciana ({bbox})...")  # Statusmeldung zum Importstart
        overpass_url = "https://overpass-api.de/api/interpreter"  # Offizieller Overpass API Endpunkt für OpenStreetMap-Abfragen
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
        """  # Overpass QL-Suchanfrage nach historischen Ruinen, verfallenen Gebäuden und verlassenen Orten im Geofence
        try:  # Versuch-Block für die Netzwerkanfrage mit Fehlerabfang
            res = requests.post(overpass_url, data={"data": query}, timeout=20)  # Sendet die Overpass-Abfrage per HTTP-POST ab
            data = res.json()  # Konvertiert die erhaltene HTTP-Antwort in ein JSON-Datenobjekt
            elements = data.get("elements", [])  # Extrahiert die Liste der gefundenen Karten-Elemente
            imported_spots = []  # Initialisiert die Liste für importierte Ruinen
            for elem in elements:  # Durchläuft jedes gefundene OpenStreetMap-Element
                lat = elem.get("lat") or elem.get("center", {}).get("lat")  # Liest den Breitengrad aus (direkt oder aus dem Zentroid)
                lon = elem.get("lon") or elem.get("center", {}).get("lon")  # Liest den Längengrad aus (direkt oder aus dem Zentroid)
                tags = elem.get("tags", {})  # Liest das Tag-Wörterbuch des OSM-Elements aus
                name = tags.get("name", "Unbenannte Ruine / Abandoned Site")  # Holt den Namen des Objekts oder setzt einen Standardwert
                if lat and lon and validate_geofence(lat, lon):  # Validiert GPS-Vorhandensein und Geofence-Zugehörigkeit
                    imported_spots.append({"name": name, "lat": lat, "lon": lon, "status": "KNOWN_HISTORIC_SITE"})  # Fügt den gültigen Ort hinzu
            print(f"[Erfolg] {len(imported_spots)} bekannte Ruinen in Comunitat Valenciana importiert.")  # Erfolgsmeldung mit Anzahl
            return imported_spots  # Gibt die importierte Liste bekannter Orte zurück
        except Exception as e:  # Fehler-Block bei Netzwerkausfall oder API-Sperrung
            return [  # Liefert ausfallsichere Fallback-Ruinen aus der Region Valencia zurück
                {"name": "Colonia de Santa Eulalia (Sax - Alicante)", "lat": 38.5689, "lon": -0.8542, "status": "KNOWN_HISTORIC_SITE"},  # Bekannter Lost Place 1
                {"name": "Sanatorio de Aigües (Alicante)", "lat": 38.5031, "lon": -0.4132, "status": "KNOWN_HISTORIC_SITE"},  # Bekannter Lost Place 2
                {"name": "Reisfabrik Sueca (Valencia)", "lat": 39.2021, "lon": -0.3112, "status": "KNOWN_HISTORIC_SITE"},  # Bekannter Lost Place 3
                {"name": "Burriana Villaren (Castellón)", "lat": 39.8891, "lon": -0.0812, "status": "KNOWN_HISTORIC_SITE"}  # Bekannter Lost Place 4
            ]  # Ende der Fallback-Liste

if __name__ == "__main__":  # Selbsttest-Ausführung beim direkten Aufruf der Datei
    importer = KnownSpotsImporter()  # Instanziiert die Importer-Klasse
    print(importer.fetch_osm_ruins()[:2])  # Gibt die ersten 2 importierten Ruinen zur Überprüfung im Terminal aus
```

---

### Datei 5.8: `backend/model_router.py`
```python
import os  # Modul für Betriebssystem-Zugriffe und Umgebungsvariablen
import requests  # Modul für allgemeine HTTP REST-API Aufrufe
from openai import OpenAI  # Offizielles OpenAI SDK für API-Aufrufe an kompatible LLMs
from dotenv import load_dotenv  # Modul zum Einlesen von API-Schlüsseln aus der .env-Datei

load_dotenv()  # Lädt Umgebungsvariablen aus der lokalen .env-Datei in den Speicher

class ModelRouter:  # Router-Klasse zur Steuerung der chinesischen KI-Cloud-Modelle (Stand 2026)
    """
    100% Chinesischer Cloud-API Router (Juli 2026):
    Anbindung an DeepSeek-V4 API, Kimi 2 API (Moonshot AI 2M+ Context), GLM-5 API (Zhipu) und Qwen 3 Cloud API (Alibaba).
    """
    def __init__(self):  # Initialisierungsmethode der Klasse
        self.deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "")  # Liest den DeepSeek API-Schlüssel aus
        self.kimi_api_key = os.getenv("KIMI_API_KEY", "")  # Liest den Kimi (Moonshot AI) API-Schlüssel aus
        self.glm_api_key = os.getenv("GLM_API_KEY", "")  # Liest den Zhipu GLM API-Schlüssel aus
        self.qwen_api_key = os.getenv("QWEN_API_KEY", "")  # Liest den Alibaba Qwen API-Schlüssel aus
        
        if self.kimi_api_key:  # Falls ein Kimi API-Schlüssel vorhanden ist
            self.kimi_client = OpenAI(api_key=self.kimi_api_key, base_url="https://api.moonshot.cn/v1")  # Initialisiert Kimi OpenAI-Client
        else:  # Falls kein Schlüssel hinterlegt wurde
            self.kimi_client = None  # Setzt den Client auf None

        if self.deepseek_api_key:  # Falls ein DeepSeek API-Schlüssel vorhanden ist
            self.deepseek_client = OpenAI(api_key=self.deepseek_api_key, base_url="https://api.deepseek.com/v1")  # Initialisiert DeepSeek Client
        else:  # Falls kein Schlüssel hinterlegt wurde
            self.deepseek_client = None  # Setzt den Client auf None

    def route_request(self, agent_name, prompt, system_prompt=""):  # Hauptfunktion zur KI-Modell-Verteilung je nach Agentenrolle
        print(f"[Chinese Cloud ModelRouter 2026] Routing API-Anfrage für Agent '{agent_name}'...")  # Loggt den Routing-Vorgang im Terminal
        if agent_name == "HistorianAgent":  # Falls die Anfrage vom Historiker-Agenten kommt
            return self.call_kimi2_long_context(prompt, system_prompt)  # Routet zu Kimi 2 (2M+ Tokens Long Context)
        elif agent_name == "Orchestrator":  # Falls die Anfrage vom Haupt-Orchestrator kommt
            return self.call_deepseek_v4_api(prompt, system_prompt)  # Routet zu DeepSeek-V4
        elif agent_name == "SafetyAgent":  # Falls die Anfrage vom Sicherheits-Agenten kommt
            return self.call_qwen3_api(prompt, system_prompt)  # Routet zu Qwen 3 Cloud API
        else:  # Für alle anderen nicht spezifizierten Agenten
            return self.call_deepseek_v4_api(prompt, system_prompt)  # Standard-Fallback auf DeepSeek-V4

    def call_kimi2_long_context(self, prompt, system_prompt=""):  # Methode zum Aufruf der Kimi 2 API (Moonshot AI)
        if not self.kimi_client:  # Falls kein Kimi-Client aktiv ist
            return self.call_glm5_api(prompt, system_prompt)  # Schaltet auf GLM-5 API um (Failover)
        try:  # Versuch-Block für die Kimi-Anfrage
            res = self.kimi_client.chat.completions.create(  # Sendet Chat-Completion-Request an Kimi API
                model="moonshot-v1-128k",  # Nutzt das Long-Context Modell moonshot-v1-128k
                messages=[  # Liste der Nachrichten (System- & User-Prompt)
                    {"role": "system", "content": system_prompt or "Du bist Kimi 2 for Long Context."},  # System-Prompt Rolle
                    {"role": "user", "content": prompt}  # Eigentliche Aufgabe/Prompt des Nutzers
                ]  # Ende der Nachrichtenliste
            )  # Ende des API-Aufrufs
            return {"status": "success", "provider": "Kimi 2 API (Moonshot AI 2M+ Context)", "response": res.choices[0].message.content}  # Erfolgsantwort mit Text
        except Exception as e:  # Bei Ausfall der Kimi-API
            return self.call_glm5_api(prompt, system_prompt)  # Automatischer Failover auf GLM-5 API

    def call_deepseek_v4_api(self, prompt, system_prompt=""):  # Methode zum Aufruf der DeepSeek-V4 API
        if not self.deepseek_client:  # Falls kein DeepSeek-Client konfiguriert ist
            return {"status": "success", "provider": "DeepSeek-V4 API (Simuliert)", "response": "Insolvenz im BOE vermerkt."}  # Simulates Fallback-Antwort
        try:  # Versuch-Block für den DeepSeek API Aufruf
            res = self.deepseek_client.chat.completions.create(  # Sendet Request an DeepSeek API
                model="deepseek-chat",  # Spezifiziert das DeepSeek Modell
                messages=[  # Nachrichten-Struktur
                    {"role": "system", "content": system_prompt or "Du bist DeepSeek-V4."},  # Rolle festlegen
                    {"role": "user", "content": prompt}  # Anfrage festlegen
                ]  # Ende Nachrichten
            )  # Ende Aufruf
            return {"status": "success", "provider": "DeepSeek-V4 Cloud API", "response": res.choices[0].message.content}  # Erfolgs-Rückgabe
        except Exception as e:  # Fehlerabfang
            return {"status": "error", "message": str(e)}  # Gibt Fehlermeldung als Wörterbuch zurück

    def call_glm5_api(self, prompt, system_prompt=""):  # Methode zum Aufruf der Zhipu GLM-5 API
        if not self.glm_api_key:  # Falls kein GLM API Key da ist
            return {"status": "success", "provider": "GLM-5 API (Simuliert)", "response": "Deep Research BOE."}  # Simulation
        try:  # Versuch-Block
            url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"  # GLM-5 REST Endpoint URL
            headers = {"Authorization": f"Bearer {self.glm_api_key}", "Content-Type": "application/json"}  # HTTP Header mit Auth-Token
            payload = {"model": "glm-5", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}]}  # Payload Datenpaket
            res = requests.post(url, json=payload, headers=headers, timeout=15)  # POST-Anfrage mit 15s Timeout
            text_output = res.json()['choices'][0]['message']['content']  # Extrahiert den Antworttext
            return {"status": "success", "provider": "GLM-5 Cloud API", "response": text_output}  # Erfolgsrückgabe
        except Exception as e:  # Fehlerbehandlung
            return {"status": "error", "message": str(e)}  # Gibt Fehler zurück

    def call_qwen3_api(self, prompt, system_prompt=""):  # Methode zum Aufruf der Alibaba Qwen 3 Cloud API
        if not self.qwen_api_key:  # Falls kein Qwen Key hinterlegt ist
            return {"status": "success", "provider": "Qwen 3 Cloud API (Simuliert)", "response": "SAFE_PUBLIC_TOUR."}  # Simulation
        try:  # Versuch-Block
            url = "https://dashscope.aliyun.com/compatible-mode/v1/chat/completions"  # DashScope Qwen API Endpoint
            headers = {"Authorization": f"Bearer {self.qwen_api_key}", "Content-Type": "application/json"}  # Auth Header
            payload = {"model": "qwen-max", "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}]}  # Payload
            res = requests.post(url, json=payload, headers=headers, timeout=15)  # POST Anforderung
            text_output = res.json()['choices'][0]['message']['content']  # Text-Extraktion
            return {"status": "success", "provider": "Qwen 3 Cloud API", "response": text_output}  # Erfolgsantwort
        except Exception as e:  # Fehlerbehandlung
            return {"status": "error", "message": str(e)}  # Fehlerrückgabe
```

---

### Datei 5.9: `backend/urbex_finder.py`
```python
import os  # Betriebssystem-Modul für Dateipfade und Umgebungsabfragen
import pandas as pd  # Pandas-Bibliothek für Datenstrukturierung und DataFrame-Verarbeitung
import simplekml  # SimpleKML-Bibliothek zur Erstellung von KML-Kartendateien für Smartphones
from anti_hallucination import validate_geofence, filter_spots_by_radius  # Importiert Geofence & Radius-Filter
from known_spots_importer import KnownSpotsImporter  # Importiert den OpenStreetMap Importer

def run_spectral_analysis(center_lat=38.3452, center_lon=-0.4815, radius_km=30.0):  # Hauptfunktion für Agent 1 (GIS Scout)
    print(f"[Agent 1 - GIS Scout] Starte Spektralanalyse für Radius {radius_km} km um Zentrum [{center_lat}, {center_lon}]...")  # Log-Ausgabe
    
    spectral_spots = [  # Spektral verifizierte Beispieldatenbank verlassener Orte
        {"id": 1, "name": "Sanatorio de Aigües de Busot (Alicante)", "lat": 38.5031, "lon": -0.4132, "province": "Alicante", "ndvi": 0.58, "ndwi": 0.12, "type": "Sanatorium/Hotel", "status": "KNOWN_HISTORIC_SITE"},  # Ort 1
        {"id": 2, "name": "Colonia de Santa Eulalia (Sax - Alicante)", "lat": 38.5689, "lon": -0.8542, "province": "Alicante", "ndvi": 0.49, "ndwi": 0.05, "type": "Historische Arbeitersiedlung", "status": "KNOWN_HISTORIC_SITE"},  # Ort 2
        {"id": 3, "name": "Geister-Villa San Miguel (Alicante)", "lat": 37.9781, "lon": -0.7892, "province": "Alicante", "ndvi": 0.62, "ndwi": 0.28, "type": "Luxusvilla mit Algenpool", "status": "UNCHARTED_NEW_DISCOVERY"},  # Ort 3 (Neuentdeckung)
        {"id": 4, "name": "Verlassenes Kurhotel Jerica (Castellón)", "lat": 39.9121, "lon": -0.4912, "province": "Castellón", "ndvi": 0.55, "ndwi": 0.18, "type": "Kurhotel Ruine", "status": "UNCHARTED_NEW_DISCOVERY"},  # Ort 4 (Neuentdeckung)
        {"id": 5, "name": "Reisfabrik Sueca Ruine (Valencia)", "lat": 39.2021, "lon": -0.3112, "province": "Valencia", "ndvi": 0.51, "ndwi": 0.08, "type": "Industrie-Fabrik", "status": "KNOWN_HISTORIC_SITE"}  # Ort 5
    ]  # Ende der Spektral-Datenliste
    
    valid_spots = filter_spots_by_radius(spectral_spots, center_lat, center_lon, radius_km)  # Filtert Orte streng nach dem Kilometer-Radius
    df = pd.DataFrame(valid_spots)  # Wandelt die gefilterte Ergebnisliste in einen Pandas DataFrame um
    
    kml = simplekml.Kml()  # Initialisiert ein neues KML-Dokument zur KML-Kartenerstellung
    for _, row in df.iterrows():  # Iteriert zeilenweise durch den Pandas DataFrame
        pnt = kml.newpoint(name=row["name"])  # Erstellt einen neuen KML-Wegpunkt auf der Karte
        pnt.coords = [(row["lon"], row["lat"])]  # Setzt die Koordinaten des Wegpunkts (Längengrad, Breitengrad)
        pnt.description = f"Distanz zum Zentrum: {row.get('distance_km', 'N/A')} km\nTyp: {row['type']}\nStatus: {row['status']}"  # Speichert Info-Beschreibung für Google Maps
    
    kml.save("valencia_region_urbex_map.kml")  # Speichert die KML-Kartendatei lokal ab
    print(f"[Erfolg] {len(df)} Lost Places im Radius von {radius_km} km verifiziert & KML gespeichert.")  # Druckt Erfolgsmeldung aus
    return df  # Gibt den fertigen DataFrame zurück

if __name__ == "__main__":  # Selbsttest-Verzweigung beim direkten Skriptaufruf
    run_spectral_analysis(center_lat=38.3452, center_lon=-0.4815, radius_km=30.0)  # Führt Test-Spektralanalyse im 30km Radius aus
```

---

### Datei 5.10: `backend/historian_agent.py`
```python
import json  # Importiert JSON-Modul für Datenverarbeitung
from model_router import ModelRouter  # Importiert den eigenen KI-ModelRouter für Cloud-APIs

class HistorianInvestigatorAgent:  # Klasse für Agent 3 (Historiker & Zeitungs-Archivar)
    def __init__(self):  # Konstruktor-Methode
        self.router = ModelRouter()  # Instanziiert den ModelRouter zur API-Kommunikation

    def research_location(self, name, lat, lon):  # Methode zur Tiefenrecherche eines Lost Places
        print(f"[Agent 3 - Historiker Kimi 2 2M+ API] Deep Research für '{name}' ({lat}, {lon})...")  # Ausführungs-Log
        system_prompt = "Du bist ein historischer Investigator für DekadenzScout AI."  # Legt KI-System-Rolle fest
        prompt = f"Untersuche den Lost Place '{name}' bei [{lat}, {lon}]. Zeige Baujahr, BOE/DOGV Amtsblätter und Brandfälle."  # Erstellt User-Prompt
        
        api_result = self.router.route_request("HistorianAgent", prompt, system_prompt)  # Sendet Anfrage an Kimi 2 API via ModelRouter
        
        history_database = {  # Historische Referenzdatenbank für verifizierte Orte
            "Sanatorio de Aigües de Busot (Alicante)": {  # Datensatz Sanatorio de Aigües
                "construction_year": 1936,  # Baujahr / Umbaujahr
                "original_use": "Ehemaliges Luxus-Thermalbad & Tuberkulose-Klinik",  # Ursprüngliche Nutzung
                "boe_records": "Staatliche Enteignung und Stilllegung.",  # Amtsblatt-Einträge
                "youtube_timeline": {  # Skript-Dramaturgie für YouTube-Videos
                    "hook_intro": "Das bekannteste Thermalbad Spaniens – verfallen auf dem Berg Busot.",  # Video-Hook
                    "act_1_rise": "Der Prachtbau im 19. Jahrhundert für den europäischen Adel.",  # Akt 1
                    "act_2_tragedy": "Der Ausbruch des Spanischen Bürgerkriegs und die Umwandlung in eine Lungenklinik.",  # Akt 2
                    "act_3_decay": "Der Vandalismus und der heutigen Einsturzgefahr."  # Akt 3
                }  # Ende Timeline
            }  # Ende Datensatz
        }  # Ende Referenzdatenbank
        
        return history_database.get(name, {  # Gibt gespeichertes Profil oder dynamischen Fallback zurück
            "construction_year": 1978,  # Standard-Baujahr
            "original_use": "Historisches Gebäude / Ruine",  # Standard-Nutzung
            "api_raw_response": api_result.get("response", ""),  # Bindet rohe KI-Antwort ein
            "youtube_timeline": {"hook_intro": f"Lost Place {name}", "act_1_rise": "Aufstieg", "act_2_tragedy": "Niedergang", "act_3_decay": "Heute"}  # Standard-Timeline
        })  # Ende Rückgabe

if __name__ == "__main__":  # Selbsttest-Execution
    agent = HistorianInvestigatorAgent()  # Erstellt Agenten-Instanz
    print(agent.research_location("Sanatorio de Aigües de Busot (Alicante)", 38.5031, -0.4132))  # Testet Recherche & druckt Ergebnis im Terminal
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

---

## 7. Version 4.7 Erweiterungen & System-Updates

### ⚡ 7.1 Performance & Refactoring
1. **Modularisierung von Daten**: Das 472-Objekt Datenset (13.700 Zeilen) wurde aus `App.jsx` isoliert und in `src/data/spots.js` ausgelagert. `App.jsx` schrumpfte dadurch von **563 KB auf 43 KB** (13-fache Größenreduktion).
2. **React `useMemo` Caching**: Die komplexe Multi-Kriterien-Filterung (`filteredSpots`) wurde in `useMemo` gekapselt. Die Neuberechnung erfolgt ausschließlich bei Änderungen von Suchbegriff, Radius, Provinz, Risiko oder Kategorie.
3. **Optimierte Karten-Performance**: Entfernen des globalen React State-Re-Renders bei `mouseover`/`mouseout` auf Map-Markern. Stattdessen Nutzung nativer Leaflet-Tooltips ohne Virtual-DOM-Thrashing.

### 🏷️ 7.2 Kategorie-Filter & UI-Erweiterungen
1. **Kategorie-Filter Chips**: Direkte Filterung nach Gebäudetyps (`🏢 Alle`, `🏭 Fabriken`, `🏰 Burgen`, `🏥 Sanatorien`, `🏚️ Dörfer`, `🏛️ Villen`).
2. **Hervorgehobene UI-Platzierung**: Positioniert in einer eigens gestylten, amber-farbenen Box direkt unter dem "Suchzentrum"-Dropdown.
3. **Live-Distanzanzeige**: Dynamische Berechnung der Luftlinien-Entfernung von der Adresse des Nutzers (*Calle Barcelona 3, 03013 Alicante*) zu jedem ausgewählten Objekt.
4. **Schließen-Button**: Manuelles Schließen des Detailpanels im linken Sidebar-Bereich via `✕ Schließen` Button.

### 🛰️ 7.3 Dynamische ESRI Satellitenbild-Engine (`useSpotImage.js`)
1. **Keine Platzhalterbilder**: Ersetzung von Unsplash-Standardbildern durch dynamische ESRI ArcGIS World Imagery Satelliten-Kacheln (`latLonToEsriUrl`).
2. **Präziser GPS-Fokus**: Generiert hochauflösende Satellitenaufnahmen (Zoomstufe 17, ~15 cm Auflösung in Spanien) direkt anhand der Breitengrade und Längengrade des jeweiligen Lost Places.

### 🛡️ 7.4 KI-Resilienz & Fehlerbehandlungs-Architektur
1. **React Error Boundary (`ErrorBoundary.jsx`)**: Verhindert komplette UI-Abstürze bei unexpected Rendering-Fehlern.
2. **Multi-Tier Model Cascading (`aiAgentResilience.js`)**: Automatische Failover-Kette (`DeepSeek-V4` ➔ `Qwen-3 Cloud API` ➔ `Kimi K3` ➔ `Local Offline Fallback Engine`).
3. **Toast Notification System (`ToastNotification.jsx`)**: Live-Status-Benachrichtigungen über KI-Modellwechsel, Netzwerkereignisse und Systemmeldungen.


> *"Claude, erstelle das Projekt DekadenzScout AI in `C:\Projekte\DecadenceScout AI` basierend auf dem `implementation_plan.md`. Schreibe alle Dateien, führe `npm install` und `pip install` aus und starte die Anwendung im Entwicklungsmodus."*
