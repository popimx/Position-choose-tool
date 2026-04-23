export function saveData(data) {
  const list = JSON.parse(localStorage.getItem("history") || "[]");
  list.push(data);
  localStorage.setItem("history", JSON.stringify(list));
}

export function loadData() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}
