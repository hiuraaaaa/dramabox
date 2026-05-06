import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { type = '1' } = req.query;
    const rankType = parseInt(type);

    const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/rank", { rankType });

    if (result.success && result.data?.rankList?.length > 0) {
        const categoryName = result.data.rankTypeVoList?.find(r => r.rankType === rankType)?.rankName || `Rank_${rankType}`;
        res.status(200).json({ status: 'ok', category: categoryName, total: result.data.rankList.length, data: result.data.rankList });
    } else {
        res.status(500).json({ status: 'error', message: result.error || 'Empty result' });
    }
}
