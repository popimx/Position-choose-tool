import { teams } from "./data.js";
import { assign, getNumber } from "./assign.js";

// =======================
// DOM取得
// =======================
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const absentDiv = document.getElementById("absent-members");
const resultDiv = document.getElementById("result");
const listView = document.getElementById("list-view");

let currentTeam = null;

// =======================
// 初期化（重要：DOM読み込み後）
// =======================
window.addEventListener("DOMContentLoaded", () => {
  currentTeam = teamSelect.value; // ←ここ重要
  renderMembers();
  renderAbsent();
});

// =======================
// チーム切替
// =======================
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;
  clearUI();
  renderMembers();
  renderAbsent();
});

// =======================
// 出演メンバー表示
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team || !team.basePositions) return;

  team.basePositions.forEach(m => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" value="${m.name}">
      ${m.index} ${m.name}
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// 休演メンバー表示
// =======================
function renderAbsent() {
  absentDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team || !team.basePositions) return;

  team.basePositions.forEach(m => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" value="${m.name}">
      ${m.name}
    `;

    absentDiv.appendChild(label);
  });
}

// =======================
// 割り当て
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const team = teams[currentTeam];
  if (!team) return;

  const absent = getCheckedAbsent();

  const res = assign(absent, team.basePositions);

  renderResult(res.positions, team.basePositions);
  renderList(res.positions, team.basePositions);
});

// =======================
// 休演取得
// =======================
function getCheckedAbsent() {
  return [...document.querySelectorAll("#absent-members input:checked")]
    .map(el => el.value);
}

// =======================
// 結果表示
// =======================
function renderResult(res, base) {
  resultDiv.innerHTML = "";

  res.forEach((name, i) => {
    const original = base[i]?.name || "";

    const div = document.createElement("div");

    div.innerHTML = `
      <strong>${getNumber(i + 1)} ${original}ポジ</strong><br>
      ${name}
    `;

    resultDiv.appendChild(div);
  });
}

// =======================
// 一覧表示
// =======================
function renderList(res, base) {
  listView.innerHTML = "";

  const date = document.getElementById("date")?.value || "未設定";

  const title = document.createElement("h3");
  title.textContent = date;
  listView.appendChild(title);

  res.forEach((name, i) => {
    const original = base[i]?.name || "";

    const row = document.createElement("div");
    row.textContent = `${getNumber(i + 1)} ${original} → ${name}`;

    listView.appendChild(row);
  });
}

// =======================
// UIクリア
// =======================
function clearUI() {
  membersDiv.innerHTML = "";
  absentDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  listView.innerHTML = "";
}
