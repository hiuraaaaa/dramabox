import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { q, sort = '1', page = '1' } = req.query;
    if (!q) return res.status(400).json({ status: 'error', message: 'Parameter q (keyword) wajib diisi' });

    const sortType = parseInt(sort);
    const searchSource = (sortType === 2 || sortType === 3) ? "搜索按钮" : "";
    const fromParam = (sortType === 2 || sortType === 3) ? "search_sug" : "search_result";

    let allResults = [], pageNum = parseInt(page), keepFetching = true;

    while (keepFetching) {
        const body = {
            searchSource, sortType, synSwitch: 1,
            pageNo: pageNum, pageSize: 20, from: fromParam, keyword: q
        };
        const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/search/search", body);
        if (result.success && result.data?.searchList?.length > 0) {
            allResults = allResults.concat(result.data.searchList);
            if (result.data.isMore === 0 || result.data.searchList.length < 20) keepFetching = false;
            else { pageNum++; await new Promise(r => setTimeout(r, 600)); }
        } else keepFetching = false;
    }

    res.status(200).json({ status: 'ok', keyword: q, sort: sortType, total: allResults.length, data: allResults });
}
