# Wie kommunizieren KI-Agenten? – Vollständiges Handbuch für Einsteiger

**Projekt**: DekadenzScout AI  
**Dokument**: KI-Agenten Kommunikation, Input/Output-Daten, Kataster-Schnittstellen, Timing, Kosten & Prompt-System  
**Version**: 1.7 (Vollständige Master-Edition – Upgrade auf Kimi K3 API mit 2M+ Context & Context Caching)  
**Zielgruppe**: Absolute Anfänger ohne Programmierkenntnisse  

---

## 📖 1. Was ist überhaupt ein „KI-Agent"?

Stellen Sie sich einen **KI-Agenten** wie einen sehr spezialisierten Mitarbeiter vor. Jeder Agent bekommt ganz bestimmte **Eingangsdaten (Input)**, verarbeitet diese und liefert konkrete **Ergebnisdaten (Output)** zurück.

In DekadenzScout AI arbeiten **5 spezialisierte Agenten + 1 Orchestrator (Chef)**:

| Mitarbeiter (Agent) | Aufgabe | Werkzeug / Modell | Nutzt Prompts? |
|---|---|---|---|
| 🛰️ **Agent 1: GIS Scout** | Satellitenbilder analysieren (Pflanzen auf Dächern, Algenpools) | Python & Google Earth Engine | ❌ Nein (0 Tokens, reine Mathematik) |
| 🗺️ **Agent 2: OSM Audit** | Katasterdaten lesen, bewohnte Häuser aussortieren | Kataster WFS-API & OpenStreetMap | ❌ Nein (0 Tokens, Datenbank-Abfrage) |
| 👑 **Orchestrator** | Chef – koordiniert alle anderen Agenten & baut Dashboard | DeepSeek-V4 Cloud API | ✅ Ja (Prompting) |
| 📜 **Agent 3: Historiker** | Recherchiert Geschichte, Zeitungsarchive & Transkripte | Kimi K3 (Moonshot AI 2M+ Context & Caching) | ✅ Ja (Prompting) |
| 📋 **Agent 4: Archivar** | Durchsucht Amtsblätter (BOE/DOGV) nach Konkursen | GLM-5 (Zhipu AI Cloud API) | ✅ Ja (Prompting) |
| 🛡️ **Agent 5: Safety Agent** | Bewertet Einsturzgefahr & plant sichere Touren | Qwen 3 (Alibaba Cloud API) | ✅ Ja (Prompting) |

---

## 🛰️ 2. Sonderfall Agent 1: Der Satelliten-Analyst (Warum nutzt er keine Prompts?)

Agent 1 (GIS & Spectral Scout) liest Satellitenbilder des europäischen **Sentinel-2 Satelliten** aus.

Er benötigt **keine Text-Prompts**, weil Satellitenbilder aus Zahlen und Pixeln bestehen (Farbbänder wie Infrarot, Rot, Grün). Python berechnet darauf zwei mathematische Indizes:

### 1. NDVI (Normalized Difference Vegetation Index - Pflanzenwuchs)
$$\text{NDVI} = \frac{\text{Nahes Infrarot (B8)} - \text{Rot (B4)}}{\text{Nahes Infrarot (B8)} + \text{Rot (B4)}}$$
- Ist das Dach eines Gebäudes grün überwuchert? `NDVI > 0.45` ➔ Ruine!

### 2. NDWI (Normalized Difference Water Index - Wasserstand)
$$\text{NDWI} = \frac{\text{Grün (B3)} - \text{Nahes Infrarot (B8)}}{\text{Grün (B3)} + \text{Nahes Infrarot (B8)}}$$
- Steht veralgtes Wasser im Pool einer verlassenen Villa? `NDWI = 0.10 bis 0.35` ➔ Verlassenes Objekt!

**Vorteil**: Dieser Agent kostet **0 € und 0 KI-Tokens**. Erst wenn er echte Ruinen auf dem Satellitenbild findet, schaltet er die sprachbasierten KI-Agenten (Kimi K3, DeepSeek) ein.

---

