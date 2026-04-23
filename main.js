import { teams } from "./data.js";

// =======================
// 状態
// =======================
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");
const listView = document.getElementById("list-view");

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

let currentTeam = "teamA";
let history = [];

// =======================
// 初期化
// =======================
window.addEventListener("DOMContentLoaded", async () => {
  currentTeam = teamSelect.value;
  await loadHistory();
  renderMembers();
  renderList();
});

// =======================
// メニュー
// =======================
menuBtn.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

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
// メンバー
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  const list = team.customOrder || team.basePositions.map(p => p.name);

  list.forEach(name => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" value="${name}">
      <span>${name}</span>
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// 割り当て
// =======================
function assign(absent, base, history = []) {

  const result = Array(16).fill(null);
  const used = new Set();

  const all = base.map(p => p.name);
  const available = all.filter(n => !absent.includes(n));

  // 履歴優先順
  const getHistoryPriority = (posIndex) => {
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i]?.positions?.[posIndex];
      if (h) return h;
    }
    return null;
  };

  // 候補リスト生成
  function getCandidates(pool, posIndex) {

    const last = getHistoryPriority(posIndex);

    const candidates = pool
      .map(i => base[i]?.name)
      .filter(n => n && available.includes(n) && !used.has(n));

    if (!candidates.length) return null;

    if (last && candidates.includes(last)) {
      const idx = candidates.indexOf(last);
      return candidates[(idx + 1) % candidates.length];
    }

    return candidates[0];
  }

  // ⑰以降優先順位ロジック
  function fallback() {

    const fixedUsed = history.flatMap(h => h.positions || []);
    const notUsed = all.filter(n => !fixedUsed.includes(n));

    const ordered = [
      ...fixedUsed.filter(n => available.includes(n)),
      ...notUsed.filter(n => available.includes(n))
    ];

    return ordered.find(n => !used.has(n)) || null;
  }

  function fill(i) {

    let name =
      getCandidates(range(i + 5, 10), i) ??
      getCandidates(range(i + 6, 15), i) ??
      fallback(i);

    if (!name) return;

    result[i] = name;
    used.add(name);
  }

  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  for (let i = 0; i < 16; i++) {

    const original = base[i].name;

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
document.getElementById("assign-btn").onclick = () => {

  const team = teams[currentTeam];

  const absent = [...document.querySelectorAll("#members input:checked")]
    .map(e => e.value);

  const res = assign(absent, team.basePositions, history);

  renderResult(res.positions, team.basePositions);
};

// =======================
// 表
// =======================
function renderResult(res, base) {

  resultDiv.innerHTML = "";

  const table = document.createElement("table");

  table.innerHTML = `
    <thead>
      <tr>
        <th>ポジ</th>
        <th>メンバー</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  res.forEach((name, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1} ${base[i].name}</td>
      <td>${name || "-"}</td>
    `;

    tbody.appendChild(tr);
  });

  resultDiv.appendChild(table);
}

// =======================
// サイドリスト
// =======================
function renderList() {
  listView.innerHTML = "";

  teams[currentTeam].basePositions.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.index} ${p.name}`;
    listView.appendChild(div);
  });
}
