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
// 履歴
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
// メンバーUI（3列固定）
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
// ルール本体（安定版）
// =======================
function assign(absent, base, history = []) {

  const result = Array(16).fill(null);
  const used = new Set();
  const absentSet = new Set(absent);

  const names = base.map(p => p.name);

  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  // =========================
  // 履歴参照
  // =========================
  function lastUsed(posIndex) {
    for (let i = history.length - 1; i >= 0; i--) {
      const v = history[i]?.positions?.[posIndex];
      if (v) return v;
    }
    return null;
  }

  // =========================
  // スライド（保持）
  // =========================
  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

  // =========================
  // 固定（保持）
  // =========================
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

  // =========================
  // 候補生成（超重要）
  // =========================
  function buildCandidates(indexList, posIndex) {

    const last = lastUsed(posIndex);

    const list = indexList
      .map(i => base[i]?.name)
      .filter(n =>
        n &&
        !absentSet.has(n) &&
        !used.has(n)
      );

    if (!list.length) return null;

    // 履歴優先
    if (last && list.includes(last)) {
      const i = list.indexOf(last);
      return list[(i + 1) % list.length];
    }

    return list[0];
  }

  // =========================
  // fallback（暴走防止版）
  // =========================
  function fallback() {
    return names.find(n => !absentSet.has(n) && !used.has(n)) || null;
  }

  // =========================
  // 1ポジション確定（再帰禁止）
  // =========================
  function resolve(i) {

    const name =
      buildCandidates(getSlide(i), i) ??
      buildCandidates(getFixed(i), i) ??
      fallback();

    return name;
  }

  // =========================
  // メイン
  // =========================
  for (let i = 0; i < 16; i++) {

    const original = base[i]?.name;

    if (original && !absentSet.has(original) && !used.has(original)) {
      result[i] = original;
      used.add(original);
      continue;
    }

    const name = resolve(i);

    if (name) {
      result[i] = name;
      used.add(name);
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

  const res = assign(absent, base, history);

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
      <td>${getNumber(i + 1)} ${base[i]?.name}</td>
      <td>${name || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  resultDiv.appendChild(table);
}

// =======================
// 丸数字
// =======================
function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}

// =======================
// メニュー（簡易安定版）
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
