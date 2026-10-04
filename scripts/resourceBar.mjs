/*
 * FORK — is a token-bar entry's stored resource bar still what the token would draw now?
 *
 * Upstream decided "did the bar change?" by comparing only `value` with the token's bar value.
 * In dnd5e the HP bar's value is hp + temp HP while the entry stores plain hp, and the blue
 * temp overlay (`tempPct`) is a separate number — so removing the last temp HP made the two
 * values EQUAL, nothing was recomputed, and the overlay stayed until the next full rebuild
 * (scene change, reload). Compare everything the template draws instead.
 */
const FIELDS = ['value', 'valuePct', 'tempPct', 'color'];

export function sameResourceBar(stored, next) {
    const a = stored ?? {};
    const b = next ?? {};
    return FIELDS.every((field) => a[field] === b[field]);
}