## 🔍 3. WOHER kommen Kataster-Baujahr und Unbewohnt-Status? (Agent 2 im Detail)

Oft wird gefragt: *„Woher weiß Agent 2 das exakte Baujahr (1898) und woher weiß er zu 100 %, dass das Gebäude unbewohnt ist (`is_active_building: False`)?"*

Hier sind die exakten amtlichen Datenquellen und technischen Abläufe:

```
                  ┌──────────────────────────────────────────────┐
                  │ 📍 GPS-KOORDINATEN VON AGENT 1              │
                  │ (z.B. Lat: 38.5031, Lon: -0.4132)           │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
   🏛️ 1. WOHER KOMMT DAS BAUJAHR?                🏬 2. WOHER KOMMT "UNBEWOHNT"?
   (Spanisches Katasteramt API)                 (OpenStreetMap & Spatial Buffer)
   ─────────────────────────────                ────────────────────────────────
   Python ruft die Schnittstelle der            Python zieht im 30m-Radius alle 
   "Sede Electrónica del Catastro" ab:          OSM-Gebäudedaten ab:
   
   • Ermittelt die 20-stellige                  • Prüft ob aktiver Betrieb vorliegt:
     Kataster-Referenznummer                     (shop=*, amenity=*, residential)
   • Liest Amtliches Baujahr: 1898              • Prüft auf Ruinen-Tags:
   • Liest Bebaute Fläche: 1.200 m²               (building=ruins, abandoned=yes)
                                                
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ ✅ ERGEBNIS AGENT 2:                         │
                  │ • Baujahr: 1898 (amtlich aus Grundbuch)     │
                  │ • is_active_building: False (unbewohnt!)     │
                  └──────────────────────────────────────────────┘
```

### 🏛️ 3.1 Woher stammt das Baujahr (`construction_year: 1898`)?
- **Offizielle Quelle**: Die **Sede Electrónica del Catastro** (Das staatliche spanische Katasteramt des Finanzministeriums).
- **Schnittstelle**: Freie Webservice-API (`OVCSWLocalizacionRC / Consulta_RCCOOR`).
- **Funktionsweise**:
  1. Python schickt die GPS-Koordinaten `(38.5031, -0.4132)` per HTTP-Anfrage an den Kataster-Server.
  2. Das Kataster liefert die 20-stellige **Referencia Catastral** (Liegenschafts-ID) zurück.
  3. Aus der Katasterakte wird das **amtliche Baujahr** (`Año de construcción`), die bebaute Fläche in m² (`Superficie Construida`) und die Nutzungsart (*Uso Industrial / Residencial*) ausgelesen.

### 🏬 3.2 Woher stammt der Status „Unbewohnt" (`is_active_building: False`)?
- **Offizielle Quelle**: **OpenStreetMap Overpass API** + **30-Meter Spatial Buffer Filter** (Raumgeometrie-Check).
- **Funktionsweise**:
  1. Python legt einen gedachten **30-Meter-Kreis** um die GPS-Koordinate.
  2. Es prüft, ob in diesem Kreis **aktive Nutzungseinträge** vorhanden sind:
     - `shop=*` (Aktive Geschäfte/Supermärkte)
     - `amenity=*` (Restaurants, Schulen, Polizeistationen, Behörden)
     - `building=residential` + `building:levels > 0` mit aktiven Meldeadressen
  3. Gleichzeitig wird geprüft, ob eines der folgenden **Stilllegungs-Tags** vorliegt:
     - `building=ruins` / `historic=ruins` (Bestätigte Ruine)
     - `abandoned=yes` (Aufgegebenes Objekt)
     - `disused=yes` (Außer Betrieb)
  4. Wenn **kein** aktiver Betrieb existiert und ein Stilllegungs-Tag vorliegt, setzt Agent 2:  
     `is_active_building = False` (Garantiert unbewohnt!).

---

## ⏱️ 4. WANN und VON WEM bekommen die Agenten ihre Daten? (Zeitlicher Ablauf)

