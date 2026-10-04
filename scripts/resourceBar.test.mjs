import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sameResourceBar } from './resourceBar.mjs';

const bar = (value, valuePct, tempPct, color = 'rgba(127,255,0, 0.7)') => ({ value, valuePct, tempPct, color });

test('temp HP dropping to zero with the same HP is a change (the stale blue overlay)', () => {
    assert.equal(sameResourceBar(bar(20, 100, 35), bar(20, 100, 0)), false);
});

test('an unchanged bar is not a change', () => {
    assert.equal(sameResourceBar(bar(20, 100, 0), bar(20, 100, 0)), true);
});

test('HP, fill and colour changes are changes', () => {
    assert.equal(sameResourceBar(bar(20, 100, 0), bar(12, 60, 0)), false);
    assert.equal(sameResourceBar(bar(20, 100, 0), bar(20, 80, 0)), false, 'max HP changed');
    assert.equal(sameResourceBar(bar(20, 100, 0), bar(20, 100, 0, 'rgba(255,0,0, 0.7)')), false);
});

test('a bar that stops being a bar (or starts being one) is a change; two empties are not', () => {
    assert.equal(sameResourceBar(bar(20, 100, 0), {}), false);
    assert.equal(sameResourceBar({}, bar(20, 100, 0)), false);
    assert.equal(sameResourceBar({}, {}), true);
    assert.equal(sameResourceBar(undefined, {}), true);
});
