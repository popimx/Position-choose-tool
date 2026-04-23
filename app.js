import { teams } from "./data.js";
import { assign, getNumber } from "./main.js"; // ←ここ重要！

// DOM
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");

let currentTeam = null;

// =======================
// 初期化
// =======================
window.addEventListener("DOMContentLoaded", () => {
  currentTeam = teamSelect.value;
  renderMembers();
});

// =======================
// チーム変更
// =======================
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;
  clearUI();
  renderMembers();
});

// =======================
// メンバー表示
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team || !team.basePositions) return;

  team.basePositions.forEach(m => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" value="${m.name}">
      ${m.name}
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// 割り当て
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const team = teams[currentTeam];
  if (!team) return;

  const absent = getChecked();

  const res = assign(absent, team.basePositions);

  renderResult(res.positions, team.basePositions);
});

// =======================
// チェック取得
// =======================
function getChecked() {
  return [...document.querySelectorAll("#members input:checked")]
    .map(el => el.value);
}

// =======================
// 結果表示
// =======================
function renderResult(res, base) {
  resultDiv.innerHTML = "";

  res.forEach((name, i) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <strong>${getNumber(i + 1)} ${base[i].name}ポジ</strong><br>
      ${name}
    `;

    resultDiv.appendChild(div);
  });
}

// =======================
function clearUI() {
  membersDiv.innerHTML = "";
  resultDiv.innerHTML = "";
}
