// Отримання елементів DOM
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCounter = document.getElementById('task-counter');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Масив для збереження завдань та поточний фільтр
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// --- ФУНКЦІЇ РОБОТИ З LOCALSTORAGE ---

// Збереження масиву у localStorage
function saveToLocalStorage() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// --- ФУНКЦІЇ ЛОГІКИ ЗАВДАНЬ ---

// Оновлення лічильника невиконаних завдань
function updateCounter() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  taskCounter.textContent = `Залишилося завдань: ${activeCount}`;
}

// Рендеринг (відображення) списку завдань
function renderTodos() {
  todoList.innerHTML = '';

  // Фільтрація завдань перед відображенням
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all'
  });

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <div class="todo-content">
        <input 
          type="checkbox" 
          class="toggle-checkbox" 
          ${todo.completed ? 'checked' : ''}
        >
        <span class="todo-text">${escapeHtml(todo.text)}</span>
      </div>
      <div class="item-actions">
        <button class="btn-icon btn-edit" title="Редагувати">✏️</button>
        <button class="btn-icon btn-delete" title="Видалити">🗑️</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  updateCounter();
}

// Додавання нового завдання
function addTodo(text) {
  const trimmedText = text.trim();
  
  // Перевірка на порожнє значення
  if (trimmedText === '') return;

  const newTodo = {
    id: Date.now(),
    text: trimmedText,
    completed: false
  };

  todos.push(newTodo);
  saveToLocalStorage();
  renderTodos();
}

// Перемикання стану «виконано / не виконано»
function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveToLocalStorage();
  renderTodos();
}

// Видалення завдання за ID
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveToLocalStorage();
  renderTodos();
}

// Редагування тексту завдання
function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const newText = prompt('Відредагуйте завдання:', todo.text);
  
  if (newText !== null && newText.trim() !== '') {
    todo.text = newText.trim();
    saveToLocalStorage();
    renderTodos();
  }
}

// Очищення всіх виконаних завдань
function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveToLocalStorage();
  renderTodos();
}

// Захист від XSS (екранування символів)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- ОБРОБНИКИ ПОДІЙ ---

// Обробка відправки форми (кнопка або Enter)
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = '';
});

// Делегування подій на списку (чекбокси, видалення, редагування)
todoList.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;

  const id = Number(item.dataset.id);

  if (e.target.classList.contains('toggle-checkbox')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('btn-delete')) {
    deleteTodo(id);
  } else if (e.target.classList.contains('btn-edit')) {
    editTodo(id);
  }
});

// Обробка перемикання фільтрів
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Кнопка очищення виконаних
clearCompletedBtn.addEventListener('click', clearCompleted);

// Початкова ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', renderTodos);