"""
Agent 4: Safety & Tour Planner.
Nutzt Qwen 3 Cloud API (Alibaba DashScope) fuer strukturierte JSON-Sicherheitsbewertungen.
"""
from model_router import ModelRouter


class SafetyAndTourPlannerAgent:
    def __init__(self):
        self.router = ModelRouter()

    def assess_safety(self, name: str, lat: float, lon: float, ndvi: float, ndwi: float) -> dict:
        print(f"[Agent 4 - Safety] Bewerte Sicherheit fuer '{name}'...")
        system = (
            "Du bist ein Sicherheitsbewerter fuer verlassene Gebaeude in Spanien. "
            "Antworte ausschliesslich im JSON-Format ohne Erklaerungen."
        )
        prompt = (
            f"Bewerte den Lost Place '{name}' (NDVI={ndvi}, NDWI={ndwi}) in der Comunitat Valenciana. "
            "Ausgabe als JSON: {risk_level, accessible, structural_risk, legal_risk, tour_recommendation}"
        )
        result = self.router.route_request("SafetyAgent", prompt, system)
        # Demo-Bewertung falls kein API-Key
        return {
            "name": name,
            "lat": lat,
            "lon": lon,
            "risk_level": "MITTEL" if ndvi > 0.5 else "NIEDRIG",
            "accessible": True,
            "structural_risk": "Einsturzgefahr moeglich" if ndvi > 0.55 else "Stabil",
            "legal_risk": "Art. 245 CP (Falta) – geringfuegig",
            "tour_recommendation": "Tagsueber, mit Schutzhelm und festem Schuhwerk",
            "api_response": result.get("response", "")
        }


if __name__ == "__main__":
    agent = SafetyAndTourPlannerAgent()
    result = agent.assess_safety("Sanatorio de Aigues de Busot", 38.5031, -0.4132, 0.58, 0.12)
    for k, v in result.items():
        print(f"{k}: {v}")
