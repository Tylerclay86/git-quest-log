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
  items.forEach((quest, idx) => {
    // Support old saves (plain text) by upgrading to object
    if (typeof quest === "string") {
      quest = { text: quest, done: false };
      items[idx] = quest;
    }

    const li = document.createElement("li");

    // Create checkbox for done/undone
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = quest.done;
    checkbox.addEventListener("change", () => {
      items[idx].done = checkbox.checked;
      save(items);
      render(items);
    });

    // Quest text
    const span = document.createElement("span");
    span.textContent = quest.text;
    if (quest.done) span.style.textDecoration = "line-through";

    // Delete button
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      items.splice(idx, 1);
      save(items);
      render(items);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
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
  state.push({ text, done: false });  // now stores object
  save(state);
  render(state);
  $input.value = "";
  $input.focus();
});