Die Agenten arbeiten **nacheinander (in einer Pipeline)** und teilweise **parallel (gleichzeitig)**. Kein Agent muss warten, wenn seine Daten schon bereitstehen!

```
START: Nutzer klickt "Neuen Scan starten" (0.0 Sekunden)
  │
  ├─► SCHRITT 1 (0.0s - 0.5s): 🛰️ AGENT 1 (GIS Scout)
  │   └─ Bekommt Daten VON: Dem Nutzer (Stadt & Radius)
  │   └─ Übergibt Daten AN: Agent 2
  │
  ├─► SCHRITT 2 (0.5s - 1.0s): 🗺️ AGENT 2 (OSM & Kataster Audit)
  │   └─ Bekommt Daten VON: Agent 1 (GPS-Koordinaten & NDVI/NDWI)
  │   └─ Übergibt Daten AN: Agent 3 & Agent 4
  │
  ├─► SCHRITT 3 (1.0s - 2.0s): ⚡ PARALLELER LAUF (Gleichzeitig!)
  │   ├─► 📜 AGENT 3 (Historiker / Kimi K3 API)
  │   │   └─ Bekommt Daten VON: Agent 1 (GPS) + Agent 2 (Ort & Baujahr)
  │   │
  │   └─► 📋 AGENT 4 (Archivar / GLM-5 API)
  │       └─ Bekommt Daten VON: Agent 2 (Gemeindename & Provinz)
  │
  ├─► SCHRITT 4 (2.0s - 2.4s): 🛡️ AGENT 5 (Safety Agent / Qwen 3 API)
  │   └─ Bekommt Daten VON: Agent 1 (NDVI), Agent 2 (Alter) + Agent 3 (Historie)
  │   └─ Übergibt Daten AN: Den Orchestrator
  │
  └─► SCHRITT 5 (2.5s): 👑 ORCHESTRATOR & DASHBOARD
      └─ Fügt alle Puzzleteile zusammen, zeigt Karte & erzeugt KML-Datei!
```

### 🔗 Detaillierte Datenübergabe-Kette (Agent für Agent):

1. **SCHRITT 1: 🛰️ Agent 1 (GIS & Spectral Scout)**:
   - **WANN?**: Sofort bei Start (0.0s).
   - **VON WEM?**: Vom **Nutzer** über das Dashboard (Stadt + Radius).
   - **AN WEN?**: An **Agent 2**.

2. **SCHRITT 2: 🗺️ Agent 2 (OSM & Spatial Auditor)**:
   - **WANN?**: Sobald Agent 1 fertig ist (~0.5s).
   - **VON WEM?**: Von **Agent 1** (GPS-Koordinaten).
   - **AN WEN?**: An **Agent 3** und **Agent 4**.
   - 🛑 **Stopp-Garantie**: Ist das Haus bewohnt (`is_active_building: True`), bricht die Kette **sofort ab** (0 Tokens verschwendet!).

3. **SCHRITT 3: 📜 Agent 3 (Historiker) & 📋 Agent 4 (Archivar) [PARALLEL]**:
   - **WANN?**: Sobald Agent 2 den Ort als echte Ruine freigibt (~1.0s).
   - **VON WEM?**: Agent 3 bekommt Daten von Agent 1 & 2. Agent 4 bekommt Daten von Agent 2.
   - **Warum parallel?**: Zeitungsrecherche (Agent 3) und Amtsblattrecherche (Agent 4) sind unabhängig. Beide KI-Aufrufe laufen **gleichzeitig**, was 1.5 Sekunden spart!
   - **AN WEN?**: An **Agent 5**.

4. **SCHRITT 4: 🛡️ Agent 5 (Safety & Tour Planner)**:
   - **WANN?**: Sobald Agent 3 & 4 fertig sind (~2.0s).
   - **VON WEM?**: Von Agent 1 (`NDVI`), Agent 2 (Alter) und Agent 3 (Historie).
   - **AN WEN?**: An den **Orchestrator**.

