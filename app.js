import { teams } from "./data.js";
import { assign, getNumber } from "./assign.js";

// =======================
// DOM取得（先に固定）
// =======================
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");
const listView = document.getElementById("list-view");

let currentTeam = "teamA";

// =======================
// 初期描画
// =======================
init();

// =======================
// 初期化
// =======================
function init() {
  if (!teams[currentTeam]) {
    console.error("初期チームが存在しません");
    return;
  }

  renderMembers();
}

// =======================
// チーム切替
// =======================
teamSelect.addEventListener("change", (e) => {
  currentTeam = e.target.value;

  resetUI();
  renderMembers();
});

// =======================
// メンバー表示
// =======================
function renderMembers() {
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];

  if (!team || !Array.isArray(team.basePositions)) {
    console.error("basePositionsが不正です:", currentTeam);
    return;
  }

  if (!Array.isArray(team.customOrder)) {
    console.error("customOrderが不正です:", currentTeam);
    return;
  }

  team.customOrder.forEach(name => {
    const m = team.basePositions.find(p => p.name === name);

    if (!m) {
      console.warn("未登録メンバー:", name);
      return;
    }

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

  if (!team) return;

  const absent = getCheckedMembers();

  const res = assign(absent, team.basePositions);

  renderResult(res, team.basePositions);
  renderList(res, team.basePositions);
});

// =======================
// チェック取得
// =======================
function getCheckedMembers() {
  return Array.from(document.querySelectorAll("#members input:checked"))
    .map(el => el.value);
}

// =======================
// 結果表示
// =======================
function renderResult(res, base) {
  resultDiv.innerHTML = "";

  res.forEach((name, i) => {
    const original = base[i]?.name ?? "不明";

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

  const date = document.getElementById("date")?.value || "未設定日付";

  const title = document.createElement("h3");
  title.textContent = date;

  listView.appendChild(title);

  res.forEach((name, i) => {
    const original = base[i]?.name ?? "不明";

    const row = document.createElement("div");
    row.textContent = `${getNumber(i + 1)} ${original} → ${name}`;

    listView.appendChild(row);
  });
}

// =======================
// UIリセット
// =======================
function resetUI() {
  membersDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  listView.innerHTML = "";

  // チェックも完全解除
  document.querySelectorAll("#members input")
    .forEach(el => el.checked = false);
}
