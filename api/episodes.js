import { postRequest } from '../lib/dramabox.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { id } = req.query;
    if (!id) return res.status(400).json({ status: 'error', message: 'Parameter id (bookId) wajib diisi' });

    let allEpisodes = [], currentIndex = -1, keepGoing = true;

    while (keepGoing) {
        const body = {
            boundaryIndex: 0, index: parseInt(currentIndex),
            currencyPlaySource: "ssym_rank_search", needEndRecommend: 0,
            currencyPlaySourceName: "搜索页面热门搜索_热搜榜", preLoad: false,
            rid: "", pullCid: "", enterReaderChapterIndex: 0,
            loadDirection: currentIndex === -1 ? 0 : 2, bookId: String(id)
        };

        const result = await postRequest("https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load", body);

        if (result.success && result.data?.chapterList?.length > 0) {
            const chapters = result.data.chapterList;
            const newChapters = chapters.filter(n => !allEpisodes.some(e => e.chapterId === n.chapterId));
            if (newChapters.length === 0) break;
            allEpisodes = allEpisodes.concat(newChapters);
            currentIndex = parseInt(newChapters[newChapters.length - 1].chapterIndex);
            if (chapters.length < 5) keepGoing = false;
            await new Promise(r => setTimeout(r, 600));
        } else keepGoing = false;
    }

    allEpisodes.sort((a, b) => a.chapterIndex - b.chapterIndex);
    res.status(200).json({ status: 'ok', bookId: id, total: allEpisodes.length, data: allEpisodes });
}
