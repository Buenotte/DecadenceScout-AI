"""
Agent 3: Historiker-Investigator & Long-Context Archiv-Miner.
Nutzt Kimi K3 API (2M+ Tokens & Context Caching) fuer BOE/DOGV Amtsblaetter und Hemerotecas.
"""
from model_router import ModelRouter


class HistorianInvestigatorAgent:
    HISTORY_DB = {
        "Sanatorio de Aigues de Busot (Alicante)": {
            "construction_year": 1898,
            "original_use": "Luxus-Thermalbad & Tuberkulose-Klinik",
            "boe_entry": "Staatliche Enteignung 1939, Stilllegung 1975 (BOE Nr. 312/1975).",
            "youtube_timeline": {
                "hook": "Das bekannteste Thermalbad Spaniens – verfallen auf dem Berg Busot.",
                "act_1": "1898: Bauherr Marques de Guadalquivir eroeffnet das Luxusbad fuer den europaeischen Adel.",
                "act_2": "1936: Spanischer Buergerkrieg – Umbau zur Lungenheilstaette.",
                "act_3": "Heute: Eingestuerzte Decken, Vandalismusspuren, Natur rueckerobert die Saele."
            }
        },
        "Colonia de Santa Eulalia (Sax)": {
            "construction_year": 1887,
            "original_use": "Autarke Silberbergwerk-Kolonie mit Palast, Theater & Krankenhaus",
            "boe_entry": "DOGV Eintrag: Denkmalschutz Stufe B seit 2001.",
            "youtube_timeline": {
                "hook": "Eine ganze Stadt mitten in den Bergen – komplett verlassen.",
                "act_1": "1887: Graf Roca de Togores erbaut eine autarke Minenkolonie fuer 300 Familien.",
                "act_2": "1920: Silbererzlagerstaette erschoepft, alle Einwohner verlassen die Kolonie.",
                "act_3": "Heute: Palast, Theater und Kirche stehen noch – nur Geister bewohnen sie."
            }
        }
    }

    def __init__(self):
        self.router = ModelRouter()

    def research_location(self, name: str, lat: float, lon: float) -> dict:
        print(f"[Agent 3 - Historiker Kimi K3 API] Deep Research fuer '{name}' ({lat}, {lon})...")

        # Lokale Datenbank pruefen
        for key, data in self.HISTORY_DB.items():
            if key.lower() in name.lower() or name.lower() in key.lower():
                print(f"[OK] Lokale Datenbank: {key}")
                return data

        # Kimi K3 API fuer unbekannte Orte
        system = (
            "Du bist Kimi K3, ein Historiker-Investigator fuer verlassene Orte in Spanien (Comunitat Valenciana). "
            "Antworte auf Deutsch. Recherchiere Baujahr, Nutzungsgeschichte, BOE/DOGV-Eintraege und "
            "erstelle ein dramatisches 3-Akt YouTube-Skript."
        )
        prompt = (
            f"Recherchiere den Lost Place '{name}' bei GPS [{lat}, {lon}] in der Comunitat Valenciana. "
            "Gib aus: 1) Baujahr, 2) Urspruengliche Nutzung, 3) Grund des Verfalls, 4) BOE/DOGV Eintrag, "
            "5) YouTube Skript (Hook / Aufstieg / Niedergang / Heute)."
        )
        result = self.router.route_request("HistorianAgent", prompt, system)
        return {
            "construction_year": "unbekannt",
            "original_use": "Historisches Gebaeude",
            "boe_entry": "Recherche via Kimi K3 API",
            "api_response": result.get("response", ""),
            "youtube_timeline": {
                "hook": f"Lost Place: {name} – das vergessene Geheimnis.",
                "act_1": "Aufstieg und Bluetezeit",
                "act_2": "Niedergang und Verfall",
                "act_3": "Heute: Ruine und Stille"
            }
        }


if __name__ == "__main__":
    agent = HistorianInvestigatorAgent()
    result = agent.research_location("Sanatorio de Aigues de Busot (Alicante)", 38.5031, -0.4132)
    print("\n--- Historischer Bericht ---")
    for k, v in result.items():
        print(f"{k}: {v}")
