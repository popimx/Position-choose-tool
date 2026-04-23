 import { teams } from "./data.js";

// =======================
// assign関数（ここに統合）
// =======================
function assign(absent, basePositions) {

  const result = basePositions.map(p => p.name);
  const used = new Set();

  // 休演処理
  for (let i = 0; i < result.length; i++) {
    if (absent.includes(result[i])) {
      result[i] = null;
    }
  }

  const range = (s, e) =>
    Array.from({ length: e - s + 1 }, (_, i) => i + s);

  function find(list) {
    return list.find(i => result[i] && !used.has(i));
  }

  function getSlide(i) {
    if (i <= 4) return range(i + 5, 10);
    if (i <= 9) return range(i + 6, 15);
    return [];
  }

  function getFixed(i) {
    const map = {
      10: [16, 22],
      11: [17, 23],
      12: [18, 24, 29],
      13: [19, 25, 30],
      14: [20, 26, 31],
      15: [21, 27, 32],
      16: [22, 28, 33]
    };
    return map[i] || [];
  }

  function fill(i) {
    const cand =
      find(getSlide(i)) ??
      find(getFixed(i)) ??
      find(range(16, result.length - 1));

    if (cand === undefined) return;

    result[i] = result[cand];
    used.add(cand);

    fill(cand); // 🔥 連鎖
  }

  for (let i = 0; i < 16; i++) {
    if (!result[i]) fill(i);
  }

  return result.slice(0, 16);
}

// =======================
// 丸数字
// =======================
function getNumber(n) {
  const nums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮","⑯"];
  return nums[n - 1];
}

// =======================
// DOM
// =======================
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
// メンバー表示（チェック）
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
// 割り当て実行
// =======================
document.getElementById("assign-btn").addEventListener("click", () => {

  const team = teams[currentTeam];
  if (!team) return;

  const absent = getChecked();

  const res = assign(absent, team.basePositions);

  renderResult(res, team.basePositions);
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
