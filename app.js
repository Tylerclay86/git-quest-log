const STORAGE_KEY = "git-quest-log";
const $form = document.getElementById("quest-form");
const $input = document.getElementById("quest-input");
const $list = document.getElementById("quest-list");
const $clear = document.getElementById("clear-all");
const $counter = document.getElementById("counter");

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function render(items) {
  $list.innerHTML = "";

  items.forEach((quest, idx) => {
    if (typeof quest === "string") { // upgrade old saves
      quest = { text: quest, done: false };
      items[idx] = quest;
    }

    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = quest.done;
    checkbox.addEventListener("change", () => {
      items[idx].done = checkbox.checked;
      save(items);
      render(items);
    });

    const span = document.createElement("span");
    span.textContent = quest.text;
    if (quest.done) span.style.textDecoration = "line-through";

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

  // Update Clear button + counter
  const count = items.length;
  if ($clear) {
    $clear.disabled = count === 0;
    $clear.setAttribute("aria-disabled", String(count === 0));
  }
  if ($counter) {
    const remaining = items.filter(i => !i.done).length;
    $counter.textContent = count === 0
      ? "No quests yet — add your first!"
      : `${remaining} remaining • ${count} total`;
  }
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
if ($clear) {
  $clear.addEventListener("click", () => {
    if (!state.length) return;
    // Simple confirm for now (keeps it beginner-friendly)
    if (!confirm("Clear all quests? This cannot be undone.")) return;
    state.length = 0;     // wipe in-place
    save(state);
    render(state);
  });
}
