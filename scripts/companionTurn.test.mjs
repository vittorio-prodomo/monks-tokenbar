import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCompanionOfCombatant } from './companionTurn.mjs';

const ORIGIN = 'Actor.warpey.Item.primalCompanion';
const summoned = { dnd5e: { summon: { origin: ORIGIN } } };
const items = {
    [ORIGIN]: { identifier: 'primal-companion', actor: { id: 'warpey' } },
    'Actor.nigel.Item.flamingSphere': { identifier: 'flaming-sphere', actor: { id: 'nigel' } }
};
const resolve = (uuid) => items[uuid] ?? null;

test("the hunter's own Primal Companion may move on the hunter's turn", () => {
    assert.equal(isCompanionOfCombatant(summoned, 'warpey', resolve), true);
});

test("not on someone else's turn", () => {
    assert.equal(isCompanionOfCombatant(summoned, 'nigel', resolve), false);
});

test('other summons get no exemption', () => {
    const sphere = { dnd5e: { summon: { origin: 'Actor.nigel.Item.flamingSphere' } } };
    assert.equal(isCompanionOfCombatant(sphere, 'nigel', resolve), false);
});

test('a plain copy of the beast (no summon stamp) gets no exemption', () => {
    assert.equal(isCompanionOfCombatant({}, 'warpey', resolve), false);
    assert.equal(isCompanionOfCombatant(undefined, 'warpey', resolve), false);
});

test('an unresolvable origin or no current combatant is no exemption, never an error', () => {
    assert.equal(isCompanionOfCombatant(summoned, undefined, resolve), false);
    assert.equal(isCompanionOfCombatant({ dnd5e: { summon: { origin: 'Actor.gone.Item.x' } } }, 'warpey', resolve), false);
    assert.equal(isCompanionOfCombatant(summoned, 'warpey', () => { throw new Error('bad uuid'); }), false);
});

test('an item without an actor getter falls back to its parent', () => {
    const viaParent = (uuid) => (uuid === ORIGIN ? { identifier: 'primal-companion', parent: { id: 'warpey' } } : null);
    assert.equal(isCompanionOfCombatant(summoned, 'warpey', viaParent), true);
});
