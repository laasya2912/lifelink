/**
 * crashDetection.js
 * -----------------------------------------------------------------------
 * SIMULATED: Rule-based crash signal detection.
 *
 * This is NOT AI/ML. It is deterministic, threshold-based prototype
 * logic that simulates the kind of signals a vehicle/phone sensor
 * fusion system might produce (impact force, deceleration, sudden
 * stop, orientation change, airbag trigger). Multiple signals must
 * cross their thresholds before an "accident" is confirmed.
 * -----------------------------------------------------------------------
 */

const THRESHOLDS = {
  impactForce: 70, // out of 100
  suddenDeceleration: 65, // out of 100
  orientationChange: 60, // degrees-equivalent scale out of 100
};

const MIN_SIGNALS_REQUIRED = 3;

/**
 * Generates a simulated set of crash sensor signals.
 * In a real deployment these would come from accelerometer/gyroscope
 * hardware. Here they are randomized within a realistic "accident-like"
 * band so every demo run produces a plausible, slightly different
 * incident.
 */
export function generateSimulatedSignals() {
  const rand = (min, max) => Math.round(min + Math.random() * (max - min));

  return {
    impactForce: rand(75, 98),
    suddenDeceleration: rand(70, 95),
    suddenStop: Math.random() > 0.15,
    orientationChange: rand(65, 97),
    airbagTriggered: Math.random() > 0.2,
  };
}

/**
 * Evaluates a set of signals against fixed rule-based thresholds and
 * decides whether an accident is confirmed.
 *
 * @param {Object} signals
 * @returns {{
 *   detected: boolean,
 *   accidentDetected: boolean,
 *   confidence: number,
 *   signalsConfirmed: string[],
 *   signalCount: number,
 *   detectedSignals: string[],
 *   signals: Object
 * }}
 */
export function evaluateCrashSignals(signals) {
  const detectedSignals = [];

  if (signals.impactForce >= THRESHOLDS.impactForce) detectedSignals.push('impactForce');
  if (signals.suddenDeceleration >= THRESHOLDS.suddenDeceleration)
    detectedSignals.push('suddenDeceleration');
  if (signals.suddenStop) detectedSignals.push('suddenStop');
  if (signals.orientationChange >= THRESHOLDS.orientationChange)
    detectedSignals.push('orientationChange');
  if (signals.airbagTriggered) detectedSignals.push('airbagTriggered');

  const signalCount = detectedSignals.length;
  const accidentDetected = signalCount >= MIN_SIGNALS_REQUIRED;

  // Confidence is a simple rule-based percentage: how many of the 5
  // possible signals fired, weighted slightly toward airbag + impact.
  const weight = { impactForce: 25, suddenDeceleration: 20, suddenStop: 15, orientationChange: 15, airbagTriggered: 25 };
  const confidence = Math.min(
    100,
    detectedSignals.reduce((sum, key) => sum + (weight[key] || 10), 0)
  );

  return {
    detected: accidentDetected,
    accidentDetected,
    confidence,
    signalsConfirmed: detectedSignals,
    signalCount,
    detectedSignals,
    signals,
  };
}
