import { basePositions } from "./data.js";

export function assign(absentNames) {
  const assigned = basePositions.map(p => p.name);
  const used = new Set();

  // 休演を空に
  assigned.forEach((name, i) => {
    if (absentNames.includes(name)) {
      assigned[i] = null;
    }
  });

  function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }

  function getSlide(index) {
    if (index <= 4) return range(index + 5, 10);
    if (index <= 9) return range(index + 6, 15);
    return [];
  }

  function getFixed(index) {
    const map = {
      10: [16, 22],
      11: [17, 23, 28],
      12: [18, 24, 29],
      13: [19, 25, 30],
      14: [20, 26, 31],
      15: [21, 27, 32]
    };
    return map[index] || [];
  }

  function find(candidates) {
    return candidates.find(i => assigned[i] && !used.has(i));
  }

  function fill(index) {
    if (assigned[index] !== null) return;

    const candidate =
      find(getSlide(index)) ??
      find(getFixed(index)) ??
      find(range(16, assigned.length - 1));

    if (candidate === undefined) return;

    assigned[index] = basePositions[candidate].name;
    used.add(candidate);

    fill(candidate); // 🔥 連鎖
  }

  for (let i = 0; i < 16; i++) {
    if (assigned[i] === null) fill(i);
  }

  return assigned.slice(0, 16);
}

// 丸数字
export function getNumber(num) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[num - 1];
}
