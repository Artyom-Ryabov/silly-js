import { Counter } from '../Counter/Counter.js';
import { Gallery } from '../GalleryApp/Gallery/Gallery.js';
import { TodoList } from '../TodoApp/TodoList/TodoList.js';

export function App() {
    return $.div({ classList: 'app' }, TodoList());
}
