import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/reserveBook", {});

    if (result.success && result.data?.reserveBookList?.length > 0) {
        const books = result.data.reserveBookList.map(book => ({
            ...book,
            releaseDateLocal: book.bookShelfTime
                ? new Date(book.bookShelfTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
                : "TBA"
        }));
        res.status(200).json({ status: 'ok', total: books.length, data: books });
    } else {
        res.status(500).json({ status: 'error', message: result.error || 'Empty result' });
    }
}
