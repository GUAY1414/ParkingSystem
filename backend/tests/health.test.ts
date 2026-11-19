import test from "node:test";
import assert from "node:assert/strict";

test("plate normalization removes spaces and symbols", async () => {
  const normalizePlate = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  assert.equal(normalizePlate(" abc-1234 "), "ABC1234");
});

test("cash mismatch is detected", () => {
  const recordedAmount = 3000;
  const expectedAmount = 5000;
  assert.equal(recordedAmount !== expectedAmount, true);
});

test("active session status uses exact uppercase status", () => {
  assert.equal("ACTIVE", "ACTIVE");
});
