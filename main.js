import { teams } from "./data.js";

// =======================
// 状態
// =======================
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");

let currentTeam = "teamA";
let history = [];

// =======================
// 初期化
// =======================
window.addEventListener("DOMContentLoaded", async () => {
  currentTeam = teamSelect.value;
  await loadHistory();
  renderMembers();
});

// =======================
// 履歴読み込み
// =======================
async function loadHistory() {
  try {
    const res = await fetch("./performance/performance.json");
    history = await res.json();
  } catch (e) {
    console.warn("履歴なし");
    history = [];
  }
}

// =======================
// チーム変更
// =======================
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;
  renderMembers();
  resultDiv.innerHTML = "";
});

// =======================
// メンバー表示（4列・安全版）
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team) return;

  // 🔥 customOrderが無くても動く
  const list =
    team.customOrder && team.customOrder.length > 0
      ? team.customOrder
      : team.basePositions.map(p => p.name);

  list.forEach(name => {
    const label = document.createElement("label");

    label.style.display = "inline-block";
    label.style.width = "25%";
    label.style.marginBottom = "8px";
    label.style.verticalAlign = "top";

    label.innerHTML = `
      <input type="checkbox" value="${name}">
      ${name}
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// ポジション割り当て
// =======================
function assign(absent, basePositions, history = []) {

  const result = Array(16).fill(null);
  const used = new Set();

  const all = basePositions.map(p => p.name);
  const available = all.filter(n => !absent.includes(n));

  // =========================
  // 履歴取得
  // =========================
  function getLastUsed(posIndex) {
    for (let i = history.length - 1; i >= 0; i--) {
      const name = history[i].positions?.[posIndex];
      if (name) return name;
    }
    return null;
  }

  // =========================
  // 範囲
  // =========================
  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  // =========================
  // スライド
  // =========================
  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

  // =========================
  // 固定
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
  // 候補選択（ローテーション）
  // =========================
  function pickCandidate(list, posIndex) {

    const last = getLastUsed(posIndex);

    const candidates = list
      .map(i => basePositions[i]?.name)
      .filter(name =>
        name &&
        available.includes(name) &&
        !used.has(name)
      );

    if (candidates.length === 0) return null;

    if (last && candidates.includes(last)) {
      const idx = candidates.indexOf(last);
      return candidates[(idx + 1) % candidates.length];
    }

    return candidates[0];
  }

  // =========================
  // フォールバック
  // =========================
  function fallback(posIndex) {

    const last = getLastUsed(posIndex);

    const candidates = basePositions
      .slice(16)
      .map(p => p.name)
      .filter(name =>
        available.includes(name) &&
        !used.has(name)
      );

    if (candidates.length === 0) return null;

    if (last && candidates.includes(last)) {
      const idx = candidates.indexOf(last);
      return candidates[(idx + 1) % candidates.length];
    }

    return candidates[0];
  }

  // =========================
  // 連鎖
  // =========================
  function fill(i) {

    const name =
      pickCandidate(getSlide(i), i) ??
      pickCandidate(getFixed(i), i) ??
      fallback(i);

    if (!name) return;

    result[i] = name;
    used.add(name);

    const nextIndex = basePositions.findIndex(p => p.name === name);
    if (nextIndex !== -1) {
      fill(nextIndex);
    }
  }

  // =========================
  // メイン処理
  // =========================
  for (let i = 0; i < 16; i++) {

    const original = basePositions[i].name;

    if (available.includes(original) && !used.has(original)) {
      result[i] = original;
      used.add(original);
    } else {
      fill(i);
    }
  }

  return { positions: result };
}

// =======================
// 実行
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const team = teams[currentTeam];
  if (!team) return;

  const absent = [...document.querySelectorAll("#members input:checked")]
    .map(el => el.value);

  const res = assign(absent, team.basePositions, history);

  renderResult(res.positions, team.basePositions);
});

// =======================
// 表＋JSON表示
// =======================
function renderResult(res, base) {

  resultDiv.innerHTML = "";

  const table = document.createElement("table");

  table.innerHTML = `
    <thead>
      <tr>
        <th>ポジション</th>
        <th>メンバー</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  res.forEach((name, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${getNumber(i + 1)} ${base[i].name}</td>
      <td>${name || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  resultDiv.appendChild(table);

  const json = document.createElement("pre");

  json.textContent = JSON.stringify({
    date: new Date().toISOString().slice(0,10),
    stage: currentTeam,
    positions: res
  }, null, 2);

  resultDiv.appendChild(json);
}

// =======================
// 丸数字
// =======================
function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
