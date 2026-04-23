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
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;
  renderMembers();
  resultDiv.innerHTML = "";
});

// =======================
// メンバー表示（改行問題修正）
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team) return;

  const list = team.customOrder || team.basePositions.map(p => p.name);

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
// 割り当て
// =======================
function assign(absent, basePositions) {

  const result = Array(16).fill(null);
  const used = new Set();

  const all = basePositions.map(p => p.name);
  const available = all.filter(n => !absent.includes(n));

  // =========================
  // 安定条件（①の追加）
  // =========================
  const underCandidates = basePositions
    .slice(16)
    .map(p => p.name)
    .filter(n => available.includes(n));

  const noChangeCondition =
    absent.length === 0 && underCandidates.length < 2;

  if (noChangeCondition) {
    return {
      positions: all.slice(0, 16)
    };
  }

  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

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

  function pick(list) {
    return list
      .map(i => basePositions[i]?.name)
      .find(n => available.includes(n) && !used.has(n));
  }

  function fallback() {
    return basePositions
      .slice(16)
      .map(p => p.name)
      .find(n => available.includes(n) && !used.has(n));
  }

  function fill(i) {

    const name =
      pick(getSlide(i)) ??
      pick(getFixed(i)) ??
      fallback();

    if (!name) return;

    result[i] = name;
    used.add(name);
  }

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
  const absent = [...document.querySelectorAll("#members input:checked")]
    .map(el => el.value);

  const res = assign(absent, team.basePositions);

  renderResult(res.positions, team.basePositions);
});

// =======================
// 表＋JSON
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
// 丸数字（①〜⑯固定）
// =======================
function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}
