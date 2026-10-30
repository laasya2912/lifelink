/**
 * escalation.js
 * -----------------------------------------------------------------------
 * SIMULATED: Emergency escalation workflow.
 *
 * IMPORTANT: This module never contacts real emergency services. All
 * notification, responder assignment, and dispatch actions are
 * simulated for demonstration purposes only.
 * -----------------------------------------------------------------------
 */

export const VICTIM_RESPONSE = {
  SAFE: "I'm Safe",
  NEED_HELP: 'I Need Help',
  NO_RESPONSE: 'No Response',
  AWAITING: 'Awaiting Response',
};

/**
 * Determines whether escalation should activate based on victim
 * responses.
 *
 * @param {string[]} victimResponses - e.g. ["I'm Safe", "No Response"]
 * @returns {boolean}
 */
export function shouldEscalate(victimResponses) {
  return victimResponses.some(
    (r) => r === VICTIM_RESPONSE.NEED_HELP || r === VICTIM_RESPONSE.NO_RESPONSE
  );
}

/**
 * Builds the simulated escalation record shown in the UI once
 * escalation activates.
 *
 * @param {string[]} victimResponses
 * @returns {{
 *   active: boolean,
 *   emergencyContact: string,
 *   verifiedResponder: string,
 *   emergencyDispatch: string,
 *   triggeredBy: string[]
 * }}
 */
export function buildEscalation(victimResponses) {
  const active = shouldEscalate(victimResponses);

  if (!active) {
    return {
      active: false,
      emergencyContact: 'Not required',
      verifiedResponder: 'Not required',
      emergencyDispatch: 'Not required',
      triggeredBy: [],
    };
  }

  const triggeredBy = victimResponses
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r === VICTIM_RESPONSE.NEED_HELP || r === VICTIM_RESPONSE.NO_RESPONSE)
    .map(({ i }) => `Victim ${i + 1}`);

  return {
    active: true,
    emergencyContact: 'Notification Simulated',
    verifiedResponder: 'Prototype Responder Assigned',
    emergencyDispatch: 'Simulation Initiated',
    triggeredBy,
  };
}
