export async function getAlbums(url) {
    try {
        const res = await fetch(`${url}/albums`, { method: 'GET' });
        const albums = await res.json();
        return albums.slice(0, 1);
    } catch (e) {
        console.error(e);
        return [];
    }
}
