export function assign(absent, basePositions) {

  // =========================
  // ① 初期化
  // =========================
  const result = basePositions.map(p => p.name);

  const used = new Set();              // 使用済みインデックス
  const assignedFrom = new Map();      // どこから来たか
  const usedCount = new Map();         // 使用回数（バランス用）

  // 休演処理
  for (let i = 0; i < result.length; i++) {
    if (absent.includes(result[i])) {
      result[i] = null;
    }
  }

  // =========================
  // ② ユーティリティ
  // =========================
  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  const addCount = (i) => {
    usedCount.set(i, (usedCount.get(i) || 0) + 1);
  };

  const getCount = (i) => usedCount.get(i) || 0;

  // =========================
  // ③ 候補フィルタ（完全版）
  // =========================
  function filterValid(list) {
    return list.filter(i =>
      i >= 0 &&
      i < result.length &&
      result[i] !== null &&
      !used.has(i)
    );
  }

  // 使用回数が少ない順
  function pickLeastUsed(list) {
    const valid = filterValid(list);
    if (valid.length === 0) return undefined;

    return valid.sort((a, b) => getCount(a) - getCount(b))[0];
  }

  // =========================
  // ④ スライドルール
  // =========================
  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

  // =========================
  // ⑤ 固定ルール
  // =========================
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

  // =========================
  // ⑥ フォールバック（⑰以降）
  // =========================
  function getFallback() {
    return range(16, result.length - 1);
  }

  // =========================
  // ⑦ 割り当て本体
  // =========================
  function fill(i) {

    const cand =
      pickLeastUsed(getSlide(i)) ??
      pickLeastUsed(getFixed(i)) ??
      pickLeastUsed(getFallback());

    if (cand === undefined) return;

    result[i] = result[cand];

    used.add(cand);
    addCount(cand);

    assignedFrom.set(i, cand);
  }

  // =========================
  // ⑧ 実行
  // =========================
  for (let i = 0; i < 16; i++) {
    if (!result[i]) {
      fill(i);
    }
  }

  // =========================
  // ⑨ 返却
  // =========================
  return {
    positions: result.slice(0, 16),
    debug: {
      usedCount: Object.fromEntries(usedCount),
      assignedFrom: Object.fromEntries(assignedFrom)
    }
  };
}