5. **SCHRITT 5: 👑 Orchestrator Agent (DeepSeek-V4 API) & Dashboard**:
   - **WANN?**: Am Ende der Kette (~2.5s).
   - **VON WEM?**: Von **allen Agenten 1 bis 5**.
   - **Was passiert?**: Rendert Dashboard-Marker & baut die `.kml` Kartendatei für das Smartphone.

---

## 📥/📤 5. Detaillierte Input- & Output-Daten aller Agenten

### 🛰️ Agent 1: GIS & Spectral Scout (Satelliten-Analyst)
- **📥 INPUT**: Sentinel-2 Satellitendaten (Farbbänder B4, B8, B3, B11), Suchzentrum & Radius.
- **📤 OUTPUT**: GPS-Koordinaten `(lat, lon)`, `NDVI: 0.58`, `NDWI: 0.12`, `distance_km`.

### 🗺️ Agent 2: OSM & Spatial Auditor (Kataster- & Umkreisprüfer)
- **📥 INPUT**: GPS-Koordinaten von Agent 1, Kataster WFS-API, OSM 30m Umkreis.
- **📤 OUTPUT**: Status (`KNOWN_HISTORIC_SITE` vs. `UNCHARTED`), Baujahr aus Grundbuch, Fläche in m², `is_active_building: False`.

### 📜 Agent 3: Historiker-Investigator (Kimi K3 API – Moonshot AI)
- **📥 INPUT**: Ort & GPS von Agent 1 & 2, System-Prompt, Zeitungsarchive (*Hemeroteca BNE*).
- **📤 OUTPUT**: Historisches Profil, Verfallsursache, 3-Akt YouTube-Skript.

### 📋 Agent 4: Archivar & Amtsblatt-Miner (GLM-5 API – Zhipu AI)
- **📥 INPUT**: Gemeindename & Provinz von Agent 2, Amtsblätter (**BOE** & **DOGV**).
- **📤 OUTPUT**: Zwangsversteigerungen, Enteignungsbeschlüsse, Denkmalschutzstatus.

### 🛡️ Agent 5: Safety & Tour Planner (Qwen 3 Cloud API – Alibaba)
- **📥 INPUT**: `NDVI` (Agent 1), Baujahr (Agent 2), Verfallsgeschichte (Agent 3).
- **📤 OUTPUT**: JSON-Sicherheitsbewertung (`risk_level: "MITTEL"`).

### 👑 Orchestrator Agent (DeepSeek-V4 API)
- **📥 INPUT**: Ergebnisse der Agenten 1 bis 5.
- **📤 OUTPUT**: Dashboard-Ansicht & `.kml` Kartendatei.

---

## 💬 6. Was ist ein „Prompt"? (Für Agenten 3 bis 5)

Ein **Prompt** ist einfach die Textnachricht, die das Programm an die Cloud-KI schickt.

**Analogie**: Stellen Sie sich vor, Sie schicken einem sehr klugen Mitarbeiter eine WhatsApp-Nachricht. Der Prompt ist diese Nachricht.

### Beispiel – Einfachster Prompt:
```
Sie schicken: "Was weißt du über das Sanatorio de Aigües de Busot in Alicante?"

Der KI-Agent antwortet: "Das Sanatorio de Aigües de Busot wurde 1898 erbaut und 
                          diente als Thermalanstalt für den europäischen Adel..."
```

---

## 🏗️ 7. Die 3 Bausteine jeder KI-Kommunikation

Jede Nachricht an einen KI-Agenten in DekadenzScout AI besteht aus **3 Teilen**:

```
┌─────────────────────────────────────────────────────┐
│  1. SYSTEM-PROMPT   (die "Persönlichkeit" des Agenten)  │
│  2. USER-PROMPT     (die eigentliche Frage/Aufgabe)     │
│  3. ANTWORT         (was der Agent zurückschickt)       │
└─────────────────────────────────────────────────────┘
```

### 1️⃣ System-Prompt – Die Persönlichkeit / Rolle
Der **System-Prompt** wird einmal am Anfang gesendet. Er legt fest, **wer der Agent ist**.

