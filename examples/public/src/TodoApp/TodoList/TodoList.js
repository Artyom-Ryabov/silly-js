import { TodoForm } from '../TodoForm/TodoForm.js';
import { Todo } from '../Todo/Todo.js';

export function TodoList() {
    const todos = $state([]);
    if (localStorage.getItem('todos')) {
        todos(JSON.parse(localStorage.getItem('todos')));
    }
    $effect(() => localStorage.setItem('todos', JSON.stringify(todos())), [todos]);
    const addTodo = desc => {
        const t = todos();
        t.push({ id: crypto.randomUUID(), desc, isComplete: false });
        todos(t);
    };
    const updateTodo = id => {
        const t = todos().find(t => t.id === id);
        if (t == null) {
            return;
        }
        t.isComplete = !t.isComplete;
        todos(todos());
    };
    const deleteTodo = id => {
        const t = todos().filter(t => t.id !== id);
        todos(t);
    };

    return $.div(
        { classList: 'todo-list' },
        TodoForm(addTodo),
        $.div(
            _,
            $for(() => todos().map(t => Todo(t, updateTodo, deleteTodo)), [todos])
        )
    );
}
