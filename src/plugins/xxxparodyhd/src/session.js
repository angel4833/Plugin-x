// Session and HTTP response normalization for XXXParodyHD plugin.

const xxxparodyhdSession = {
  cookies: {},
  isLegacyBase64Host: null,
};

const XXXPARODYHD_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function xxxparodyhdCookieHeader() {
  return Object.keys(xxxparodyhdSession.cookies)
    .map((key) => `${key}=${xxxparodyhdSession.cookies[key]}`)
    .join("; ");
}

function xxxparodyhdDefaultHeaders(extraHeaders = {}) {
  const headers = {
    "User-Agent": XXXPARODYHD_USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/jpeg,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://xxxparodyhd.net/",
    ...extraHeaders,
  };
  const cookie = xxxparodyhdCookieHeader();
  if (cookie && !headers.Cookie) {
    headers.Cookie = cookie;
  }
  return headers;
}

function xxxparodyhdRememberCookies(headers) {
  if (!headers) return;
  const raw = headers["set-cookie"] || headers["Set-Cookie"] || "";
  const values = Array.isArray(raw) ? raw : [raw];
  for (const value of values) {
    if (!value) continue;
    const match = String(value).match(/^\s*([^=;]+)=([^;]*)/);
    if (match) xxxparodyhdSession.cookies[match[1]] = match[2];
  }
}

function xxxparodyhdDecodeBase64Bytes(base64Str) {
  const clean = String(base64Str || "").replace(/[^A-Za-z0-9+/=]/g, "");
  if (!clean) return [];
  const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c1 = table.indexOf(clean[i]);
    const c2 = table.indexOf(clean[i + 1]);
    const c3 = clean[i + 2] === "=" ? -1 : table.indexOf(clean[i + 2]);
    const c4 = clean[i + 3] === "=" ? -1 : table.indexOf(clean[i + 3]);
    if (c1 < 0 || c2 < 0) continue;
    bytes.push((c1 << 2) | (c2 >> 4));
    if (c3 >= 0) bytes.push(((c2 & 15) << 4) | (c3 >> 2));
    if (c4 >= 0) bytes.push(((c3 & 3) << 6) | c4);
  }
  return bytes;
}

function xxxparodyhdBytesToUtf8(bytes) {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if (b1 < 0x80) {
      out += String.fromCharCode(b1);
    } else if (b1 >= 0xc0 && b1 < 0xe0 && i < bytes.length) {
      const b2 = bytes[i++];
      out += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
    } else if (b1 >= 0xe0 && b1 < 0xf0 && i + 1 < bytes.length) {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      out += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
    } else if (b1 >= 0xf0 && i + 2 < bytes.length) {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      const b4 = bytes[i++];
      const cp = (((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f)) - 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}

function xxxparodyhdDecodeBase64Utf8(base64Str) {
  if (!base64Str) return "";
  return xxxparodyhdBytesToUtf8(xxxparodyhdDecodeBase64Bytes(base64Str));
}

function xxxparodyhdNormalizeResponse(response, options = {}) {
  if (!response || typeof response !== "object") {
    return {
      statusCode: 0,
      status: 0,
      headers: {},
      body: "",
      bodyBytes: [],
      rawBodyBase64: "",
      isLegacyBase64Host: Boolean(xxxparodyhdSession.isLegacyBase64Host),
    };
  }

  // Handle older Hedon Haven (<=0.6.7) { status, body: base64String }
  const isLegacyBase64Host =
    typeof response.statusCode === "undefined" &&
    typeof response.status !== "undefined" &&
    !Array.isArray(response.bodyBytes);

  xxxparodyhdSession.isLegacyBase64Host = isLegacyBase64Host;
  const statusCode = Number(response.statusCode ?? response.status ?? 0);

  if (isLegacyBase64Host) {
    const rawBodyBase64 = typeof response.body === "string" ? response.body : "";
    const decodedBody = options.binary ? "" : xxxparodyhdDecodeBase64Utf8(rawBodyBase64);
    return {
      statusCode,
      status: statusCode,
      headers: response.headers || {},
      body: decodedBody,
      bodyBytes: [],
      rawBodyBase64,
      isLegacyBase64Host: true,
    };
  }

  return {
    statusCode,
    status: statusCode,
    headers: response.headers || {},
    body: typeof response.body === "string" ? response.body : "",
    bodyBytes: Array.isArray(response.bodyBytes)
      ? response.bodyBytes
      : response.bodyBytes
      ? Array.from(response.bodyBytes)
      : [],
    rawBodyBase64: "",
    isLegacyBase64Host: false,
  };
}

async function xxxparodyhdRequest(url, headers = {}, options = {}) {
  const requestHeaders = xxxparodyhdDefaultHeaders(headers);
  const rawResponse = await httpRequest(url, requestHeaders);
  if (rawResponse && rawResponse.headers) {
    xxxparodyhdRememberCookies(rawResponse.headers);
  }
  return xxxparodyhdNormalizeResponse(rawResponse, options);
}
