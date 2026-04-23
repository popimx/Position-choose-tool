import { teams } from "./data.js";
import { assign, getNumber } from "./assign.js";

const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");
const listView = document.getElementById("list-view");

let currentTeam = "teamA";

// =======================
// 初期表示
// =======================
renderMembers();

// =======================
// チーム切替
// =======================
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;

  clearChecks();      // ★重要：チェックリセット
  renderMembers();
  clearResult();
});

// =======================
// メンバー表示
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];

  if (!team || !team.basePositions) return;

  team.customOrder.forEach(name => {
    const m = team.basePositions.find(p => p.name === name);

    if (!m) return;

    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" value="${m.name}">
      ${m.index} ${m.name}
    `;

    membersDiv.appendChild(label);
  });
}

// =======================
// 割り当て実行
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const team = teams[currentTeam];

  const absent = [...document.querySelectorAll("#members input:checked")]
    .map(el => el.value);

  const res = assign(absent, team.basePositions);

  renderResult(res, team.basePositions);
  renderList(res, team.basePositions);
});

// =======================
// 結果表示（メイン）
// =======================
function renderResult(res, base) {
  resultDiv.innerHTML = "";

  res.forEach((name, i) => {
    const row = document.createElement("div");

    const original = base[i].name;

    row.innerHTML = `
      <strong>${getNumber(i + 1)} ${original}ポジ</strong><br>
      ${name}
    `;

    resultDiv.appendChild(row);
  });
}

// =======================
// 一覧表示
// =======================
function renderList(res, base) {
  listView.innerHTML = "";

  const date = document.getElementById("date").value;

  const title = document.createElement("h3");
  title.textContent = date || "未設定日付";

  listView.appendChild(title);

  res.forEach((name, i) => {
    const row = document.createElement("div");
    row.textContent = `${getNumber(i + 1)} ${base[i].name} → ${name}`;
    listView.appendChild(row);
  });
}

// =======================
// チェックリセット
// =======================
function clearChecks() {
  document.querySelectorAll("#members input")
    .forEach(el => el.checked = false);
}

// =======================
// 結果クリア
// =======================
function clearResult() {
  resultDiv.innerHTML = "";
  listView.innerHTML = "";
}
