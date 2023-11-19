import { TodoForm } from '../TodoForm/TodoForm.js';
import { Todo } from '../Todo/Todo.js';

export function TodoList() {
    const todos = $state([]);
    if (localStorage.getItem('todos')) {
        todos.$set(JSON.parse(localStorage.getItem('todos')));
    }
    $effect(() => localStorage.setItem('todos', JSON.stringify(todos.$get())), todos);
    const addTodo = desc => {
        const t = todos.$get();
        t.push({ id: crypto.randomUUID(), desc, isComplete: false });
        todos.$set(t);
    };
    const updateTodo = id => {
        const t = todos.$get().find(t => t.id === id);
        if (t == null) {
            return;
        }
        t.isComplete = !t.isComplete;
        todos.$set(todos.$get());
    };
    const deleteTodo = id => {
        const t = todos.$get().filter(t => t.id !== id);
        todos.$set(t);
    };

    return $.div(
        { classList: 'todo-list' },
        TodoForm(addTodo),
        $.div(
            _,
            $for(() => todos.$get().map(t => Todo(t, updateTodo, deleteTodo)), todos)
        )
    );
}