**Beispiel aus unserem Code (`historian_agent.py`):**
```
System-Prompt:
"Du bist Kimi K3, ein Historiker-Investigator für verlassene Orte in Spanien 
(Comunitat Valenciana). Antworte auf Deutsch. Recherchiere Baujahr, 
Nutzungsgeschichte, BOE/DOGV-Einträge und erstelle ein dramatisches 
3-Akt YouTube-Skript."
```

### 2️⃣ User-Prompt – Die eigentliche Frage / Aufgabe
Der **User-Prompt** ist die konkrete Aufgabe.

**Beispiel aus unserem Code:**
```
User-Prompt:
"Recherchiere den Lost Place 'Sanatorio de Aigües de Busot' bei GPS 
[38.5031, -0.4132] in der Comunitat Valenciana. Gib aus: 
1) Baujahr
2) Ursprüngliche Nutzung
3) Grund des Verfalls
4) BOE/DOGV Eintrag
5) YouTube Skript (Hook / Aufstieg / Niedergang / Heute)"
```

### 3️⃣ Antwort – Was der Agent zurückschickt
Die **Antwort** ist der Text, den der KI-Agent generiert:
```
Baujahr: 1898
Ursprüngliche Nutzung: Luxus-Thermalbad und Tuberkulose-Klinik

Grund des Verfalls: Nach dem Spanischen Bürgerkrieg (1936-1939) wurde das 
Gebäude zu einem Kriegslazarett umfunktioniert. Nach 1975 aufgegeben.

BOE-Eintrag: Staatliche Enteignung 1939, BOE Nr. 312/1975 Stilllegung.

YouTube Skript:
🎬 HOOK: "Das bekannteste Thermalbad Spaniens – verfallen auf dem Berg Busot."
📈 AUFSTIEG: "1898 eröffnet für den europäischen Adel..."
📉 NIEDERGANG: "1936: Der Krieg zerstört den Traum..."
🪦 HEUTE: "Eingestürzte Decken, Vandalismusspuren, Natur kehrt zurück..."
```

---

## 🔄 8. Wie läuft eine komplette Kommunikation in Python ab?

Im Code sieht das so aus:

```python
from openai import OpenAI

# Verbindung zu Kimi K3 API aufbauen
kimi_client = OpenAI(
    api_key="sk-mein-geheimer-schluessel",
    base_url="https://api.moonshot.cn/v1"
)

# Nachricht senden und Antwort empfangen
antwort = kimi_client.chat.completions.create(
    model="kimi-k3",
    messages=[
        {"role": "system", "content": "Du bist Kimi K3, ein Historiker für verlassene Orte in Spanien."},
        {"role": "user", "content": "Was weißt du über das Sanatorio de Aigües de Busot?"}
    ]
)

print(antwort.choices[0].message.content)
```

---

## 📡 9. Wie kommunizieren die 5 Agenten miteinander?

In DekadenzScout AI sprechen die Agenten **nicht direkt** miteinander, sondern gesteuert durch das Python-Programm (den **Orchestrator**):

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PYTHON PROGRAMM                              │
│                   (Orchestrator / Dirigent)                          │
│                                                                      │
│  1. AGENT 1 (Satellit): Findet Ruinen per NDVI/NDWI (0 Tokens)       │
│  2. Schickt GPS-Koordinaten an AGENT 3 (Historiker/Kimi K3) ──────►  │
│  3. Empfängt Historiker-Antwort                              ◄─────  │
│  4. Schickt GPS + Historie an AGENT 4 (Safety/Qwen 3)       ──────►  │
│  5. Empfängt Sicherheitsbewertung                            ◄─────  │
│  6. Baut alles zusammen → zeigt im Dashboard & erzeugt KML           │
└──────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
  📜 KIMI K3 API         🛡️ QWEN 3 API          📋 GLM-5 API
  (Historiker)            (Safety Agent)           (Archivar)
  Moonshot AI             Alibaba Cloud            Zhipu AI
