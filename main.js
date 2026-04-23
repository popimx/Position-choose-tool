// =======================
// ポジション割り当て（①始まり版）
// =======================
export function assign(absent, basePositions) {

  // 名前配列（1始まり用にダミー追加）
  const names = [null, ...basePositions.map(p => p.name)];

  // 出演可能
  const available = names.filter(n => n && !absent.includes(n));

  // 結果（①〜⑯）
  const result = Array(17).fill(null);

  const used = new Set();

  // 範囲（①始まり）
  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  // 候補検索
  function find(list) {
    return list.find(i => {
      const name = names[i];
      return name && available.includes(name) && !used.has(name);
    });
  }

  // スライド
  function getSlide(i) {
    if (i <= 5) return range(i + 5, 10);
    if (i <= 10) return range(i + 6, 15);
    return [];
  }

  // 固定
  function getFixed(i) {
    const map = {
      11: [17, 23],
      12: [18, 24, 29],
      13: [19, 25, 30],
      14: [20, 26, 31],
      15: [21, 27, 32],
      16: [22, 28, 33]
    };
    return map[i] || [];
  }

  // 割り当て
  function fill(i) {

    const cand =
      find(getSlide(i)) ??
      find(getFixed(i)) ??
      find(range(17, names.length - 1));

    if (!cand) return;

    const name = names[cand];

    result[i] = name;
    used.add(name);

    // ①〜⑯だけ連鎖
    if (cand <= 16 && !result[cand]) {
      fill(cand);
    }
  }

  // メイン
  for (let i = 1; i <= 16; i++) {

    const original = names[i];

    if (available.includes(original) && !used.has(original)) {
      result[i] = original;
      used.add(original);
    } else {
      fill(i);
    }
  }

  // ①〜⑯だけ返す
  return {
    positions: result.slice(1, 17)
  };
}

// =======================
// 丸数字
// =======================
export function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
