import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flavoredModifierParts } from './rollParts.mjs';

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
