export function Todo(todo, updateTodo, deleteTodo) {
    const isComplete = $state(todo.isComplete ?? false);
    return $.div(
        {
            classList: 'todo'
        },
        $.div(
            { classList: 'container container-checkbox' },
            $.input({
                classList: 'checkbox',
                type: 'checkbox',
                onchange: () => updateTodo(todo.id),
                checked: todo.isComplete ?? false
            })
        ),
        $if(isComplete, $.div(_, $.s(_, todo.desc)), $.div(_, $.span(_, todo.desc))),
        $.div(
            { classList: 'container container-button' },
            $.button({ onclick: () => deleteTodo(todo.id) }, 'x')
        )
    );
}
