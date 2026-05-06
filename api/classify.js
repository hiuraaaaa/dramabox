import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    let allResults = [], page = 1, keepFetching = true;

    while (keepFetching) {
        const body = { typeList: [], showLabels: true, pageNo: page, pageSize: 15 };
        const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/classify", body);
        if (result.success && result.data?.classifyBookList?.records?.length > 0) {
            allResults = allResults.concat(result.data.classifyBookList.records);
            if (result.data.classifyBookList.isMore === 0 || result.data.classifyBookList.records.length < 15) keepFetching = false;
            else { page++; await new Promise(r => setTimeout(r, 600)); }
        } else keepFetching = false;
    }

    res.status(200).json({ status: 'ok', total: allResults.length, data: allResults });
}
