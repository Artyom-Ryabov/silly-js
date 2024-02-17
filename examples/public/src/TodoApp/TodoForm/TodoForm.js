export function TodoForm(addTodo) {
    const desc = $state('');

    return $.div(
        { classList: 'todo-form' },
        $.input({ type: 'text', oninput: e => desc(e.target.value) }),
        $.button({ onclick: () => addTodo(desc()) }, 'Add')
    );
}
