import { teams } from "./data.js";
import { assign, getNumber } from "./assign.js";

const teamSelect = document.getElementById("team-select");

let currentTeam = "teamA";

// ★初期描画
renderMembers();

// チーム変更
teamSelect.onchange = () => {
  currentTeam = teamSelect.value;
  renderMembers();
};

// メンバー表示（ここが切替本体）
function renderMembers() {
  const membersDiv = document.getElementById("members");
  membersDiv.innerHTML = "";

  const team = teams[currentTeam];

  team.customOrder.forEach(name => {
    const m = team.basePositions.find(p => p.name === name);

    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${m.name}">
      ${m.index} ${m.name}
    `;

    membersDiv.appendChild(label);
  });
}

// 割り当て
document.getElementById("assign-btn").onclick = () => {
  const team = teams[currentTeam];

  const absent = [...document.querySelectorAll("input:checked")]
    .map(e => e.value);

  const res = assign(absent, team.basePositions);

  render(res, team.basePositions);
  renderList(res, team.basePositions);
};
