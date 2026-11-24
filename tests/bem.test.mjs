import test from 'node:test';
import assert from 'node:assert/strict';
import { prandtlTipLoss, rotorPerformance, bladeComparison } from '../bem.js';

const parameters = { radius: 45, windSpeed: 10, tipSpeedRatio: 7, pitch: 0, bladeCount: 3 };

test('Prandtl tip-loss factor is between 0 and 1', () => {
  const factor = prandtlTipLoss(3, 7, 0.5);
  assert.ok(factor >= 0 && factor <= 1);
});

test('power coefficient respects the Betz limit', () => {
  const result = rotorPerformance(parameters);
  assert.ok(result.cp >= 0.05 && result.cp <= 0.593);
});

test('power and thrust scale with predicted rotor operation', () => {
  const result = rotorPerformance(parameters);
  assert.ok(result.power > 0);
  assert.ok(result.thrust > 0);
  assert.ok(result.sections.length === 20);
});

test('blade comparison returns 2-blade and 3-blade cases', () => {
  const comparison = bladeComparison(45, 10, 7, 0);
  assert.deepEqual(comparison.map((item) => item.bladeCount), [2, 3]);
});
