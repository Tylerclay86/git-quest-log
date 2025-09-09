const STORAGE_KEY = "git-quest-log";
const $form = document.getElementById("quest-form");
const $input = document.getElementById("quest-input");
const $list = document.getElementById("quest-list");

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function render(items) {
  $list.innerHTML = "";
  items.forEach((text, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${escapeHtml(text)}</span>`;
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      items.splice(idx, 1);
      save(items);
      render(items);
    });
    li.appendChild(del);
    $list.appendChild(li);
  });
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}

const state = load();
render(state);

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;
  state.push(text);
  save(state);
  render(state);
  $input.value = "";
  $input.focus();
});
