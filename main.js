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
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;
  renderMembers();
  resultDiv.innerHTML = "";
  buildMenu();
});

// =======================
// メンバー表示（3列）
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
// 割り当て（①〜⑯固定）
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

  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

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

  return { positions: result.slice(0, 16) };
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
  buildMenu(); // 履歴更新
});

// =======================
// 表出力（①〜⑯のみ）
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

  res.slice(0, 16).forEach((name, i) => {

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
// 丸数字
// =======================
function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}

// ======================================================
// 🔥 メニュー：4/1・4/2 横比較UI
// ======================================================
function buildMenu() {

  const menu = document.getElementById("menu-panel");
  if (!menu) return;

  menu.innerHTML = "";

  const teamHistory = history.filter(h => h.stage === currentTeam);

  const title = document.createElement("h3");
  title.textContent = `${currentTeam} 公演履歴`;
  menu.appendChild(title);

  const wrapper = document.createElement("div");
  wrapper.style.overflowX = "auto";

  const table = document.createElement("table");

  const dates = teamHistory.map(h => h.date);

  let html = `<thead><tr><th>メンバー</th>`;
  dates.forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody>`;

  const base = teams[currentTeam]?.basePositions || [];

  base.slice(0, 16).forEach((p, i) => {

    html += `<tr><td>${p.name}</td>`;

    teamHistory.forEach(h => {
      html += `<td>${h.positions[i] || "-"}</td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody>`;

  table.innerHTML = html;

  wrapper.appendChild(table);
  menu.appendChild(wrapper);

  // 詳細展開
  teamHistory.forEach(h => {

    const d = document.createElement("details");

    d.innerHTML = `
      <summary>${h.date}</summary>
      <pre>${JSON.stringify(h.positions, null, 2)}</pre>
    `;

    menu.appendChild(d);
  });
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
