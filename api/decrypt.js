export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { url } = req.query;
    if (!url) return res.status(400).json({ status: 'error', message: 'Parameter url wajib diisi' });

    const decryptedUrl = `https://exsalapi.my.id/api/tools/dramabox/decrypt-video?url=${encodeURIComponent(url)}&apikey=freepublic`;

    res.status(200).json({ status: 'ok', original: url, decrypted_url: decryptedUrl });
}
