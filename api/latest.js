import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    let allResults = [], page = 1, keepFetching = true;

    while (keepFetching) {
        const body = { newChannelStyle: 1, isNeedRank: 1, pageNo: page, index: 1, channelId: 43 };
        const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);
        if (result.success && result.data?.newTheaterList?.records?.length > 0) {
            allResults = allResults.concat(result.data.newTheaterList.records);
            const totalPages = result.data.newTheaterList.pages || 1;
            if (page >= totalPages) keepFetching = false;
            else { page++; await new Promise(r => setTimeout(r, 600)); }
        } else keepFetching = false;
    }

    res.status(200).json({ status: 'ok', total: allResults.length, data: allResults });
}
