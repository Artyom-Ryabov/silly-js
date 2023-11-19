import { getAlbums } from './lib/api/getAlbum.js';
import config from '../shared/url.js';
import { getPhotosInAlbum } from './lib/api/getPicturesInAlbum.js';

async function fetchAlbums(state) {
    const albums = await getAlbums(config.uri);
    state.$set(albums);
}

async function fetchPictures(state, id) {
    const pictures = await getPhotosInAlbum(config.uri, id);
    const arr = state.$get();
    arr.push(...pictures);
    state.$set(arr);
}

export function Gallery() {
    const albums = $state([]);
    const pictures = $state([]);
    fetchAlbums(albums);
    $effect(() => albums.$get().forEach(album => fetchPictures(pictures, album.id)), albums);
    return $.div(
        _,
        $for(() => pictures.$get().map(pic => $.img({ src: pic.thumbnailUrl })), pictures)
    );
}
