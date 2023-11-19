import { Gallery } from '../GalleryApp/Gallery/Gallery.js';
import { TodoList } from '../TodoApp/TodoList/TodoList.js';

function Counter() {
    const counter = $state(0);
    const doubled = $computed(() => counter.$get() * 2, counter);
    const isEven = $computed(() => counter.$get() % 2 == 0, counter);

    $effect(() => console.log(counter.$get()), counter);

    const count = () => counter.$set(counter.$get() + 1);

    return $.div(
        {
            style: 'display: flex; flex-direction: column; gap: 5px; width: 150px'
        },
        $.span(_, counter),
        $.span(_, doubled),
        $.button({ click: count }, 'count'),
        $if(isEven, 'lol', [$.span(_, 'bruh'), isEven])
    );
}

export function App() {
    return $.div({ classList: 'app' }, TodoList());
}
