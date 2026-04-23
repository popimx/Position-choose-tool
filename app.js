import { teams } from "./data.js";
import { assign, getNumber } from "./main.js";

// DOM
const teamSelect = document.getElementById("team-select");
const membersDiv = document.getElementById("members");
const resultDiv = document.getElementById("result");
const jsonOutput = document.getElementById("json-output");

let currentTeam = null;

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  currentTeam = teamSelect.value;
  renderMembers();
});

// チーム変更
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
  if (!team) return;

  const rows = [
    ["岩立沙穂","徳永羚海","武藤小麟","平田侑希","久保姫菜乃"],
    ["花田藍衣","坂本真凛","荒野姫楓","倉本羽菜","浅井裕華"],
    ["西井美桜","板垣心和","高橋ことね","芳賀礼","生野莉奈"],
    ["中野南実","井澤美優","竹本くるみ","佐藤海里","杉本萌"],
    ["兵頭葵","清水紗良","久留島優果"],
    [],
    ["大賀彩姫","川村昇子","福原心春","宮原心音","田中れい"],
    ["猪島莉玲亜","新沢葵唯","佐藤柚花","木原姫花世","道保琉南"]
  ];

  rows.forEach(row => {
    const div = document.createElement("div");

    row.forEach(name => {
      const label = document.createElement("label");

      label.innerHTML = `
        <input type="checkbox" value="${name}">
        ${name}
      `;

      label.style.marginRight = "10px";

      div.appendChild(label);
    });

    membersDiv.appendChild(div);
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

  renderTable(res.positions, team.basePositions);
  renderJSON(res.positions, team.basePositions);
});

// =======================
// チェック取得
// =======================
function getChecked() {
  return [...document.querySelectorAll("#members input:checked")]
    .map(el => el.value);
}

// =======================
// 表表示
// =======================
function renderTable(res, base) {
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
      <td>${getNumber(i + 1)} ${base[i].name}ポジ</td>
      <td>${name}</td>
    `;

    tbody.appendChild(tr);
  });

  resultDiv.appendChild(table);
}

// =======================
// JSON出力
// =======================
function renderJSON(res, base) {

  const date = document.getElementById("date")?.value || "";

  const json = {
    date: date,
    positions: res.map((name, i) => ({
      position: `${getNumber(i + 1)} ${base[i].name}ポジ`,
      member: name
    }))
  };

  jsonOutput.value = JSON.stringify(json, null, 2);
}

// =======================
// UIリセット
// =======================
function clearUI() {
  membersDiv.innerHTML = "";
  resultDiv.innerHTML = "";
  jsonOutput.value = "";
}