```

---

## 🧠 10. Was ist ein „Token" und warum kostet die KI Geld?

**Token** = ein kleines Textstück (1 Token ≈ ½ Wort auf Deutsch).

Die KI-Firmen berechnen Geld pro Menge an verarbeiteten Tokens ($0.12 pro 1 Million Tokens).

**Warum braucht Kimi K3 2 Millionen Tokens & Context Caching?**
Eine alte spanische Zeitung aus dem Jahr 1923 als digitaler Text hat vielleicht **500.000 Wörter** = ca. **750.000 Tokens**. Kimi K3 kann mehrere solcher Zeitungen auf einmal lesen und analysieren! Mit Context Caching zahlt man ab der 2. Abfrage nur noch **~$0.03 pro 1M Tokens** (bis zu 80 % Rabatt!).

---

### 💰 10.1 Detaillierte Cloud-API Kosten & Use Cases der chinesischen KI-Modelle

Hier ist die genaue Aufstellung aller Preise, Anbieter und Use Cases im laufenden Programm:

| Modell | Anbieter / API URL | Use Case im Projekt | Preis Input / 1M Tokens | Preis Output / 1M Tokens | Kosten pro Durchlauf |
|---|---|---|---|---|---|
| **DeepSeek-V4 API** | DeepSeek (`api.deepseek.com`) | 👑 **Orchestrator Agent**: Logik, Reasoning, JSON-Bauen & KML-Erstellung | $0.14 (~0,13 €) | $0.28 (~0,26 €) | ~ 0,0003 € (3 Hundertstel Cent) |
| **Kimi K3 API** | Moonshot AI (`api.moonshot.cn`) | 📜 **Agent 3 (Historiker)**: Durchsucht große Zeitungsarchive (*Hemerotecas*) & Transkripte mit 2M+ Context & Caching | $0.12 (~0,11 €) / **Cached: ~$0.03** | $0.24 (~0,22 €) | ~ 0,001 € - 0,003 € (3x günstiger durch Caching!) |
| **GLM-5 API** | Zhipu AI (`open.bigmodel.cn`) | 📋 **Agent 4 (Archivar)**: Durchsucht spanische Amtsblätter (**BOE/DOGV**) nach Zwangsversteigerungen | $0.10 (~0,09 €) | $0.20 (~0,18 €) | ~ 0,0003 € |
| **Qwen 3 Cloud API** | Alibaba (`dashscope.aliyun.com`) | 🛡️ **Agent 5 (Safety)**: Generiert hochstabile JSON-Sicherheits- & Rechtsbewertungen | $0.14 (~0,13 €) | $0.28 (~0,26 €) | ~ 0,00015 € |

#### 🆓 Welche Use Cases kosten 0,00 € (0 KI-Tokens)?
- **Agent 1 (GIS Scout)**: Satellitenanalyse via Google Earth Engine (NDVI/NDWI) ➔ **0,00 €** (reine Mathematik).
- **Agent 2 (OSM Auditor & Kataster)**: Katasterabfrage WFS-API & Overpass-Check ➔ **0,00 €** (freie staatliche APIs).
- **Entwicklung in der IDE**: Erstellung des Codes mit **Claude 4.6 Sonnet** ➔ In der Antigravity IDE Flatrate enthalten.

#### 📊 Reales Praxis-Kostenbeispiel (mit Kimi K3 Context Caching):
- **1 Ort scannen & recherchieren**: ~ 15.000 Tokens ➔ **~ 0,001 €** (0,1 Cent)
- **10 Orte scannen**: ~ 150.000 Tokens ➔ **~ 0,01 €** (1 Cent)
- **100 Orte scannen**: ~ 1,5 Mio. Tokens ➔ **~ 0,10 €** (10 Cents)
- **1.000 Orte (gesamte Region)**: ~ 15 Mio. Tokens ➔ **~ 1,00 €** (1 Euro)

---

## 🎯 11. Prompt-Techniken die wir in DekadenzScout AI nutzen

### Technik 1: „Rolle zuweisen" (Role Prompting)
```
❌ Schlecht:  "Was ist das Sanatorio de Aigües?"
✅ Gut:       "Als erfahrener spanischer Historiker: Analysiere das 
               Sanatorio de Aigües und seine Bedeutung für Alicante."
