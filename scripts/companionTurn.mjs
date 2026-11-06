/*
 * FORK (queue T257) — may this token move during the current combatant's turn because it is that
 * combatant's Primal Companion?
 *
 * 2024 PHB: the Primal Companion "acts during your turn". In this world the beast also keeps its own
 * combatant slot (initiative = hunter − 0.01, so its movement history and charge rider keep working;
 * dnd5e-primal-companion auto-skips that turn). Upstream's free-npc-combat exemption refuses any token
 * that is itself a combatant, so under "Combat Turn" movement the beast could never move: not on the
 * hunter's turn, and its own turn passes at once.
 *
 * Detection mirrors dnd5e-primal-companion without depending on it: a dnd5e summon's
 * `flags.dnd5e.summon.origin` points at the item that summoned it; the Primal Companion feature has the
 * identifier "primal-companion", and its owner is the hunter. A plain copy of the beast (no summon
 * stamp) gets no exemption.
 */
export const PRIMAL_COMPANION_IDENTIFIER = 'primal-companion';

/**
 * @param {object|undefined} tokenActorFlags  the moving token's actor `flags`
 * @param {string|undefined} currentActorId   the current combatant's actor id
 * @param {(uuid: string) => any} resolveItem  uuid → item document (e.g. `fromUuidSync`)
 * @returns {boolean}
 */
export function isCompanionOfCombatant(tokenActorFlags, currentActorId, resolveItem) {
    const origin = tokenActorFlags?.dnd5e?.summon?.origin;
    if (!origin || !currentActorId) return false;
    let item = null;
    try {
        item = resolveItem(origin);
    } catch {
        return false;
    }
    if (item?.identifier !== PRIMAL_COMPANION_IDENTIFIER) return false;
    return (item.actor?.id ?? item.parent?.id) === currentActorId;
}
