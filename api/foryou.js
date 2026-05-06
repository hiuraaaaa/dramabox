import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const body = { homePageStyle: 0, isNeedRank: 1, isNeedNewChannel: 1, type: 0 };
    const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

    if (result.success && result.data?.columnVoList) {
        let allBooks = [];
        result.data.columnVoList.forEach(col => {
            if (col.bookList?.length > 0) allBooks = allBooks.concat(col.bookList);
        });
        res.status(200).json({ status: 'ok', total: allBooks.length, data: allBooks });
    } else {
        res.status(500).json({ status: 'error', message: result.error || 'Empty result' });
    }
}
