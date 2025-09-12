// ======== Simple Kanban: Backlog → To Do → Doing → Done ========
// Data model: [{ text: string, status: "backlog"|"todo"|"doing"|"done" }]

// ---- DOM refs ----
const STORAGE_KEY = "git-kanban";

const $form = document.getElementById("quest-form");
const $input = document.getElementById("quest-input");

const lists = {
  backlog: document.getElementById("backlog-list"),
  todo:    document.getElementById("todo-list"),
  doing:   document.getElementById("doing-list"),
  done:    document.getElementById("done-list"),
};

// ---- State ----
let state = load();
render(state);

// ---- Form: add new task (into Backlog) ----
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = ($input.value || "").trim();
  if (!text) return;

  state.push({ text, status: "backlog" });
  save(state);
  render(state);

  $input.value = "";
  $input.focus();
});

// ---- Persistence helpers ----
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    // Upgrade older formats if needed (plain strings → objects)
    return items.map(it =>
      typeof it === "string" ? ({ text: it, status: "backlog" }) : it
    );
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ---- Rendering ----
function render(items) {
  // Clear columns
  for (const key in lists) lists[key].innerHTML = "";

  // Paint tasks into their columns
  items.forEach((task, idx) => {
    const li = makeTaskEl(task, idx);
    lists[task.status]?.appendChild(li);
  });
}

// Build one <li> with drag + delete
function makeTaskEl(task, idx) {
  const li = document.createElement("li");
  li.draggable = true;
  li.dataset.index = String(idx);

  // Task text
  const textSpan = document.createElement("span");
  textSpan.textContent = task.text;

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.splice(idx, 1);
    save(state);
    render(state);
  });

  // Drag handlers
  li.addEventListener("dragstart", () => {
    li.classList.add("dragging");
  });
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
  });

  // Layout: text left, delete right
  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.justifyContent = "space-between";
  textSpan.style.marginRight = "8px";

  li.appendChild(textSpan);
  li.appendChild(delBtn);
  return li;
}

// ---- Drag & Drop wiring for each column list ----
document.querySelectorAll(".task-list").forEach((listEl) => {
  // Allow dropping by canceling default
  listEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (dragging && dragging.parentElement !== listEl) {
      // Just move the ghost for visual feedback
      listEl.appendChild(dragging);
    }
  });

  // On drop → update state.status and persist
  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    const idx = Number(dragging.dataset.index);
    const newStatus = listEl.id.replace("-list", ""); // backlog-list → backlog

    // Guard: ensure valid status
    if (!lists[newStatus]) return;

    state[idx].status = newStatus;
    save(state);
    render(state);
  });
});
