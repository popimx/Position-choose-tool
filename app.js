import { teams } from "./data.js";
import { assign, getNumber } from "./assign.js";

// =======================
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");
const listView = document.getElementById("list-view");

let currentTeam = "teamA";

// =======================
// 初期化
// =======================
init();

function init() {
  renderMembers();
}

// =======================
// チーム切替
// =======================
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;

  clearUI();
  renderMembers();
});

// =======================
// メンバー描画
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];
  if (!team) return;

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
// 割り当て
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const team = teams[currentTeam];
  if (!team) return;

  const absent = getCheckedMembers();

  let res = [];

  try {
    res = assign(absent, team.basePositions);
  } catch (e) {
    console.error("assignエラー:", e);
    return;
  }

  renderResult(res, team.basePositions);
  renderList(res, team.basePositions);
});

// =======================
// チェック取得
// =======================
function getCheckedMembers() {
  return [...document.querySelectorAll("#members input:checked")]
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
  resultDiv.innerHTML = "";
  listView.innerHTML = "";
}
