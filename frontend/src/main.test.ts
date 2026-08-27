import { describe, expect, it } from "vitest";
import { scoreDice } from "./game-views";
describe("High Five scoring", () => {
  it("scores number rows", () => expect(scoreDice([3, 3, 3, 1, 6], 2)).toBe(9));
  it("scores a full house", () =>
    expect(scoreDice([2, 2, 5, 5, 5], 8)).toBe(25));
  it("scores straights and five alike", () => {
    expect(scoreDice([2, 3, 4, 5, 6], 9)).toBe(30);
    expect(scoreDice([4, 4, 4, 4, 4], 9)).toBe(50);
  });
});
