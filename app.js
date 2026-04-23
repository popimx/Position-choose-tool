import { basePositions } from "./data.js";
import { assign, getNumber } from "./assign.js";

const membersDiv = document.getElementById("members");

basePositions.forEach(p => {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${p.name}"> ${p.name}`;
  membersDiv.appendChild(label);
});

// メニュー切替
let mode = "result";

document.getElementById("menu-btn").onclick = () => {
  mode = mode === "result" ? "list" : "result";

  document.getElementById("result").style.display =
    mode === "result" ? "block" : "none";

  document.getElementById("list-view").style.display =
    mode === "list" ? "block" : "none";
};

// 実行
document.getElementById("assign-btn").onclick = () => {
  const absent = [...document.querySelectorAll("input:checked")]
    .map(e => e.value);

  const res = assign(absent);

  render(res);
  renderList(res);
};

// 表示
function render(res) {
  const div = document.getElementById("result");
  div.innerHTML = "";

  res.forEach((name, i) => {
    const base = basePositions[i];

    const el = document.createElement("div");
    el.className = "position";

    el.innerHTML = `
      <strong>${getNumber(i + 1)} ${base.name}ポジ</strong><br>
      <span class="${base.name !== name ? "sub" : ""}">${name}</span>
    `;

    div.appendChild(el);
  });
}

// 一覧表示
function renderList(res) {
  const div = document.getElementById("list-view");
  div.innerHTML = "";

  const date = document.getElementById("date").value;

  const h = document.createElement("h3");
  h.textContent = date;
  div.appendChild(h);

  res.forEach((name, i) => {
    const base = basePositions[i];

    const row = document.createElement("div");
    row.innerHTML = `
      ${getNumber(i + 1)} ${base.name}ポジ
      → ${name}
    `;

    div.appendChild(row);
  });
}
