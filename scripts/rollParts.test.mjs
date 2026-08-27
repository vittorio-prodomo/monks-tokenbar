import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flavoredModifierParts, modifierRowsHtml } from './rollParts.mjs';

const numeric = (n, flavor) => ({ class: 'NumericTerm', number: n, options: flavor ? { flavor } : {} });
const op = (operator) => ({ class: 'OperatorTerm', operator });
const die = () => ({ class: 'BasicDie', number: 1, faces: 20 });

test('separates a flavored feature bonus from the plain modifier', () => {
    // 1d20 + 3 + 10[Tactical Mind] — the card was showing a single merged "+13".
    const parts = flavoredModifierParts({
        terms: [die(), op('+'), numeric(3), op('+'), numeric(10, 'Tactical Mind')]
    });
    assert.deepEqual(parts, [{ label: 'Tactical Mind', value: 10 }, { label: null, value: 3 }]);
});

test('keeps a lone unlabelled modifier as-is', () => {
    assert.deepEqual(flavoredModifierParts({ terms: [die(), op('+'), numeric(5)] }),
        [{ label: null, value: 5 }]);
});

test('honours subtraction', () => {
    assert.deepEqual(flavoredModifierParts({ terms: [die(), op('-'), numeric(1)] }),
        [{ label: null, value: -1 }]);
});

test('says nothing when there is no flat modifier at all', () => {
    assert.deepEqual(flavoredModifierParts({ terms: [die()] }), []);
    assert.deepEqual(flavoredModifierParts(undefined), []);
});

// A roll's flavor is attacker-controllable — a player can type
// `/r 1d20 + 5[<img src=x onerror=...>]` or rename an item — and these rows are
// written into a STORED chat card that re-renders on every client, the GM's included.
const escape = (v) => String(v)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#x27;');

test('escapes the flavor label so a crafted roll cannot inject markup', () => {
    const html = modifierRowsHtml(
        [{ label: '<img src=x onerror=alert(1)>', value: 5 }],
        { fallbackLabel: 'Modifier', escape }
    );
    assert.ok(!html.includes('<img'), 'raw tag must not survive');
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'it should be shown as text');
});

test('escapes the fallback label too, and keeps the value numeric', () => {
    const html = modifierRowsHtml([{ label: null, value: -3 }], { fallbackLabel: '<b>x</b>', escape });
    assert.ok(!html.includes('<b>'));
    assert.ok(html.includes('-3'));
});

test('renders nothing at all when there are no parts', () => {
    assert.equal(modifierRowsHtml([], { fallbackLabel: 'Modifier', escape }), '');
});
