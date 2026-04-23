// =======================
// ポジション割り当て
// =======================
export function assign(absent, basePositions) {

  // 全メンバー
  const all = basePositions.map(p => p.name);

  // 出演可能メンバー（＝全員 − 休演）
  const available = all.filter(name => !absent.includes(name));

  // 結果（①〜⑯）
  const result = Array(16).fill(null);

  // 使用済み管理
  const used = new Set();

  // index取得用
  const indexMap = new Map();
  basePositions.forEach((p, i) => {
    indexMap.set(p.name, i);
  });

  // 範囲生成
  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  // 候補検索
  function find(list) {
    return list.find(i => {
      const name = basePositions[i]?.name;
      return name && available.includes(name) && !used.has(name);
    });
  }

  // スライドルール
  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

  // 固定ルール
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

  // 割り当て処理（連鎖対応）
  function fill(i) {

    const cand =
      find(getSlide(i)) ??
      find(getFixed(i)) ??
      find(range(16, basePositions.length - 1));

    if (cand === undefined) return;

    const name = basePositions[cand].name;

    result[i] = name;
    used.add(name);

    fill(cand); // 🔥 連鎖
  }

  // =======================
  // メイン処理（①〜⑯）
  // =======================
  for (let i = 0; i < 16; i++) {

    const original = basePositions[i].name;

    // 本人が出演できる場合
    if (available.includes(original) && !used.has(original)) {
      result[i] = original;
      used.add(original);
    } else {
      fill(i);
    }
  }

  // =======================
  // 返却
  // =======================
  return {
    positions: result
  };
}

// =======================
// 丸数字
// =======================
export function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
