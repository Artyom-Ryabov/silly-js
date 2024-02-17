export async function getPhotosInAlbum(url, id) {
    try {
        const res = await fetch(`${url}/photos?albumId=${id}`, { method: 'GET' });
        return res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}
