export function Counter() {
    const counter = $state(0);
    const doubled = $computed(() => counter() * 2, [counter]);
    const isEven = $computed(() => counter() % 2 == 0, [counter]);

    $effect(() => console.log(counter()), [counter]);

    const count = () => counter(counter() + 1);

    return $.div(
        {
            style: 'display: flex; flex-direction: column; gap: 5px; width: 150px'
        },
        $.span(_, counter),
        $.span(_, doubled),
        $.button({ onclick: count }, 'count'),
        $if(isEven, 'lol', [$.span(_, 'bruh'), isEven])
    );
}
