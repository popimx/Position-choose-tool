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
      <span>${name}</span>
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// 履歴取得
// =======================
function lastUsed(posIndex) {
  for (let i = history.length - 1; i >= 0; i--) {
    const v = history[i]?.positions?.[posIndex];
    if (v) return v;
  }
  return null;
}

// =======================
// 🔥連鎖スライド生成（①〜⑩）
// =======================
function getSlideChain(i) {

  const chain = [];

  if (i <= 4) {
    for (let j = i + 5; j <= 15; j++) chain.push(j);
  } else if (i <= 9) {
    for (let j = i + 6; j <= 15; j++) chain.push(j);
  }

  return chain;
}

// =======================
// 🔥履歴＋スライド（核心）
// =======================
function pickFromHistoryAndSlide(i, base, used, absentSet) {

  const last = lastUsed(i);

  const chain = getSlideChain(i)
    .map(j => base[j]?.name)
    .filter(n => n && !used.has(n) && !absentSet.has(n));

  // 履歴が使えるなら最優先
  if (last && !used.has(last) && !absentSet.has(last)) {
    return last;
  }

  // スライド
  if (chain.length) {
    return chain[0];
  }

  return null;
}

// =======================
// 固定（⑪〜⑯ → ⑰以降）
// =======================
function getFixed(i, base, used, absentSet) {

  const map = {
    10: [16,22],
    11: [17,23,28],
    12: [18,24,29],
    13: [19,25,30],
    14: [20,26,31],
    15: [21,27,32]
  };

  const list = map[i] || [];

  for (const idx of list) {
    const name = base[idx]?.name;
    if (name && !used.has(name) && !absentSet.has(name)) {
      return name;
    }
  }

  return null;
}

// =======================
// ⑰以降 fallback
// =======================
function getExtra(base, used, absentSet) {
  return base
    .map(p => p.name)
    .find(n => !used.has(n) && !absentSet.has(n)) || null;
}

// =======================
// 🔥割り当て本体
// =======================
function assign(absent, base) {

  const result = Array(16).fill(null);
  const used = new Set();
  const absentSet = new Set(absent);

  // =====================
  // STEP1 ベース固定
  // =====================
  for (let i = 0; i < 16; i++) {
    const name = base[i]?.name;

    if (name && !absentSet.has(name)) {
      result[i] = name;
      used.add(name);
    }
  }

  // =====================
  // STEP2 空き枠
  // =====================
  for (let i = 0; i < 16; i++) {

    if (result[i]) continue;

    let picked = null;

    // ① 履歴最優先
    picked = pickFromHistoryAndSlide(i, base, used, absentSet);

    // ② 固定（⑪〜⑯）
    if (!picked && i >= 10) {
      picked = getFixed(i, base, used, absentSet);
    }

    // ③ fallback
    if (!picked) {
      picked = getExtra(base, used, absentSet);
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

  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];

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

    const posName = base[i]?.name || "";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${nums[i]} ${posName}ポジ</td>
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
