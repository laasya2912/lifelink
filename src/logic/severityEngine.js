/**
 * severityEngine.js
 * -----------------------------------------------------------------------
 * SIMULATED: Rule-based severity scoring.
 *
 * IMPORTANT: This is a prototype classification only. It is NOT a
 * medical diagnosis and must never be presented as one.
 * -----------------------------------------------------------------------
 */

/**
 * Computes a rule-based severity classification from crash signal data.
 *
 * @param {Object} crashResult - output of evaluateCrashSignals()
 * @returns {{severity: 'Minor'|'Moderate'|'Critical', score: number, confidence: number, reason: string}}
 */
export function assessSeverity(crashResult) {
  const { signals, signalCount, confidence } = crashResult;

  let score = 0;
  score += signals.impactForce * 0.35;
  score += signals.suddenDeceleration * 0.25;
  score += signals.orientationChange * 0.2;
  score += signals.suddenStop ? 10 : 0;
  score += signals.airbagTriggered ? 10 : 0;
  score = Math.round(Math.min(100, score));

  let severity;
  let reason;

  if (score >= 80 || (signals.airbagTriggered && signalCount >= 4)) {
    severity = 'Critical';
    reason = 'Multiple high-impact crash signals detected, including airbag deployment.';
  } else if (score >= 50) {
    severity = 'Moderate';
    reason = 'Significant impact and deceleration signals detected, but not at critical thresholds.';
  } else {
    severity = 'Minor';
    reason = 'Low-intensity signals detected; consistent with a minor incident.';
  }

  return {
    severity,
    score,
    confidence,
    reason,
  };
}