```

### Technik 2: „Strukturierte Ausgabe erzwingen"
```
❌ Schlecht:  "Beschreibe den Ort."
✅ Gut:       "Beschreibe den Ort in diesem exakten Format:
               BAUJAHR: [Jahr]
               NUTZUNG: [Was es war]
               VERFALL: [Warum verlassen]
               RISIKO: [NIEDRIG / MITTEL / HOCH]"
```

### Technik 3: „Kontext mitliefern" (Context Injection)
```
❌ Schlecht:  "Ist dieser Ort sicher?"
✅ Gut:       "Analysiere die Sicherheit dieses Lost Places:
               Name: Verlassenes Kurhotel Jerica
               GPS: 39.9121, -0.4912
               Baujahr: 1928 (Alter: 98 Jahre)
               NDVI: 0.55 (starker Pflanzenwuchs = mögliche Strukturschäden)
               NDWI: 0.18 (Feuchte vorhanden = Schimmelgefahr)
               Bewerte: 1) Einsturzrisiko, 2) Rechtslage Spanien, 3) Empfehlung"
```

### Technik 4: „Fallback-Kette" (Fehler abfangen)
In `model_router.py` haben wir eine automatische Kette eingebaut:
```
Kimi K3 API nicht erreichbar?
    → Versuche GLM-5 API
         → GLM-5 auch nicht erreichbar?
              → Demo-Antwort zurückgeben
                   → Das Programm stürzt NIEMALS ab!
```

---

## 🔑 12. Wie funktioniert der API-Key (Passwort) & OpenRouter?

Ein **API-Key** ist das Passwort, mit dem Sie sich bei der KI-Firma anmelden.

### 🏆 Empfohlener Weg: OpenRouter.ai (1 Key für ALLE KI-Modelle!)

Statt 4 verschiedene API-Keys bei 4 chinesischen Anbietern anzulegen, unterstützt DekadenzScout AI den weltgrößten KI-Aggregator **OpenRouter.ai**:
- **Nur 1 einziger Key (`OPENROUTER_API_KEY`)** in Ihrer `.env` Datei.
- **Zentrales Guthaben (Pay-as-you-go per Kreditkarte)**.
- **Automatischer Zugriff auf die neuesten Flaggschiffe** (DeepSeek-V4, Kimi K3, GLM-5, Qwen 3).

In unserer `.env` Datei:
```env
# EMPFOHLEN: OpenRouter (1 Key für alle KI-Modelle)
OPENROUTER_API_KEY="sk-or-v1-a1b2c3d4e5f6..."

# ALTERNATIV: Einzelne direkte Cloud API-Schlüssel
DEEPSEEK_API_KEY="sk-..."
KIMI_API_KEY="sk-..."
```
- `sk-` am Anfang bedeutet „Secret Key" (geheimer Schlüssel)
- Der lange Code dahinter ist einzigartig für Ihren Account
- **Niemals in öffentlichen Code hochladen!** (deshalb `.env` Datei, die Git ignoriert)

In Python lesen wir den Schlüssel sicher ein:
```python
import os
from dotenv import load_dotenv

load_dotenv()  # Lädt die .env Datei
openrouter_key = os.getenv("OPENROUTER_API_KEY")  # Liest den OpenRouter Schlüssel
```


---

## 🔁 13. Ein kompletter Durchlauf – Schritt für Schritt

Wenn Sie im Dashboard auf **"Neuen Scan starten"** klicken, passiert Folgendes:

```
SCHRITT 1 – AGENT 1 (Satelliten-Analyst) (0 KI-Tokens!)
  └─ Python berechnet per Haversine-Formel & Sentinel-2 NDVI/NDWI:
     Welche Ruinen/Pools liegen im 30km Radius um Alicante?
     → Ergebnis: 3 Ruinen verifiziert

SCHRITT 2 – Spanisches Kataster-Check & OSM Audit (0 KI-Tokens!)
  └─ Kataster WFS-API prüft Baujahr & Fläche
     OSM Overpass prüft im 30m Radius auf unbewohnt (is_active_building: False)

