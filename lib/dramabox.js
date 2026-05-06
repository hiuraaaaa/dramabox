import axios from "axios";
import https from "https";

const API_BASE = "https://nb-dramabox-gentoken.vercel.app";

let session = {
    token: "",
    deviceid: "",
    androidid: ""
};

delete axios.defaults.headers.common['Accept'];

const androidHttpsAgent = new https.Agent({
    ciphers: [
        "TLS_AES_128_GCM_SHA256",
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "ECDHE-ECDSA-AES128-GCM-SHA256",
        "ECDHE-RSA-AES128-GCM-SHA256"
    ].join(':'),
    honorCipherOrder: true,
    minVersion: 'TLSv1.2'
});

export async function generateToken() {
    try {
        const res = await axios.get(`${API_BASE}/generate-token`);
        if (res.data && res.data.status && res.data.data) {
            const data = res.data.data;
            session.token = data.sn;
            session.deviceid = data.device_id;
            session.androidid = data.android_id;
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function getRemoteSignature(bodyPayload) {
    try {
        const res = await axios.post(`${API_BASE}/sign`, {
            body: bodyPayload,
            device_id: session.deviceid,
            android_id: session.androidid,
            token: session.token
        });
        return (res.data && res.data.status) ? res.data.data : null;
    } catch (error) {
        return null;
    }
}

function getLocalTime() {
    const now = new Date();
    const offset = 7 * 60 * 60 * 1000;
    const bangkokTime = new Date(now.getTime() + offset);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${bangkokTime.getUTCFullYear()}-${pad(bangkokTime.getUTCMonth() + 1)}-${pad(bangkokTime.getUTCDate())} ${pad(bangkokTime.getUTCHours())}:${pad(bangkokTime.getUTCMinutes())}:${pad(bangkokTime.getUTCSeconds())}.${bangkokTime.getUTCMilliseconds().toString().padStart(3, '0')} +0700`;
}

export async function postRequest(endpoint, body) {
    if (!session.token) await generateToken();

    const signData = await getRemoteSignature(body);
    if (!signData) return { success: false, error: "Signature Failed" };

    const headers = {
        "mchid": "DRA1000042", "tz": "-420", "language": "in", "mcc": "510",
        "locale": "in_ID", "is_root": "1", "device-id": session.deviceid,
        "nchid": "DRA1000042", "md": "Redmi Note 5", "store-source": "store_google",
        "mf": "XIAOMI", "local-time": getLocalTime(), "time-zone": "+0700",
        "brand": "Xiaomi", "apn": "1", "lat": "0", "is_emulator": "0",
        "current-language": "in", "ov": "10", "version": "561",
        "afid": Date.now() + "-" + Math.floor(Math.random() * 9999999999999999),
        "package-name": "com.storymatrix.drama", "android-id": session.androidid,
        "srn": "1080x2160", "p": "60", "is_vpn": "1",
        "build": "Build/QQ3A.200805.001", "pline": "ANDROID", "vn": "5.6.1",
        "over-flow": "new-fly", "tn": `Bearer ${session.token}`,
        "cid": "DRA1000042", "sn": signData.sn, "active-time": "1297",
        "content-type": "application/json; charset=UTF-8", "accept-encoding": "gzip",
        "user-agent": "okhttp/4.10.0", "Connection": "Keep-Alive"
    };

    const fullEndpoint = endpoint.includes('?')
        ? `${endpoint}&timestamp=${signData.timestamp}`
        : `${endpoint}?timestamp=${signData.timestamp}`;

    try {
        const response = await axios.post(fullEndpoint, body, {
            headers,
            httpsAgent: androidHttpsAgent,
            timeout: 15000
        });
        if (response.data && response.data.data) return { success: true, data: response.data.data };
        return { success: false, error: "Empty Data" };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
