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

/**
 * Render labelled modifier rows as HTML.
 *
 * ⚠️ SECURITY: a roll's flavor is attacker-controllable — a player can type
 * `/r 1d20 + 5[<img src=x onerror=...>]` or rename an item — and the result is written
 * into a STORED chat card that re-renders on every connected client, the GM's included.
 * The label MUST be escaped; core's own tooltip gets this for free by going through
 * Handlebars, which this hand-built markup does not. `escape` is injected so the rule is
 * testable without a DOM.
 *
 * @param {Array<{label: string|null, value: number}>} parts
 * @param {{fallbackLabel: string, escape: (value: unknown) => string}} options
 * @returns {string}
 */
export function modifierRowsHtml(parts, { fallbackLabel, escape }) {
    if (!parts?.length) return "";
    const rows = parts.map(part => {
        const label = escape(part.label ?? fallbackLabel);
        const value = Number(part.value) || 0;
        const sign = value < 0 ? "-" : "+";
        return `<div class="mtb-modifier-part"><span class="mtb-modifier-label">${label}</span>`
             + `<span class="mtb-modifier-value">${sign}${Math.abs(value)}</span></div>`;
    }).join("");
    return `<div class="mtb-modifier-parts">${rows}</div>`;
}
