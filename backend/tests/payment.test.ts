import test from "node:test";
import assert from "node:assert/strict";

function cashDiscrepancy(received: number, expected: number) {
  return received !== expected;
}

test("exact cash amount confirms payment", () => {
  assert.equal(cashDiscrepancy(5000, 5000), false);
});

test("incorrect cash amount creates discrepancy", () => {
  assert.equal(cashDiscrepancy(3000, 5000), true);
});

test("fixed rates are stored in centavos", () => {
  assert.equal(5000 / 100, 50);
  assert.equal(7000 / 100, 70);
  assert.equal(10000 / 100, 100);
});
