/**
 * Split a roll's flat terms into labelled parts.
 *
 * ⚠️ Core's `Roll#getTooltip()` renders ONLY the dice — every flat term is dropped — so a
 * card that shows the dice plus one derived `total - dice` number merges the ability
 * modifier with anything a feature added. A Tactical Mind check then reads "+13" with no
 * hint that 10 of it came from the feature, even though the term carries the flavor.
 *
 * @param {{terms?: Array<{class?: string, number?: number, total?: number, options?: {flavor?: string}}>}} rollData
 *        A roll in its JSON form (what the card stores).
 * @returns {Array<{label: string|null, value: number}>}
 *        Flavored parts in order, then the unflavored remainder (label null) if non-zero.
 */
export function flavoredModifierParts(rollData) {
    const terms = rollData?.terms ?? [];
    const labelled = [];
    let plain = 0;
    let sign = 1;

    for (const term of terms) {
        const cls = term?.class ?? "";
        if (cls === "OperatorTerm") {
            if (term.operator === "-") sign = -1;
            else if (term.operator === "+") sign = 1;
            continue;
        }
        if (cls !== "NumericTerm") continue;          // dice are the tooltip's own job
        const value = sign * (Number(term.number ?? term.total) || 0);
        const flavor = (term.options?.flavor ?? "").trim();
        if (flavor) labelled.push({ label: flavor, value });
        else plain += value;
        sign = 1;
    }

    return plain ? [...labelled, { label: null, value: plain }] : labelled;
}
