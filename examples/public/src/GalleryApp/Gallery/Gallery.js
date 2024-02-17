import { getAlbums } from './lib/api/getAlbum.js';
import config from '../shared/url.js';
import { getPhotosInAlbum } from './lib/api/getPicturesInAlbum.js';

async function fetchAlbums(state) {
    const albums = await getAlbums(config.uri);
    state(albums);
}

async function fetchPictures(state, id) {
    const pictures = await getPhotosInAlbum(config.uri, id);
    const arr = state();
    arr.push(...pictures);
    state(arr);
}

export function Gallery() {
    const albums = $state([]);
    const pictures = $state([]);
    fetchAlbums(albums);
    $effect(() => albums().forEach(album => fetchPictures(pictures, album.id)), [albums]);
    return $.div(
        _,
        $for(() => pictures().map(pic => $.img({ src: pic.thumbnailUrl })), [pictures])
    );
}
