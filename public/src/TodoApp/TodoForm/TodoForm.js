export function TodoForm(addTodo) {
    const desc = $state('');

    return $.div(
        { classList: 'todo-form' },
        $.input({ type: 'text', input: e => desc.$set(e.target.value) }),
        $.button({ click: () => addTodo(desc.$get()) }, 'Add')
    );
}
