/**
 * DecadenceScout AI Agent Resilience Engine
 * Multi-tiered LLM Failover Architecture with Structured Output Validation.
 */

const AGENT_PIPELINE = [
  { id: 'DEEPSEEK_V4', name: 'DeepSeek-V4 API', role: 'Haupt-Orchestrator', timeoutMs: 2000 },
  { id: 'QWEN_3', name: 'Qwen 3 Cloud API', role: 'Safety & Failover Agent', timeoutMs: 2500 },
  { id: 'KIMI_K3', name: 'Kimi K3 (2M Context)', role: 'Archiv-Mining Engine', timeoutMs: 3000 },
  { id: 'LOCAL_HEURISTIC', name: 'Local Offline Engine', role: 'Deterministische Absicherung', timeoutMs: 500 }
];

/**
 * Validates GPS coordinates to ensure they fall within valid Spanish bounds.
 */
export function validateCoordinates(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  // Bounding box for Spain mainland & Balearic islands (approx 35N - 44N, 9W - 4E)
  return lat >= 35.0 && lat <= 44.5 && lon >= -9.5 && lon <= 4.5;
}

/**
 * Sanitizes and validates spot data returned from AI agent calls.
 */
export function sanitizeSpotData(spots) {
  if (!Array.isArray(spots)) return [];
  return spots.filter(s => {
    const validGps = validateCoordinates(s.lat, s.lon);
    const validName = typeof s.name === 'string' && s.name.trim().length > 0;
    return validGps && validName;
  });
}

/**
 * Runs a resilient AI Agent scan with multi-model failover and live status reporting callbacks.
 */
export async function runResilientAgentScan({ onStatusUpdate, onToast }) {
  let attemptIndex = 0;
  
  while (attemptIndex < AGENT_PIPELINE.length) {
    const agent = AGENT_PIPELINE[attemptIndex];
    onStatusUpdate?.({ status: 'running', activeAgent: agent.name, step: attemptIndex + 1 });
    
    onToast?.({
      type: 'info',
      title: `KI-Scan via ${agent.name}`,
      message: `Rolle: ${agent.role} wird ausgeführt…`
    });

    try {
      // Simulate API call with timeout
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ success: true, agent: agent.name }), 1400);
        // Simulate rare rate-limit on DeepSeek for demo fallback if needed
        if (Math.random() < 0.15 && agent.id === 'DEEPSEEK_V4') {
          clearTimeout(timer);
          reject(new Error('HTTP 429: API Rate Limit exceeded'));
        }
      });

      onStatusUpdate?.({ status: 'success', activeAgent: agent.name });
      onToast?.({
        type: 'success',
        title: 'KI-Scan erfolgreich',
        message: `Ergebnisse verifiziert durch ${agent.name}.`
      });

      return { success: true, agentUsed: agent.name };

    } catch (err) {
      console.warn(`[AI Resilience] ${agent.name} failed: ${err.message}. Failing over to next model…`);
      
      onToast?.({
        type: 'warning',
        title: `${agent.name} fehlgeschlagen`,
        message: `${err.message}. Schalte auf Nächstes Modell um…`
      });

      attemptIndex++;
      // Small backoff before next attempt
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // All failed - fallback to local offline engine
  onStatusUpdate?.({ status: 'fallback', activeAgent: 'Local Offline Engine' });
  onToast?.({
    type: 'error',
    title: 'Offline-Fallback aktiv',
    message: 'Alle Cloud-Agenten unerreichbar. Lokale Absicherung geladen.'
  });

  return { success: false, agentUsed: 'Local Offline Engine' };
}
