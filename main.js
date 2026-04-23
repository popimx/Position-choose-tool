import { basePositions } from "./data.js";

export function assign(absent) {
  const used = new Set();
  const result = basePositions.map(p => p.name);

  // 休演処理
  for (let i = 0; i < result.length; i++) {
    if (absent.includes(result[i])) {
      result[i] = null;
    }
  }

  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  function find(list) {
    return list.find(i =>
      result[i] &&
      !used.has(i)
    );
  }

  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

  function getFixed(i) {
    const map = {
      10: [16, 22],
      11: [17, 23],
      12: [18, 24, 29],
      13: [19, 25, 30],
      14: [20, 26, 31],
      15: [21, 27, 32],
      16: [22, 28, 33]
    };
    return map[i] || [];
  }

  function pickLeastUsed(list) {
    return list.find(i => result[i]);
  }

  function fill(i) {
    const cand =
      find(getSlide(i)) ??
      find(getFixed(i)) ??
      pickLeastUsed(range(16, result.length - 1));

    if (cand === undefined) return;

    result[i] = result[cand];
    used.add(cand);
  }

  for (let i = 0; i < 16; i++) {
    if (!result[i]) fill(i);
  }

  return result.slice(0, 16);
}

export function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
