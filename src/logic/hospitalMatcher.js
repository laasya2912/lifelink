/**
 * hospitalMatcher.js
 * -----------------------------------------------------------------------
 * Ranks REAL hospitals (from the Overpass API) using rule-based logic.
 *
 * Ranking factors:
 *   1. Distance (real, calculated from real coordinates) — primary factor
 *   2. Capability (real, if OSM tags provide "emergency=yes") — secondary
 *   3. Prototype availability (SIMULATED — clearly labelled, used only
 *      as a tie-breaker, never presented as live data)
 * -----------------------------------------------------------------------
 */

const PROTOTYPE_STATUSES = ['Prototype Data: Available', 'Prototype Data: Busy', 'Prototype Data: Limited'];

/**
 * Attaches simulated/prototype availability metadata to a real hospital
 * record without altering its real geographic fields.
 */
function withPrototypeAvailability(hospital, index) {
  return {
    ...hospital,
    availability: PROTOTYPE_STATUSES[index % PROTOTYPE_STATUSES.length],
    availabilityLabel: 'Prototype Data',
    capabilityLabel: hospital.emergency ? 'Emergency Department (OSM tag)' : 'General (capability unconfirmed)',
  };
}

/**
 * Ranks and enriches a list of real hospital records.
 *
 * @param {Array} hospitals - real hospital records from hospitalApi
 * @returns {Array} ranked hospitals with prototype metadata attached
 */
export function rankHospitals(hospitals) {
  const sorted = [...hospitals].sort((a, b) => {
    // Primary: distance
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    // Secondary: real emergency-capability tag
    if (a.emergency !== b.emergency) return a.emergency ? -1 : 1;
    return 0;
  });

  return sorted.map((h, idx) => withPrototypeAvailability(h, idx));
}

/**
 * Returns the single best-matched hospital, or null if none available.
 */
export function selectBestHospital(hospitals) {
  const ranked = rankHospitals(hospitals);
  return ranked.length > 0 ? ranked[0] : null;
}
