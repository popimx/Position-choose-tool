// =======================
// ポジション割り当て（完成版）
// =======================
export function assign(absent, basePositions) {

  // 全メンバー
  const all = basePositions.map(p => p.name);

  // 出演可能
  const available = all.filter(name => !absent.includes(name));

  // 結果（①〜⑯）
  const result = basePositions.map(p => p.name);

  // 空席化（休演）
  for (let i = 1; i <= 16; i++) {
    if (absent.includes(result[i - 1])) {
      result[i - 1] = null;
    }
  }

  // =======================
  // ユーティリティ（①始まり）
  // =======================
  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  const getName = (pos) => basePositions[pos - 1]?.name;

  const isAvailable = (pos) => {
    const name = getName(pos);
    return name && available.includes(name);
  };

  // =======================
  // スライドルール
  // =======================
  function getSlide(pos) {
    if (pos <= 5) return range(pos + 5, 11);
    if (pos <= 10) return range(pos + 6, 16);
    return [];
  }

  // =======================
  // 固定ルール
  // =======================
  function getFixed(pos) {
    const map = {
      11: [17, 23],
      12: [18, 24, 29],
      13: [19, 25, 30],
      14: [20, 26, 31],
      15: [21, 27, 32],
      16: [22, 28, 33]
    };
    return map[pos] || [];
  }

  // =======================
  // フォールバック（⑰以降）
  // =======================
  function getFallback() {
    return range(17, basePositions.length);
  }

  // =======================
  // 割り当て（連鎖）
  // =======================
  function fill(pos) {

    let candidate = null;

    // ① スライド
    for (const p of getSlide(pos)) {
      if (isAvailable(p)) {
        candidate = p;
        break;
      }
    }

    // ② 固定
    if (!candidate) {
      for (const p of getFixed(pos)) {
        if (isAvailable(p)) {
          candidate = p;
          break;
        }
      }
    }

    // ③ フォールバック
    if (!candidate) {
      for (const p of getFallback()) {
        if (isAvailable(p)) {
          candidate = p;
          break;
        }
      }
    }

    if (!candidate) return;

    // 🔥 移動（コピーじゃない）
    result[pos - 1] = getName(candidate);

    // 元ポジを空ける（超重要）
    if (candidate <= 16) {
      result[candidate - 1] = null;
      fill(candidate); // 連鎖
    }
  }

  // =======================
  // メイン処理
  // =======================
  for (let pos = 1; pos <= 16; pos++) {

    const original = getName(pos);

    if (result[pos - 1] !== null) continue;

    if (available.includes(original)) {
      result[pos - 1] = original;
    } else {
      fill(pos);
    }
  }

  // =======================
  // 返却
  // =======================
  return {
    positions: result.slice(0, 16)
  };
}

// =======================
// 丸数字
// =======================
export function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
