(function () {
  const STORAGE_KEY = "todos-v1";

  /** @type {{ id: string, text: string, completed: boolean }[]} */
  let todos = [];
  let currentFilter = "all"; // all | active | completed

  const elements = {
    form: document.getElementById("new-todo-form"),
    input: document.getElementById("todo-input"),
    list: document.getElementById("todo-list"),
    itemsLeft: document.getElementById("items-left"),
    filterButtons: Array.from(document.querySelectorAll(".filter-btn")),
    clearCompleted: document.getElementById("clear-completed"),
  };

  function loadTodosFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    } catch (error) {
      todos = [];
    }
  }

  function saveTodosToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function createTodo(text) {
    return { id: String(Date.now()), text, completed: false };
  }

  function getFilteredTodos() {
    if (currentFilter === "active") return todos.filter((t) => !t.completed);
    if (currentFilter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  function updateItemsLeft() {
    const activeCount = todos.filter((t) => !t.completed).length;
    elements.itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"}`;
  }

  function render() {
    elements.list.innerHTML = "";

    const visibleTodos = getFilteredTodos();
    for (const todo of visibleTodos) {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", "Mark completed");
      checkbox.dataset.action = "toggle";

      const textSpan = document.createElement("span");
      textSpan.className = `todo-text${todo.completed ? " completed" : ""}`;
      textSpan.textContent = todo.text;
      textSpan.title = "Double‑click to edit";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.dataset.action = "delete";
      deleteBtn.setAttribute("aria-label", "Delete to-do");

      li.append(checkbox, textSpan, deleteBtn);
      elements.list.appendChild(li);
    }

    updateItemsLeft();
  }

  function setActiveFilterButton() {
    elements.filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === currentFilter);
    });
  }

  function addTodo(text) {
    const newTodo = createTodo(text);
    todos.push(newTodo);
    saveTodosToStorage();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.completed = !todo.completed;
    saveTodosToStorage();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodosToStorage();
    render();
  }

  function editTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const next = prompt("Edit to‑do:", todo.text);
    if (next == null) return; // cancelled
    const trimmed = next.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    todo.text = trimmed;
    saveTodosToStorage();
    render();
  }

  function clearCompletedTodos() {
    todos = todos.filter((t) => !t.completed);
    saveTodosToStorage();
    render();
  }

  // Event bindings
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.input.value.trim();
    if (!value) return;
    addTodo(value);
    elements.input.value = "";
    elements.input.focus();
  });

  elements.list.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const li = target.closest(".todo-item");
    if (!li) return;
    const id = li.dataset.id;

    const action = target.dataset.action;
    if (action === "toggle") {
      toggleTodo(id);
    } else if (action === "delete") {
      deleteTodo(id);
    }
  });

  elements.list.addEventListener("dblclick", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("todo-text")) return;
    const li = target.closest(".todo-item");
    if (!li) return;
    editTodo(li.dataset.id);
  });

  elements.filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      setActiveFilterButton();
      render();
    });
  });

  elements.clearCompleted.addEventListener("click", () => {
    clearCompletedTodos();
  });

  // Init
  loadTodosFromStorage();
  setActiveFilterButton();
  render();
})();