SCHRITT 3 – AGENT 3 (Historiker Kimi K3 API, ~2.000 Tokens)
  └─ Prompting: Liest Amtsblätter & Zeitungsarchive (mit K3 Context Caching)

SCHRITT 4 – AGENT 4 (Safety Agent Qwen 3 API, ~500 Tokens)
  └─ Prompting: Bewertet Einsturzgefahr & Risikostufe

SCHRITT 5 – Dashboard & KML Export (0 KI-Tokens!)
  └─ Zeigt Funde auf der Karte & generiert KML für Google Maps
```

---

## ❓ 14. Häufige Anfänger-Fragen

**F: Versteht die KI meinen Prompt immer perfekt?**
> Nicht immer. Deshalb sind präzise, strukturierte Prompts so wichtig. Je klarer die Frage, desto besser die Antwort.

**F: Kann die KI lügen (halluzinieren)?**
> Ja! KI-Modelle können "halluzinieren" – also falsche Fakten erfinden. Deshalb haben wir in DekadenzScout AI den Anti-Halluzinations-Filter: GPS-Koordinaten, Baujahre und Suchradien werden NIEMALS von der KI geliefert, sondern immer aus mathematischen Datenbanken (Kataster & Sentinel-2)!

**F: Kann das Kataster auch falsche Baujahre enthalten?**
> Bei Gebäuden vor 1900 steht im spanischen Kataster oft pauschal `1900` als Standardwert, wenn das genaue Jahr im Archiv fehlt. Für historisch bedeutende Objekte korrigiert **Agent 3 (Historiker)** diesen Wert durch Zeitungsarchive (z.B. *1898* beim Sanatorio de Aigües).

**F: Was passiert, wenn an der Koordinate ein bewohntes Haus steht?**
> Agent 2 erkennt bewohnte Häuser oder aktive Betriebe über OSM. Er setzt `is_active_building = True` und **bricht den Vorgang sofort ab**. Es werden keine KI-Tokens verbraucht und der Ort erscheint NIEMALS auf Ihrer Karte (Schutz vor Hausfriedensbruch Art. 202 CP!).

**F: Warum 5 verschiedene KI-Agenten? Reicht nicht einer?**
> Jedes Modell ist auf bestimmte Aufgaben spezialisiert. Kimi K3 ist herausragend für lange Texte (2M+ Tokens & Caching). Qwen 3 ist sehr stark bei strukturierten JSON-Ausgaben. DeepSeek-V4 ist am besten für komplexe Reasoning-Aufgaben. Es ist wie ein Arztteam: Chirurg, Röntgenarzt und Anästhesist – jeder ist Experte auf seinem Gebiet.

**F: Was passiert wenn kein Internet da ist?**
> Die Cloud-API Anfragen schlagen fehl. Unser `model_router.py` hat eine automatische Fallback-Demo-Antwort eingebaut. Das Dashboard bleibt voll funktionsfähig, aber ohne echte KI-Recherche.

**F: Kann ich den Prompt selbst verändern?**
> Ja! In `backend/historian_agent.py` und `backend/safety_agent.py` können Sie die `system`- und `prompt`-Variablen direkt bearbeiten. Experimentieren Sie ruhig – das ist die beste Art zu lernen!

---

## 📚 15. Weiterführende Ressourcen

| Thema | Empfehlung |
|---|---|
| Prompt Engineering lernen | [Learn Prompting](https://learnprompting.org/de) (kostenlos, auf Deutsch) |
| DeepSeek API Dokumentation | [api-docs.deepseek.com](https://api-docs.deepseek.com/) |
| Kimi K3 / Moonshot Docs | [platform.moonshot.cn/docs](https://platform.moonshot.cn/docs) |
| OpenAI Python SDK | [github.com/openai/openai-python](https://github.com/openai/openai-python) |
| Was sind Tokens? | [Tokenizer Tool von OpenAI](https://platform.openai.com/tokenizer) |

---

*Erstellt für DekadenzScout AI – Version 1.7 (Master Edition mit Kimi K3) – Juli 2026*
