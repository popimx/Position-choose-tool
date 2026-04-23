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
  } catch {
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
// メンバー表示（3列＋改行防止）
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team) return;

  const list = team.customOrder?.length
    ? team.customOrder
    : team.basePositions.map(p => p.name);

  list.forEach(name => {
    const label = document.createElement("label");

    label.className = "member-label";

    label.innerHTML = `
      <input type="checkbox" value="${name}">
      <span class="member-name">${name}</span>
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// 割り当てロジック
// =======================
function assign(absent, basePositions, history = []) {

  const result = Array(16).fill(null);
  const used = new Set();

  const all = basePositions.map(p => p.name);
  const available = all.filter(n => !absent.includes(n));

  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  function getLastUsed(posIndex) {
    for (let i = history.length - 1; i >= 0; i--) {
      const name = history[i]?.positions?.[posIndex];
      if (name) return name;
    }
    return null;
  }

  // =========================
  // ★この2つは絶対保持（要求通り）
  // =========================
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

  function pick(list, posIndex) {

    const last = getLastUsed(posIndex);

    const candidates = list
      .map(i => basePositions[i]?.name)
      .filter(n => n && available.includes(n) && !used.has(n));

    if (!candidates.length) return null;

    if (last && candidates.includes(last)) {
      const idx = candidates.indexOf(last);
      return candidates[(idx + 1) % candidates.length];
    }

    return candidates[0];
  }

  function fallback() {
    return available.find(n => !used.has(n)) || null;
  }

  function fill(i) {

    const name =
      pick(getSlide(i), i) ??
      pick(getFixed(i), i) ??
      fallback();

    if (!name) return;

    result[i] = name;
    used.add(name);

    const next = basePositions.findIndex(p => p.name === name);
    if (next !== -1) fill(next);
  }

  for (let i = 0; i < 16; i++) {

    const original = basePositions[i]?.name;

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
// 表出力
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
      <td>${getNumber(i + 1)} ${base[i]?.name || ""}</td>
      <td>${name || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  resultDiv.appendChild(table);
}

// =======================
// 丸数字（①〜⑯固定）
// =======================
function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
