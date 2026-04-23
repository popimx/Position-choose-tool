import { teams } from "./data.js";

// =======================
// 状態
// =======================
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");
const menuBtn = document.getElementById("menu-btn");

let currentTeam = "teamA";
let history = [];

// =======================
// 初期化
// =======================
window.addEventListener("DOMContentLoaded", async () => {
  currentTeam = teamSelect.value;
  await loadHistory();
  renderMembers();
  buildMenu();
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
teamSelect.addEventListener("change", () => {
  currentTeam = teamSelect.value;
  renderMembers();
  resultDiv.innerHTML = "";
  buildMenu();
});

// =======================
// メンバーUI
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
// util
// =======================
function range(s, e) {
  return Array.from({ length: e - s + 1 }, (_, i) => i + s);
}

// =======================
// 履歴取得（ポジション単位）
// =======================
function lastUsed(posIndex) {
  for (let i = history.length - 1; i >= 0; i--) {
    const v = history[i]?.positions?.[posIndex];
    if (v) return v;
  }
  return null;
}

// =======================
// スライド
// =======================
function getSlide(i) {
  if (i <= 4) return range(i + 5, 10);
  if (i <= 9) return range(i + 6, 15);
  return [];
}

// =======================
// 固定
// =======================
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

// =======================
// ⑰以降（fallback専用）
// =======================
function getExtraPool(base, used, absentSet) {
  return base
    .map(p => p.name)
    .filter(n => !used.has(n) && !absentSet.has(n));
}

// =======================
// 割り当て本体
// =======================
function assign(absent, base) {

  const result = Array(16).fill(null);
  const used = new Set();
  const absentSet = new Set(absent);

  const baseNames = base.map(p => p.name);

  // =========================
  // STEP 1: ベース固定（①〜⑯）
  // =========================
  for (let i = 0; i < 16; i++) {

    const name = base[i]?.name;

    if (!name || absentSet.has(name)) {
      continue;
    }

    result[i] = name;
    used.add(name);
  }

  // =========================
  // STEP 2: 空き枠処理
  // =========================
  for (let i = 0; i < 16; i++) {

    if (result[i]) continue;

    const last = lastUsed(i);

    const candidates =
      getSlide(i)
        .map(j => base[j]?.name)
        .filter(n => n && !used.has(n) && !absentSet.has(n)) ||
      [];

    const fixed =
      getFixed(i)
        .map(j => base[j]?.name)
        .filter(n => n && !used.has(n) && !absentSet.has(n)) ||
      [];

    let picked = null;

    // =========================
    // STEP 2-1: 履歴最優先
    // =========================
    if (last && !used.has(last) && !absentSet.has(last)) {
      picked = last;
    }

    // =========================
    // STEP 2-2: スライド・固定
    // =========================
    if (!picked) {
      picked = candidates[0] || fixed[0] || null;
    }

    // =========================
    // STEP 2-3: ⑰以降
    // =========================
    if (!picked) {
      const extra = getExtraPool(base, used, absentSet);
      picked = extra[0] || null;
    }

    if (picked) {
      result[i] = picked;
      used.add(picked);
    }
  }

  return { positions: result };
}

// =======================
// 実行
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const base = teams[currentTeam].basePositions;

  const absent = [...document.querySelectorAll("#members input:checked")]
    .map(e => e.value);

  const res = assign(absent, base);

  renderResult(res.positions, base);
  buildMenu();
});

// =======================
// 表
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
      <td>${["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"][i]}</td>
      <td>${name || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  resultDiv.appendChild(table);
}

// =======================
// メニュー
// =======================
function buildMenu() {

  const menu = document.getElementById("menu-panel");
  if (!menu) return;

  menu.innerHTML = "";

  const data = history.filter(h => h.stage === currentTeam);

  const title = document.createElement("h3");
  title.textContent = `${currentTeam} 公演履歴`;
  menu.appendChild(title);

  const table = document.createElement("table");

  let html = `<thead><tr><th>メンバー</th>`;

  data.forEach(d => html += `<th>${d.date}</th>`);
  html += `</tr></thead><tbody>`;

  const base = teams[currentTeam].basePositions;

  base.slice(0, 16).forEach((p, i) => {

    html += `<tr><td>${p.name}</td>`;

    data.forEach(d => {
      html += `<td>${d.positions[i] || "-"}</td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody>`;

  table.innerHTML = html;
  menu.appendChild(table);
}

// =======================
// メニュー開閉
// =======================
menuBtn?.addEventListener("click", () => {
  const menu = document.getElementById("menu-panel");
  if (!menu) return;

  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
});
