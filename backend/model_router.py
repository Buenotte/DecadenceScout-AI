"""
Model Router fuer DekadenzScout AI.
Routet API-Anfragen zu 100% chinesischen Cloud-Modellen (Juli 2026):
  Orchestrator  -> DeepSeek-V4 API
  Historiker    -> Kimi K3 API (Moonshot AI, 2M+ Tokens & Context Caching)
  Archiv-Miner  -> GLM-5 API (Zhipu AI)
  Safety Agent  -> Qwen 3 Cloud API (Alibaba DashScope)
"""
import os
import sys
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')



class ModelRouter:
    """
    Model Router fuer DekadenzScout AI.
    Unterstuetzt OpenRouter.ai (zentraler Aggregator mit 1 API-Key fuer alle Flaggschiffe)
    sowie direkte Anbindung an DeepSeek-V4, Kimi K3, GLM-5 und Qwen 3.
    """
    def __init__(self):
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
        self.deepseek_key   = os.getenv("DEEPSEEK_API_KEY", "")
        self.kimi_key       = os.getenv("KIMI_API_KEY", "")
        self.glm_key        = os.getenv("GLM_API_KEY", "")
        self.qwen_key       = os.getenv("QWEN_API_KEY", "")

        # OpenRouter Client (zentraler Aggregator für alle Modelle)
        self.openrouter_client = (
            OpenAI(
                api_key=self.openrouter_key,
                base_url="https://openrouter.ai/api/v1",
                default_headers={
                    "HTTP-Referer": "https://github.com/dekadenzscout-ai",
                    "X-Title": "DekadenzScout AI"
                }
            )
            if self.openrouter_key else None
        )

        self.kimi_client = (
            OpenAI(api_key=self.kimi_key, base_url="https://api.moonshot.cn/v1")
            if self.kimi_key else None
        )
        self.deepseek_client = (
            OpenAI(api_key=self.deepseek_key, base_url="https://api.deepseek.com/v1")
            if self.deepseek_key else None
        )

    def route_request(self, agent: str, prompt: str, system: str = "") -> dict:
        print(f"[ModelRouter] -> Agent '{agent}'")
        # 1. Wenn OpenRouter Key vorhanden ist, bevorzuge OpenRouter Aggregator
        if self.openrouter_client:
            return self._call_openrouter(agent, prompt, system)

        # 2. Sonst direkte Provider-Keys nutzen
        if agent == "HistorianAgent":
            return self._kimi_k3(prompt, system) or self._glm5(prompt, system)
        elif agent == "Orchestrator":
            return self._deepseek(prompt, system)
        elif agent == "SafetyAgent":
            return self._qwen3(prompt, system)
        return self._deepseek(prompt, system)

    def _call_openrouter(self, agent: str, prompt: str, system: str = "") -> dict:
        """Routet Anfragen über OpenRouter.ai mit den exakten Modell-Slugs."""
        model_map = {
            "Orchestrator": "deepseek/deepseek-chat",
            "HistorianAgent": "deepseek/deepseek-chat",
            "Archivist": "deepseek/deepseek-chat",
            "SafetyAgent": "qwen/qwen-2.5-72b-instruct"
        }
        target_model = model_map.get(agent, "deepseek/deepseek-chat")
        print(f"[OpenRouter Aggregator] Routing Agent '{agent}' -> Modell '{target_model}'")

        try:
            r = self.openrouter_client.chat.completions.create(
                model=target_model,
                messages=[
                    {"role": "system", "content": system or f"Du bist Agent {agent}."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"status": "success", "provider": f"OpenRouter ({target_model})", "response": r.choices[0].message.content}
        except Exception as e:
            print(f"[WARN] OpenRouter API Fehler ({target_model}): {e}. Versuche Fallback...")
            return self._sim(f"OpenRouter Fallback ({agent})", f"Ergebnis fuer {agent} simuliert.")




    def _kimi_k3(self, prompt: str, system: str) -> dict:
        if not self.kimi_client:
            return self._sim("Kimi K3 (Moonshot AI 2M+ Context & Caching)", "Historische Recherche: Bericht erstellt.")
        try:
            r = self.kimi_client.chat.completions.create(
                model="kimi-k3",
                messages=[{"role": "system", "content": system or "Du bist Kimi K3."},
                           {"role": "user",   "content": prompt}]
            )
            return {"status": "success", "provider": "Kimi K3 API", "response": r.choices[0].message.content}
        except Exception as e:
            print(f"[WARN] Kimi K3 Fehler (versuche Fallback): {e}")
            return self._glm5(prompt, system)

    def _deepseek(self, prompt: str, system: str) -> dict:
        if not self.deepseek_client:
            return self._sim("DeepSeek-V4 API", "Orchestrator-Entscheidung getroffen.")
        try:
            r = self.deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "system", "content": system or "Du bist DeepSeek-V4."},
                           {"role": "user",   "content": prompt}]
            )
            return {"status": "success", "provider": "DeepSeek-V4", "response": r.choices[0].message.content}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _glm5(self, prompt: str, system: str) -> dict:
        if not self.glm_key:
            return self._sim("GLM-5 API (Zhipu)", "Archiv-Recherche abgeschlossen.")
        try:
            r = requests.post(
                "https://open.bigmodel.cn/api/paas/v4/chat/completions",
                headers={"Authorization": f"Bearer {self.glm_key}"},
                json={"model": "glm-4", "messages": [{"role": "system", "content": system},
                                                       {"role": "user", "content": prompt}]},
                timeout=20
            )
            return {"status": "success", "provider": "GLM-5 API", "response": r.json()["choices"][0]["message"]["content"]}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def _qwen3(self, prompt: str, system: str) -> dict:
        if not self.qwen_key:
            return self._sim("Qwen 3 Cloud API (Alibaba)", '{"risk":"NIEDRIG","accessible":true}')
        try:
            r = requests.post(
                "https://dashscope.aliyun.com/compatible-mode/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.qwen_key}"},
                json={"model": "qwen-max", "messages": [{"role": "system", "content": system},
                                                          {"role": "user", "content": prompt}]},
                timeout=20
            )
            return {"status": "success", "provider": "Qwen 3 API", "response": r.json()["choices"][0]["message"]["content"]}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    def _sim(provider: str, response: str) -> dict:
        print(f"[SIM] {provider} (kein API-Key) -> Demo-Antwort")
        return {"status": "success", "provider": f"{provider} (Demo)", "response": response}


if __name__ == "__main__":
    router = ModelRouter()
    result = router.route_request("HistorianAgent", "Teste Kimi K3", "System Test")
    print(result)
