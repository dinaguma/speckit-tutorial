const STORAGE_KEY = "todo-app-tasks";
const MAX_TEXT_LENGTH = 200;

const state = {
  todos: [],
  currentFilter: "all",
  storageAvailable: true,
};

const elements = {
  form: document.getElementById("todo-form"),
  input: document.getElementById("todo-input"),
  errorMessage: document.getElementById("error-message"),
  statusMessage: document.getElementById("status-message"),
  list: document.getElementById("todo-list"),
  emptyState: document.getElementById("empty-state"),
  count: document.getElementById("task-count"),
  filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
};

function canUseLocalStorage() {
  try {
    const testKey = "__todo_storage_test__";
    window.localStorage.setItem(testKey, "ok");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function showInputError(message) {
  elements.errorMessage.textContent = message || "";
}

function showStatus(message) {
  elements.statusMessage.textContent = message || "";
}

function clearMessages() {
  showInputError("");
  if (state.storageAvailable) {
    showStatus("");
  }
}

function isValidTodoPayload(value) {
  const text = value.trim();
  if (!text) {
    return { valid: false, text: "", reason: "タスクを入力してください。" };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, text: "", reason: `${MAX_TEXT_LENGTH}文字以内で入力してください。` };
  }

  return { valid: true, text, reason: "" };
}

function saveTodos() {
  if (!state.storageAvailable) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
  } catch (error) {
    state.storageAvailable = false;
    showStatus("保存に失敗しました。ブラウザ保存が利用できないため、このセッションでは保持されません。");
  }
}

function normalizeTodo(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const text = typeof item.text === "string" ? item.text.trim() : "";
  if (!text) {
    return null;
  }

  return {
    id: typeof item.id === "string" ? item.id : String(item.id ?? Date.now()),
    text: text.slice(0, MAX_TEXT_LENGTH),
    completed: Boolean(item.completed),
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
  };
}

function loadTodos() {
  if (!state.storageAvailable) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("stored data is not array");
    }

    return parsed.map(normalizeTodo).filter(Boolean);
  } catch (error) {
    showStatus("保存データの読み込みに失敗したため、空のリストで開始しました。");
    return [];
  }
}

function createTodo(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function getFilteredTodos() {
  if (state.currentFilter === "active") {
    return state.todos.filter((todo) => !todo.completed);
  }

  if (state.currentFilter === "completed") {
    return state.todos.filter((todo) => todo.completed);
  }

  return state.todos;
}

function updateFilterButtons() {
  elements.filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;
  if (todo.completed) {
    li.classList.add("is-completed");
  }

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "todo-toggle";
  toggle.dataset.action = "toggle";
  toggle.setAttribute("aria-label", `「${todo.text}」を${todo.completed ? "未完了" : "完了"}にする`);
  toggle.textContent = todo.completed ? "✓" : "○";

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const del = document.createElement("button");
  del.type = "button";
  del.className = "todo-delete";
  del.dataset.action = "delete";
  del.setAttribute("aria-label", `「${todo.text}」を削除`);
  del.textContent = "削除";

  li.append(toggle, text, del);
  return li;
}

function render() {
  const filtered = getFilteredTodos();
  elements.list.innerHTML = "";

  if (filtered.length === 0) {
    elements.emptyState.hidden = false;
  } else {
    elements.emptyState.hidden = true;
    const fragment = document.createDocumentFragment();
    filtered.forEach((todo) => fragment.appendChild(renderTodoItem(todo)));
    elements.list.appendChild(fragment);
  }

  const activeCount = state.todos.filter((todo) => !todo.completed).length;
  elements.count.textContent = `未完了 ${activeCount} 件`;
  updateFilterButtons();
}

function addTodo(rawText) {
  const result = isValidTodoPayload(rawText);
  if (!result.valid) {
    showInputError(result.reason);
    return;
  }

  state.todos.unshift(createTodo(result.text));
  saveTodos();
  elements.input.value = "";
  clearMessages();
  render();
}

function toggleTodo(id) {
  state.todos = state.todos.map((todo) => {
    if (todo.id !== id) {
      return todo;
    }

    return { ...todo, completed: !todo.completed };
  });
  saveTodos();
  render();
}

function deleteTodo(id) {
  const before = state.todos.length;
  state.todos = state.todos.filter((todo) => todo.id !== id);
  if (state.todos.length !== before) {
    saveTodos();
    render();
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  addTodo(elements.input.value);
  elements.input.focus();
}

function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const item = button.closest(".todo-item");
  if (!item) {
    return;
  }

  const id = item.dataset.id;
  if (!id) {
    return;
  }

  if (button.dataset.action === "toggle") {
    toggleTodo(id);
  }

  if (button.dataset.action === "delete") {
    deleteTodo(id);
  }
}

function handleFilterClick(event) {
  const button = event.target.closest(".filter-btn");
  if (!button) {
    return;
  }

  const nextFilter = button.dataset.filter;
  if (!nextFilter || nextFilter === state.currentFilter) {
    return;
  }

  state.currentFilter = nextFilter;
  render();
}

function bindEvents() {
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.list.addEventListener("click", handleListClick);
  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", handleFilterClick);
  });
}

function init() {
  state.storageAvailable = canUseLocalStorage();
  if (!state.storageAvailable) {
    showStatus("ブラウザ保存が利用できないため、このセッションではデータを保持できません。");
  }

  state.todos = loadTodos();
  bindEvents();
  render();
  elements.input.focus();
}

init();
