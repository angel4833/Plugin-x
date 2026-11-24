// ==== START: src/bridge_functions.js ====
/// Host bridge functions for Hedon Haven QuickJS runtime.

function consoleLog(level, message) {
  sendMessage("consoleLog", JSON.stringify({
    "level": level,
    "message": String(message)
  }));
}

async function httpRequest(url, headers) {
  const response = await sendMessage("httpRequest", JSON.stringify({
    "url": url,
    "headers": headers || {}
  }));
  return JSON.parse(response);
}

async function readCacheFile(filePath) {
  const response = await sendMessage("readCacheFile", JSON.stringify({
    "filePath": filePath
  }));
  return JSON.parse(response);
}

async function writeCacheFile(filePath, contentAsBytes) {
  const response = await sendMessage("writeCacheFile", JSON.stringify({
    "filePath": filePath,
    "contentAsBytes": contentAsBytes
  }));
  return JSON.parse(response);
}

// ==== END: src/bridge_functions.js ====

// ==== START: src/universal_formats.js ====
// Universal formats schemas for Hedon Haven Dart <-> QuickJS bridge.
const pluginCodeName = "com.hedonhaven.xxxparodyhd";

class ScrapingException {
  constructor(message = "unknown scraping exception", isCritical = false) {
    this.message = message;
    this.isCritical = isCritical;
  }
  toMap() {
    return {
      "message": this.message,
      "isCritical": this.isCritical
    };
  }
  static fromMap(map) {
    if (!map) return null;
    return new ScrapingException(map["message"], map["isCritical"] === true);
  }
}

function tryParseFromUnixTime(unixTimeInSeconds) {
  if (unixTimeInSeconds == null) return null;
  return new Date(unixTimeInSeconds * 1000);
}

function convertToUnixTime(dateTime) {
  if (dateTime == null) return null;
  if (typeof dateTime === "number") return dateTime;
  if (dateTime instanceof Date) {
    const ms = dateTime.getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
  }
  return null;
}

class HttpResponse {
  constructor({ statusCode, bodyBytes, body, headers }) {
    this.statusCode = statusCode;
    this.bodyBytes = bodyBytes;
    this.body = body;
    this.headers = headers;
  }
  toMap() {
    return {
      "statusCode": this.statusCode,
      "bodyBytes": Array.from(this.bodyBytes || []),
      "body": this.body,
      "headers": this.headers,
    };
  }
  static fromMap(map) {
    if (!map) return null;
    return new HttpResponse({
      statusCode: map["statusCode"],
      bodyBytes: map["bodyBytes"] ? Uint8Array.from(map["bodyBytes"]) : new Uint8Array(0),
      body: map["body"] || "",
      headers: map["headers"] || {},
    });
  }
}

class ExternalLinkParsed {
  constructor({ type, iD = null, searchRequest = null, pageCount = null }) {
    this.type = type;
    this.iD = iD;
    this.searchRequest = searchRequest;
    this.pageCount = pageCount;
  }
  toMap() {
    return {
      "type": this.type,
      "iD": this.iD,
      "searchRequest": this.searchRequest?.toMap ? this.searchRequest.toMap() : this.searchRequest,
      "pageCount": this.pageCount,
    };
  }
}

class UniversalSearchRequest {
  constructor(opts = {}) {
    this.searchString = opts.searchString ?? "";
    this.sortingType = opts.sortingType ?? "Relevance";
    this.dateRange = opts.dateRange ?? "All time";
    this.minQuality = opts.minQuality ?? 0;
    this.maxQuality = opts.maxQuality ?? 2160;
    this.minDuration = opts.minDuration ?? 0;
    this.maxDuration = opts.maxDuration ?? 3600;
    this.minFramesPerSecond = opts.minFramesPerSecond ?? 0;
    this.maxFramesPerSecond = opts.maxFramesPerSecond ?? 60;
    this.virtualReality = opts.virtualReality ?? false;
    this.categoriesInclude = opts.categoriesInclude ?? [];
    this.categoriesExclude = opts.categoriesExclude ?? [];
    this.keywordsInclude = opts.keywordsInclude ?? [];
    this.keywordsExclude = opts.keywordsExclude ?? [];
    this.historySearch = opts.historySearch ?? false;
  }
  toMap() {
    return {
      "searchString": this.searchString,
      "sortingType": this.sortingType,
      "dateRange": this.dateRange,
      "minQuality": this.minQuality,
      "maxQuality": this.maxQuality,
      "minDuration": this.minDuration,
      "maxDuration": this.maxDuration,
      "minFramesPerSecond": this.minFramesPerSecond,
      "maxFramesPerSecond": this.maxFramesPerSecond,
      "virtualReality": this.virtualReality,
      "categoriesInclude": this.categoriesInclude,
      "categoriesExclude": this.categoriesExclude,
      "keywordsInclude": this.keywordsInclude,
      "keywordsExclude": this.keywordsExclude,
      "historySearch": this.historySearch,
    };
  }
  static fromMap(map) {
    if (!map) return new UniversalSearchRequest();
    return new UniversalSearchRequest({
      searchString: map["searchString"],
      sortingType: map["sortingType"],
      dateRange: map["dateRange"],
      minQuality: map["minQuality"],
      maxQuality: map["maxQuality"],
      minDuration: map["minDuration"],
      maxDuration: map["maxDuration"],
      minFramesPerSecond: map["minFramesPerSecond"],
      maxFramesPerSecond: map["maxFramesPerSecond"],
      virtualReality: map["virtualReality"],
      categoriesInclude: map["categoriesInclude"],
      categoriesExclude: map["categoriesExclude"],
      keywordsInclude: map["keywordsInclude"],
      keywordsExclude: map["keywordsExclude"],
      historySearch: map["historySearch"],
    });
  }
}

class UniversalVideoPreview {
  constructor(opts = {}) {
    this.iD = opts.iD;
    this.title = opts.title;
    this.thumbnail = opts.thumbnail ?? null;
    this.thumbnailHttpHeaders = opts.thumbnailHttpHeaders ?? null;
    this.thumbnailBinary = opts.thumbnailBinary ?? new Uint8Array(0);
    this.previewVideo = opts.previewVideo ?? null;
    this.previewVideoHttpHeaders = opts.previewVideoHttpHeaders ?? null;
    this.duration = opts.duration ?? null;
    this.viewsTotal = opts.viewsTotal ?? null;
    this.ratingsPositivePercent = opts.ratingsPositivePercent ?? null;
    this.maxQuality = opts.maxQuality ?? null;
    this.virtualReality = opts.virtualReality ?? false;
    this.authorName = opts.authorName ?? null;
    this.authorID = opts.authorID ?? null;
    this.verifiedAuthor = opts.verifiedAuthor ?? false;
    this.lastWatched = opts.lastWatched ?? null;
    this.addedOn = opts.addedOn ?? null;
    this.unavailableFields = opts.unavailableFields ?? [];
    this.scrapeFailException = opts.scrapeFailException ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "title": this.title,
      "plugin": pluginCodeName,
      "thumbnail": this.thumbnail,
      "thumbnailHttpHeaders": this.thumbnailHttpHeaders,
      "thumbnailBinary": Array.from(this.thumbnailBinary || []),
      "previewVideo": this.previewVideo,
      "previewVideoHttpHeaders": this.previewVideoHttpHeaders,
      "duration": this.duration,
      "viewsTotal": this.viewsTotal,
      "ratingsPositivePercent": this.ratingsPositivePercent,
      "maxQuality": this.maxQuality,
      "virtualReality": this.virtualReality,
      "authorName": this.authorName,
      "authorID": this.authorID,
      "verifiedAuthor": this.verifiedAuthor,
      "lastWatched": convertToUnixTime(this.lastWatched),
      "addedOn": convertToUnixTime(this.addedOn),
      "unavailableFields": this.unavailableFields,
      "scrapeFailException": this.scrapeFailException?.toMap ? this.scrapeFailException.toMap() : null,
    };
  }
  static fromMap(map) {
    if (!map) return null;
    return new UniversalVideoPreview({
      iD: map["iD"],
      title: map["title"],
      thumbnail: map["thumbnail"],
      thumbnailHttpHeaders: map["thumbnailHttpHeaders"],
      thumbnailBinary: map["thumbnailBinary"] == null ? new Uint8Array(0) : Uint8Array.from(map["thumbnailBinary"]),
      previewVideo: map["previewVideo"],
      previewVideoHttpHeaders: map["previewVideoHttpHeaders"],
      duration: map["duration"],
      viewsTotal: map["viewsTotal"],
      ratingsPositivePercent: map["ratingsPositivePercent"],
      maxQuality: map["maxQuality"],
      virtualReality: map["virtualReality"],
      authorName: map["authorName"],
      authorID: map["authorID"],
      verifiedAuthor: map["verifiedAuthor"],
      lastWatched: tryParseFromUnixTime(map["lastWatched"]),
      addedOn: tryParseFromUnixTime(map["addedOn"]),
      unavailableFields: map["unavailableFields"],
      scrapeFailException: ScrapingException.fromMap(map["scrapeFailException"]),
    });
  }
}

class UniversalVideoMetadata {
  constructor(opts = {}) {
    this.iD = opts.iD;
    this.m3u8Uris = opts.m3u8Uris ?? {};
    this.playbackHttpHeaders = opts.playbackHttpHeaders ?? null;
    this.title = opts.title ?? "";
    this.universalVideoPreview = opts.universalVideoPreview ?? null;
    this.authorID = opts.authorID ?? null;
    this.authorName = opts.authorName ?? null;
    this.authorSubscriberCount = opts.authorSubscriberCount ?? null;
    this.authorAvatar = opts.authorAvatar ?? null;
    this.actors = opts.actors ?? null;
    this.description = opts.description ?? null;
    this.viewsTotal = opts.viewsTotal ?? null;
    this.tags = opts.tags ?? [];
    this.categories = opts.categories ?? [];
    this.uploadDate = opts.uploadDate ?? null;
    this.ratingsPositiveTotal = opts.ratingsPositiveTotal ?? null;
    this.ratingsNegativeTotal = opts.ratingsNegativeTotal ?? null;
    this.ratingsTotal = opts.ratingsTotal ?? null;
    this.virtualReality = opts.virtualReality ?? false;
    this.chapters = opts.chapters ?? null;
    this.rawHtml = opts.rawHtml ?? null;
    this.unavailableFields = opts.unavailableFields ?? [];
    this.scrapeFailException = opts.scrapeFailException ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "m3u8Uris": this.m3u8Uris,
      "playbackHttpHeaders": this.playbackHttpHeaders,
      "title": this.title,
      "plugin": pluginCodeName,
      "universalVideoPreview": this.universalVideoPreview?.toMap ? this.universalVideoPreview.toMap() : this.universalVideoPreview,
      "authorID": this.authorID,
      "authorName": this.authorName,
      "authorSubscriberCount": this.authorSubscriberCount,
      "authorAvatar": this.authorAvatar,
      "actors": this.actors == null ? null : this.actors.map((e) => ({
        "name": e.name,
        "authorID": e.authorID,
        "avatar": e.avatar,
      })),
      "description": this.description,
      "viewsTotal": this.viewsTotal,
      "tags": this.tags,
      "categories": this.categories,
      "uploadDate": convertToUnixTime(this.uploadDate),
      "ratingsPositiveTotal": this.ratingsPositiveTotal,
      "ratingsNegativeTotal": this.ratingsNegativeTotal,
      "ratingsTotal": this.ratingsTotal,
      "virtualReality": this.virtualReality,
      "chapters": this.chapters,
      "rawHtml": this.rawHtml,
      "unavailableFields": this.unavailableFields,
      "scrapeFailException": this.scrapeFailException?.toMap ? this.scrapeFailException.toMap() : null,
    };
  }
}

class UniversalAuthorPage {
  constructor(opts = {}) {
    this.iD = opts.iD ?? opts.authorID;
    this.authorID = opts.authorID ?? opts.iD;
    this.name = opts.name;
    this.avatar = opts.avatar ?? null;
    this.avatarHttpHeaders = opts.avatarHttpHeaders ?? null;
    this.banner = opts.banner ?? null;
    this.bannerHttpHeaders = opts.bannerHttpHeaders ?? null;
    this.subscriberCount = opts.subscriberCount ?? null;
    this.videoCount = opts.videoCount ?? null;
    this.biography = opts.biography ?? null;
    this.verified = opts.verified ?? false;
  }
  toMap() {
    return {
      "iD": this.iD,
      "authorID": this.authorID,
      "name": this.name,
      "avatar": this.avatar,
      "avatarHttpHeaders": this.avatarHttpHeaders,
      "banner": this.banner,
      "bannerHttpHeaders": this.bannerHttpHeaders,
      "subscriberCount": this.subscriberCount,
      "videoCount": this.videoCount,
      "biography": this.biography,
      "verified": this.verified,
    };
  }
}

class UniversalComment {
  constructor(opts = {}) {
    this.commentID = opts.commentID;
    this.authorName = opts.authorName;
    this.authorID = opts.authorID ?? null;
    this.authorAvatar = opts.authorAvatar ?? null;
    this.commentText = opts.commentText;
    this.date = opts.date ?? null;
    this.likes = opts.likes ?? null;
  }
  toMap() {
    return {
      "commentID": this.commentID,
      "authorName": this.authorName,
      "authorID": this.authorID,
      "authorAvatar": this.authorAvatar,
      "commentText": this.commentText,
      "date": convertToUnixTime(this.date),
      "likes": this.likes,
    };
  }
}

// ==== END: src/universal_formats.js ====

// ==== START: src/session.js ====
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

// ==== END: src/session.js ====

// ==== START: src/main.js ====
// XXXParodyHD Provider Plugin for Hedon Haven.
// Features multi-server embed resolution (LuluStream HLS, MixDrop MP4, StreamWish, VOE, DoodStream).

const PLUGIN_CODE_NAME = "com.hedonhaven.xxxparodyhd";
const XXXPARODYHD_BASE_URL = "https://xxxparodyhd.net";
const XXXPARODYHD_DEFAULT_ICON = "https://xxxparodyhd.net/wp-content/uploads/spt-brand/icon-192-da7c422f.png";

function getStatusCode(response) {
  if (!response) return 0;
  return Number(response.statusCode ?? response.status ?? 0);
}

async function init() {
  consoleLog("info", "XXXParodyHD plugin initialized successfully");
  return true;
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*38;/gi, "&")
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#8211;|&ndash;/gi, "-")
    .replace(/&#8212;|&mdash;/gi, "-")
    .replace(/&#8217;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = `https:${url}`;
  else if (url.startsWith("/")) url = `${XXXPARODYHD_BASE_URL}${url}`;
  // i*.wp.com Jetpack CDN serves JPEG/WebP even when path ends in .avif; preserve URL intact.
  return url;
}

function normalizeStreamUrl(value) {
  if (!value) return "";
  let url = String(value).trim().replace(/\\\//g, "/");
  if (url.startsWith("//")) url = `https:${url}`;
  return url;
}

function getOrigin(url) {
  const m = String(url || "").match(/^(https?:\/\/[^\/?#]+)/i);
  return m ? m[1] : XXXPARODYHD_BASE_URL;
}

function parseDuration(value) {
  const str = String(value || "").trim();
  if (!str) return 0;

  const iso = str.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (iso) {
    return Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0);
  }

  // Digital format "1:57:00" or "58:12"
  const colonMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (colonMatch) {
    if (colonMatch[3]) {
      return Number(colonMatch[1]) * 3600 + Number(colonMatch[2]) * 60 + Number(colonMatch[3]);
    }
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  let totalSecs = 0;
  const hMatch = str.match(/(\d+)\s*(?:h|hr|hours?)/i);
  const mMatch = str.match(/(\d+)\s*(?:min|mins?|m)/i);
  const sMatch = str.match(/(\d+)\s*(?:sec|secs?|s)/i);
  if (hMatch) totalSecs += Number(hMatch[1]) * 3600;
  if (mMatch) totalSecs += Number(mMatch[1]) * 60;
  if (sMatch) totalSecs += Number(sMatch[1]);
  return totalSecs;
}

function parseCompactCount(value) {
  const str = String(value || "").trim().replace(/,/g, "");
  if (!str) return 0;
  const match = str.match(/^(\d+(?:\.\d+)?)\s*([KMBkmb])?/);
  if (!match) {
    return Number.parseInt(str.replace(/[^\d]/g, ""), 10) || 0;
  }
  const num = Number.parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "K") return Math.round(num * 1000);
  if (suffix === "M") return Math.round(num * 1000000);
  if (suffix === "B") return Math.round(num * 1000000000);
  return Math.round(num);
}

function extractMovieSlugFromUrl(url) {
  if (!url) return "";
  const clean = String(url).split("?")[0].split("#")[0].replace(/\/+$/, "");
  const m = clean.match(/xxxparodyhd\.net\/([^\/]+)$/i) || clean.match(/\/([^\/]+)$/);
  if (!m) return "";
  const slug = m[1];
  if (["movies", "most-viewed", "most-rating", "parody-pornstars", "parody-studios", "parody-genres", "parody-years", "parody-directors", "parody-a-z"].includes(slug)) {
    return "";
  }
  return slug;
}

function parseVideosFromHtml(htmlBody) {
  const text = String(htmlBody || "");
  const videos = [];
  const seen = new Set();

  // Primary: <article class="card">...</article>
  const cardParts = text.split(/<article\s+class="card">/i);
  for (let i = 1; i < cardParts.length; i++) {
    const chunk = cardParts[i].split(/<\/article>/i)[0];

    const linkMatch =
      chunk.match(/<h3\s+class="card__t"[^>]*>\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
      chunk.match(/<a\s+class="card__th"\s+href="([^"]+)"/i);
    if (!linkMatch) continue;

    const id = extractMovieSlugFromUrl(linkMatch[1]);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const altMatch = chunk.match(/alt="(?:Watch\s+)?([^"]+?)(?:\s+Porn Online Free)?"/i);
    const title = linkMatch[2] ? cleanText(linkMatch[2]) : (altMatch ? cleanText(altMatch[1]) : `Movie ${id}`);

    const thumbMatch = chunk.match(/<img\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(thumbMatch ? thumbMatch[1] : "") || XXXPARODYHD_DEFAULT_ICON;

    const durMatch = chunk.match(/<span\s+class="card__dur"[^>]*>([^<]+)<\/span>/i);
    const duration = durMatch ? parseDuration(durMatch[1]) : null;

    const viewsMatch = chunk.match(/<span\s+class="m-v"[^>]*>[\s\S]*?<\/svg>\s*([\d,KMBkmb\.]+)/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    const dirMatch = chunk.match(/<a\s+class="card__tx"\s+href="[^"]*\/(director|pornstar)\/([^"\/?#]+)\/"(?:\s+title="([^"]*)")?/i);
    const byMatch = chunk.match(/<span\s+class="card__by"[^>]*>([^<]+)<\/span>/i);
    const authorID = dirMatch ? `${dirMatch[1]}/${dirMatch[2]}` : "xxxparodyhd";
    const authorName = dirMatch
      ? cleanText(dirMatch[3] || dirMatch[2])
      : (byMatch ? cleanText(byMatch[1]) : "XXXParodyHD");

    const qMatch = chunk.match(/<span\s+class="card__q"[^>]*>([^<]+)<\/span>/i);
    const maxQuality = qMatch && /4K/i.test(qMatch[1]) ? 2160 : 1080;

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        duration,
        viewsTotal,
        maxQuality,
        authorID,
        authorName,
        verifiedAuthor: authorID !== "xxxparodyhd",
      })
    );
  }

  return videos;
}

// Pure-JS Dean Edwards P.A.C.K.E.R. unpacker for MixDrop / LuluStream / StreamWish / Filemoon
function unpackPackerScripts(html) {
  const results = [];
  const source = String(html || "");
  let idx = 0;

  while ((idx = source.indexOf("eval(function(p,a,c,k,e,", idx)) !== -1) {
    let depth = 0;
    let i = idx + 4; // starts at '('
    let inStr = null;
    let esc = false;

    for (; i < source.length; i++) {
      const ch = source[i];
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\") {
        esc = true;
        continue;
      }
      if (inStr) {
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === "`") {
        inStr = ch;
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }

    const callExpr = source.slice(idx, i);
    if (callExpr.startsWith("eval(")) {
      try {
        const rewritten = "__capture(" + callExpr.slice(5);
        let captured = "";
        const runner = new Function("__capture", rewritten);
        runner((code) => {
          captured = String(code || "");
          return captured;
        });
        if (captured) results.push(captured);
      } catch (err) {
        consoleLog("warning", `Packer unpack skipped: ${err.message}`);
      }
    }
    idx = i;
  }

  return results;
}

async function resolveEmbedServer(server) {
  const url = normalizeStreamUrl(server?.u || "");
  const label = String(server?.l || server?.x || "Server").trim();
  const slug = String(server?.x || label || "").toLowerCase();
  if (!url) return null;

  try {
    const origin = getOrigin(url);
    const res = await xxxparodyhdRequest(url, {
      "Referer": `${XXXPARODYHD_BASE_URL}/`,
    });
    const status = getStatusCode(res);
    if (status !== 200 || !res.body) {
      consoleLog("warning", `Server ${label} returned HTTP ${status}`);
      return null;
    }

    const html = res.body;

    // 1. Check VOE meta/JS redirect if present
    if (slug.includes("voe") || /voe\.sx/i.test(url)) {
      const redirMatch = html.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i);
      if (redirMatch && redirMatch[1]) {
        const redirRes = await xxxparodyhdRequest(redirMatch[1], { "Referer": url });
        if (getStatusCode(redirRes) === 200 && redirRes.body) {
          const b64HlsMatch = redirRes.body.match(/['"]hls['"]\s*:\s*['"]([A-Za-z0-9+/=]{20,})['"]/i);
          if (b64HlsMatch) {
            const decoded = xxxparodyhdDecodeBase64Utf8(b64HlsMatch[1]);
            if (/^https?:\/\//i.test(decoded)) {
              return { url: decoded, referer: `${getOrigin(redirMatch[1])}/`, label, kind: "m3u8" };
            }
          }
          const directVoe = redirRes.body.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
          if (directVoe) {
            return { url: directVoe[0], referer: `${getOrigin(redirMatch[1])}/`, label, kind: "m3u8" };
          }
        }
      }
    }

    // 2. Unpack any P.A.C.K.E.R. blocks (LuluStream, MixDrop, StreamWish, Filemoon, VidHide)
    const unpacked = unpackPackerScripts(html);
    const combined = unpacked.length > 0 ? `${unpacked.join("\n")}\n${html}` : html;

    // MixDrop: MDCore.wurl="//30xplewoo.mxcontent.net/v2/...mp4?..."
    const wurlMatch = combined.match(/MDCore\.wurl\s*=\s*["']([^"']+)["']/i);
    if (wurlMatch && wurlMatch[1]) {
      const streamUrl = normalizeStreamUrl(wurlMatch[1]);
      if (streamUrl.startsWith("http")) {
        return { url: streamUrl, referer: `${origin}/`, label, kind: "mp4" };
      }
    }

    // LuluStream / JWPlayer / StreamWish / Filemoon: sources:[{file:"https://...m3u8..."}]
    const jwFileMatch =
      combined.match(/sources\s*:\s*\[\s*\{[^}]*?file\s*:\s*["'](https?:\/\/[^"']+)["']/i) ||
      combined.match(/file\s*:\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
    if (jwFileMatch && jwFileMatch[1]) {
      const streamUrl = normalizeStreamUrl(jwFileMatch[1]);
      return {
        url: streamUrl,
        referer: `${origin}/`,
        label,
        kind: streamUrl.includes(".m3u8") ? "m3u8" : "mp4",
      };
    }

    // Direct .m3u8 anywhere in unpacked/HTML (skip tracking/ad false positives)
    const m3u8Match = combined.match(/https?:\/\/[^"'\s<>\\]+\.m3u8(?:[^"'\s<>\\]*)/i);
    if (m3u8Match && m3u8Match[0]) {
      const streamUrl = normalizeStreamUrl(m3u8Match[0]);
      return { url: streamUrl, referer: `${origin}/`, label, kind: "m3u8" };
    }

    // Direct .mp4 anywhere in unpacked/HTML
    const mp4Match = combined.match(/(?:https?:)?\/\/[^"'\s<>\\]+\.mp4(?:[^"'\s<>\\]*)/i);
    if (mp4Match && mp4Match[0] && !/banner|ads|promo|preview/i.test(mp4Match[0])) {
      const streamUrl = normalizeStreamUrl(mp4Match[0]);
      if (streamUrl.startsWith("http")) {
        return { url: streamUrl, referer: `${origin}/`, label, kind: "mp4" };
      }
    }

    // DoodStream / Playmogo fallback: /pass_md5/...
    const passMatch = html.match(/['"](\/pass_md5\/[^'"]+)['"]/i);
    if (passMatch && passMatch[1]) {
      const passUrl = `${origin}${passMatch[1]}`;
      const passRes = await xxxparodyhdRequest(passUrl, { "Referer": url });
      if (getStatusCode(passRes) === 200 && passRes.body && passRes.body.startsWith("http")) {
        const token = passMatch[1].split("/").pop() || "token";
        const suffix = "abcdefghij?token=" + token + "&expiry=" + Date.now();
        return { url: `${passRes.body}${suffix}`, referer: `${origin}/`, label, kind: "mp4" };
      }
    }

    return null;
  } catch (err) {
    consoleLog("warning", `Server ${label} resolve error: ${err.message}`);
    return null;
  }
}

function getServerPriority(server) {
  const x = String(server?.x || server?.l || "").toLowerCase();
  const u = String(server?.u || "").toLowerCase();
  if (x.includes("lulu") || u.includes("lulu")) return 1;
  if (x.includes("mixdrop") || u.includes("mixdrop") || u.includes("mxdrop")) return 2;
  if (x.includes("wish") || x.includes("filemoon") || x.includes("vidhide")) return 3;
  if (x.includes("voe") || u.includes("voe")) return 4;
  if (x.includes("dood") || u.includes("playmogo")) return 5;
  return 6;
}

async function resolveAllServers(servers) {
  if (!Array.isArray(servers) || servers.length === 0) return [];
  const sorted = [...servers].sort((a, b) => getServerPriority(a) - getServerPriority(b));

  // First try top 3 highest-reliability servers concurrently (typically LuluStream + MixDrop)
  const primaryBatch = sorted.slice(0, 3);
  const primaryResolved = (await Promise.all(primaryBatch.map(resolveEmbedServer))).filter(Boolean);
  if (primaryResolved.length > 0) {
    return primaryResolved;
  }

  // Fallback to remaining servers if primary batch yielded no playable streams
  const secondaryBatch = sorted.slice(3, 7);
  if (secondaryBatch.length === 0) return [];
  return (await Promise.all(secondaryBatch.map(resolveEmbedServer))).filter(Boolean);
}

async function runFunctionalityTest() {
  consoleLog("info", "Starting XXXParodyHD plugin functionality test...");
  try {
    const homeResponse = await xxxparodyhdRequest(`${XXXPARODYHD_BASE_URL}/`);
    if (getStatusCode(homeResponse) !== 200) {
      consoleLog("error", `XXXParodyHD home returned status ${getStatusCode(homeResponse)}`);
      return false;
    }

    const videos = parseVideosFromHtml(homeResponse.body);
    if (!videos || videos.length === 0) {
      consoleLog("error", "No movies parsed from XXXParodyHD homepage");
      return false;
    }

    const sample = videos[0];
    const metadata = await getVideoMetadata(sample.iD, sample);
    if (!metadata || !metadata.m3u8Uris || Object.keys(metadata.m3u8Uris).length === 0) {
      consoleLog("error", `Failed to resolve stream servers for ${sample.iD}`);
      return false;
    }

    consoleLog("info", `XXXParodyHD functionality test passed! Streams: ${Object.keys(metadata.m3u8Uris).join(", ")}`);
    return true;
  } catch (err) {
    consoleLog("error", `Functionality test error: ${err.message}`);
    return false;
  }
}

function parseExternalLink(uriString) {
  try {
    const str = String(uriString || "").trim();
    if (!str) return new ExternalLinkParsed({ type: "unknown" });

    const dirMatch = str.match(/\/(director|pornstar)\/([^\/?#]+)/i);
    if (dirMatch) {
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: `${dirMatch[1].toLowerCase()}/${dirMatch[2]}`,
      });
    }

    const searchMatch = str.match(/\/search\/([^\/?#]+)/i) || str.match(/[?&]s=([^&#]+)/i);
    if (searchMatch) {
      const pageMatch = str.match(/\/page\/(\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(searchMatch[1].replace(/\+/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 1,
      });
    }

    const genreMatch = str.match(/\/(?:genre|category)\/([^\/?#]+)/i);
    if (genreMatch) {
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(genreMatch[1].replace(/-/g, " ")),
        }),
        pageCount: 1,
      });
    }

    const movieSlug = extractMovieSlugFromUrl(str);
    if (movieSlug) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: movieSlug,
      });
    }

    return new ExternalLinkParsed({ type: "unknown" });
  } catch (err) {
    consoleLog("error", `parseExternalLink error: ${err.message}`);
    return new ExternalLinkParsed({ type: "unknown" });
  }
}

async function getHomePage(page) {
  try {
    const pageNum = Number.parseInt(page || 1, 10);
    const url = pageNum <= 1 ? `${XXXPARODYHD_BASE_URL}/` : `${XXXPARODYHD_BASE_URL}/page/${pageNum}/`;
    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getHomePage returned status ${getStatusCode(response)}`);
      return [];
    }
    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", `getHomePage error: ${err.message}`);
    return [];
  }
}

async function getSearchSuggestions(searchString) {
  try {
    const q = String(searchString || "").trim();
    if (q.length < 2) return [];
    const response = await xxxparodyhdRequest(
      `${XXXPARODYHD_BASE_URL}/wp-json/turbosearch/v1/suggest?q=${encodeURIComponent(q)}`,
      { "Accept": "application/json" }
    );
    if (getStatusCode(response) !== 200 || !response.body) return [];
    const data = JSON.parse(response.body);
    if (data && Array.isArray(data.posts)) {
      return data.posts
        .map((p) => (p && p.title ? cleanText(p.title) : ""))
        .filter(Boolean);
    }
    return [];
  } catch (_) {
    return [];
  }
}

async function getSearchResults(request, page) {
  try {
    const pageNum = Number.parseInt(page || 1, 10);
    const query = String(request?.searchString || "").trim();
    // NOTE: ?s=... returns 403 WAF; /search/<query>/ returns 200 cleanly.
    const url = query
      ? (pageNum <= 1
          ? `${XXXPARODYHD_BASE_URL}/search/${encodeURIComponent(query)}/`
          : `${XXXPARODYHD_BASE_URL}/search/${encodeURIComponent(query)}/page/${pageNum}/`)
      : (pageNum <= 1
          ? `${XXXPARODYHD_BASE_URL}/most-viewed/`
          : `${XXXPARODYHD_BASE_URL}/most-viewed/page/${pageNum}/`);

    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getSearchResults returned status ${getStatusCode(response)}`);
      return [];
    }
    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", `getSearchResults error: ${err.message}`);
    return [];
  }
}

function getVideoUriFromID(videoID) {
  const cleanId = String(videoID || "").trim().replace(/^\/+|\/+$/g, "");
  return `${XXXPARODYHD_BASE_URL}/${cleanId}/`;
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getVideoMetadata returned status ${getStatusCode(response)} for ${videoId}`);
      return null;
    }

    const html = response.body;

    // 1. Title
    const titleMatch =
      html.match(/<h1\s+class="vid__t[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const title = titleMatch
      ? cleanText(titleMatch[1]).replace(/\s*-\s*XXX Parody$/i, "")
      : (uvp?.title || `Movie ${videoId}`);

    // 2. Parse multi-server data-servers JSON and resolve playable streams (.m3u8 / .mp4)
    let servers = [];
    const dsMatch = html.match(/data-servers="([^"]+)"/i);
    if (dsMatch && dsMatch[1]) {
      try {
        const jsonText = decodeHtmlEntities(dsMatch[1]).replace(/\\\//g, "/");
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) servers = parsed;
      } catch (jsonErr) {
        consoleLog("warning", `Failed to parse data-servers JSON: ${jsonErr.message}`);
      }
    }

    const resolvedStreams = await resolveAllServers(servers);
    const m3u8Uris = {};
    const qualityKeys = ["1080", "720", "480", "360"];
    const usedUrls = new Set();

    // Sort resolved streams preferring HLS (.m3u8) first, then MP4
    resolvedStreams.sort((a, b) => (a.kind === "m3u8" ? 0 : 1) - (b.kind === "m3u8" ? 0 : 1));
    let qIdx = 0;
    for (const st of resolvedStreams) {
      if (!st || !st.url || usedUrls.has(st.url) || qIdx >= qualityKeys.length) continue;
      usedUrls.add(st.url);
      m3u8Uris[qualityKeys[qIdx++]] = st.url;
    }

    const primaryReferer = resolvedStreams[0]?.referer || `${XXXPARODYHD_BASE_URL}/`;

    // 3. Thumbnail
    const thumbMatch =
      html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
      html.match(/<img\s+class="card__img"\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(thumbMatch ? thumbMatch[1] : (uvp?.thumbnail || "")) || XXXPARODYHD_DEFAULT_ICON;

    // 4. Studio (author) & Pornstars (actors)
    const studioMatch = html.match(/<b>Studio<\/b>[\s\S]*?<a\s+class="chip"\s+href="[^"]*\/director\/([^"\/?#]+)\/">([^<]+)<\/a>/i);
    const safeAuthorID = studioMatch ? `director/${studioMatch[1]}` : (uvp?.authorID || "xxxparodyhd");
    const safeAuthorName = studioMatch ? cleanText(studioMatch[2]) : (uvp?.authorName || "XXXParodyHD");
    const authorAvatar = thumbnail || XXXPARODYHD_DEFAULT_ICON;

    const actors = [];
    const starSectionMatch = html.match(/<b>Pornstars<\/b>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
    if (starSectionMatch) {
      const starRegex = /<a\s+class="chip\s+chip--star"\s+href="[^"]*\/pornstar\/([^"\/?#]+)\/">([^<]+)<\/a>/gi;
      let sm;
      while ((sm = starRegex.exec(starSectionMatch[1])) !== null) {
        actors.push({
          name: cleanText(sm[2]),
          authorID: `pornstar/${sm[1]}`,
          avatar: authorAvatar,
        });
      }
    }

    // 5. Description, Views, Duration, Release Date
    const descMatch = html.match(/<div\s+class="desc">([\s\S]*?)<\/div>/i);
    const description = descMatch ? cleanText(descMatch[1]) : null;

    const viewsMatch = html.match(/data-views[^>]*>([\d,KMBkmb\.]+)</i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : (uvp?.viewsTotal ?? null);

    const durMatch = html.match(/st--duration"[^>]*>[\s\S]*?<\/svg>([^<]+)<\/span>/i);
    const duration = durMatch ? parseDuration(durMatch[1]) : (uvp?.duration ?? null);

    const dateMatch = html.match(/st--date"[^>]*>[\s\S]*?<time\s+datetime="([^"]+)"/i);
    let uploadDate = null;
    if (dateMatch && dateMatch[1]) {
      const d = new Date(dateMatch[1]);
      if (!Number.isNaN(d.getTime())) uploadDate = d;
    }

    // 6. Genres & Category
    const categories = [];
    const tags = [];
    const genreRegex = /<a\s+class="chip"\s+href="[^"]*\/genre\/[^"]+">([^<]+)<\/a>/gi;
    let gm;
    while ((gm = genreRegex.exec(html)) !== null) {
      const val = cleanText(gm[1]);
      if (val && !genresAlready(tags, val)) tags.push(val);
    }
    const catRegex = /<a\s+class="chip"\s+href="[^"]*\/category\/[^"]+">([^<]+)<\/a>/gi;
    let cm;
    while ((cm = catRegex.exec(html)) !== null) {
      const val = cleanText(cm[1]);
      if (val && !categories.includes(val)) categories.push(val);
    }
    if (categories.length === 0 && tags.length > 0) {
      categories.push(...tags.slice(0, 4));
    }

    return new UniversalVideoMetadata({
      iD: videoId,
      m3u8Uris,
      playbackHttpHeaders: {
        "Referer": primaryReferer,
        "User-Agent": XXXPARODYHD_USER_AGENT,
      },
      title,
      authorID: safeAuthorID,
      authorName: safeAuthorName,
      authorAvatar,
      actors: actors.length > 0 ? actors : null,
      description,
      viewsTotal,
      tags,
      categories,
      uploadDate,
      rawHtml: html,
      universalVideoPreview: uvp || new UniversalVideoPreview({
        iD: videoId,
        title,
        thumbnail,
        duration,
        viewsTotal,
        maxQuality: 1080,
        authorID: safeAuthorID,
        authorName: safeAuthorName,
        verifiedAuthor: safeAuthorID !== "xxxparodyhd",
      }),
    });
  } catch (err) {
    consoleLog("error", `getVideoMetadata error: ${err.message}`);
    return null;
  }
}

function genresAlready(list, value) {
  return list.includes(value);
}

async function getVideoSuggestions(videoID, rawHtml, page) {
  try {
    if (Number(page) > 0) return [];
    let html = rawHtml;
    if (!html) {
      const response = await xxxparodyhdRequest(getVideoUriFromID(videoID));
      if (getStatusCode(response) !== 200) return [];
      html = response.body;
    }

    const relIdx = html.indexOf("Related Movies");
    const sectionHtml = relIdx >= 0 ? html.slice(relIdx) : html;
    return parseVideosFromHtml(sectionHtml).filter((v) => v.iD !== videoID);
  } catch (err) {
    consoleLog("warning", `getVideoSuggestions error: ${err.message}`);
    return [];
  }
}

function getAuthorUriFromID(authorID) {
  const cleanId = String(authorID || "").trim().replace(/^\/+|\/+$/g, "");
  if (!cleanId || cleanId === "xxxparodyhd") {
    return `${XXXPARODYHD_BASE_URL}/`;
  }
  if (cleanId.startsWith("director/") || cleanId.startsWith("pornstar/")) {
    return `${XXXPARODYHD_BASE_URL}/${cleanId}/`;
  }
  return `${XXXPARODYHD_BASE_URL}/director/${encodeURIComponent(cleanId)}/`;
}

async function getAuthorPage(authorID) {
  try {
    const cleanId = String(authorID || "").trim() || "xxxparodyhd";
    if (cleanId === "xxxparodyhd") {
      return new UniversalAuthorPage({
        iD: "xxxparodyhd",
        authorID: "xxxparodyhd",
        name: "XXXParodyHD",
        avatar: XXXPARODYHD_DEFAULT_ICON,
        verified: true,
      });
    }

    const url = getAuthorUriFromID(cleanId);
    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getAuthorPage returned status ${getStatusCode(response)} for ${cleanId}`);
      return null;
    }

    const html = response.body;
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const name = h1Match ? cleanText(h1Match[1]).replace(/\s+Parodies$|\s+Parody Roles$/i, "") : cleanId;

    const videos = parseVideosFromHtml(html);
    const avatar = (videos[0] && videos[0].thumbnail) ? videos[0].thumbnail : XXXPARODYHD_DEFAULT_ICON;

    return new UniversalAuthorPage({
      iD: cleanId,
      authorID: cleanId,
      name,
      avatar,
      banner: videos[1]?.thumbnail || avatar,
      videoCount: videos.length || null,
      verified: true,
    });
  } catch (err) {
    consoleLog("error", `getAuthorPage error: ${err.message}`);
    return null;
  }
}

async function getAuthorVideos(authorID, rawHtmlOrPage, maybePage) {
  try {
    let pageNum = 1;
    if (typeof maybePage !== "undefined") {
      pageNum = Number.parseInt(maybePage || 1, 10);
    } else {
      pageNum = Number.parseInt(rawHtmlOrPage || 1, 10);
    }
    if (Number.isNaN(pageNum) || pageNum < 1) pageNum = 1;

    const cleanId = String(authorID || "").trim() || "xxxparodyhd";
    const base = getAuthorUriFromID(cleanId);
    const url = pageNum <= 1 ? base : `${base}page/${pageNum}/`;

    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) return [];
    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", `getAuthorVideos error: ${err.message}`);
    return [];
  }
}

async function downloadThumbnail(uri, thumbnailHttpHeaders) {
  const isLegacy = xxxparodyhdSession.isLegacyBase64Host !== false;
  try {
    if (!uri) return isLegacy ? "" : [];
    const response = await xxxparodyhdRequest(uri, thumbnailHttpHeaders || {}, { binary: true });
    if (getStatusCode(response) === 200) {
      if (response.isLegacyBase64Host) {
        return response.rawBodyBase64 || "";
      }
      if (Array.isArray(response.bodyBytes)) {
        return response.bodyBytes;
      }
      return [];
    }
    consoleLog("warning", `downloadThumbnail failed with status ${getStatusCode(response)} for ${uri}`);
    return response.isLegacyBase64Host ? "" : [];
  } catch (err) {
    consoleLog("warning", `downloadThumbnail error: ${err.message}`);
    return isLegacy ? "" : [];
  }
}

function cancelGetProgressThumbnails() {}

async function getProgressThumbnails(videoID, rawHtml) {
  return [];
}

async function getComments(videoID, rawHtml, page) {
  return [];
}

// ==== END: src/main.js ====

// ==== START: src/wrapper.js ====
// Hedon Haven JavaScript bridge wrapper.
// Translates between Universal* object instances and plain Map dictionaries.

const _parseExternalLink = parseExternalLink;
const _getHomePage = getHomePage;
const _getSearchResults = getSearchResults;
const _getVideoMetadata = getVideoMetadata;
const _getComments = getComments;
const _getVideoSuggestions = getVideoSuggestions;
const _getAuthorPage = getAuthorPage;
const _getAuthorVideos = getAuthorVideos;

globalThis.init = init;
globalThis.runFunctionalityTest = runFunctionalityTest;
globalThis.getVideoUriFromID = getVideoUriFromID;
globalThis.getAuthorUriFromID = getAuthorUriFromID;
globalThis.getSearchSuggestions = getSearchSuggestions;
globalThis.downloadThumbnail = downloadThumbnail;
globalThis.cancelGetProgressThumbnails = cancelGetProgressThumbnails;
globalThis.getProgressThumbnails = getProgressThumbnails;

globalThis.parseExternalLink = async (uri) => {
  const result = await _parseExternalLink(uri);
  return result?.toMap ? result.toMap() : result;
};

globalThis.getHomePage = async (page) => {
  const list = await _getHomePage(page);
  return Array.isArray(list) ? list.map((e) => (e?.toMap ? e.toMap() : e)) : [];
};

globalThis.getSearchResults = async (req, page) => {
  const parsedReq = req?.toMap ? req : UniversalSearchRequest.fromMap(req);
  const list = await _getSearchResults(parsedReq, page);
  return Array.isArray(list) ? list.map((e) => (e?.toMap ? e.toMap() : e)) : [];
};

globalThis.getVideoMetadata = async (id, uvp) => {
  const parsedUvp = uvp?.toMap ? uvp : uvp ? UniversalVideoPreview.fromMap(uvp) : null;
  const result = await _getVideoMetadata(id, parsedUvp);
  return result?.toMap ? result.toMap() : result;
};

globalThis.getComments = async (vid, raw, page) => {
  const list = await _getComments(vid, raw, page);
  return Array.isArray(list) ? list.map((e) => (e?.toMap ? e.toMap() : e)) : [];
};

globalThis.getVideoSuggestions = async (vid, raw, page) => {
  const list = await _getVideoSuggestions(vid, raw, page);
  return Array.isArray(list) ? list.map((e) => (e?.toMap ? e.toMap() : e)) : [];
};

globalThis.getAuthorPage = async (id) => {
  const result = await _getAuthorPage(id);
  return result?.toMap ? result.toMap() : result;
};

globalThis.getAuthorVideos = async (id, raw, page) => {
  const list = await _getAuthorVideos(id, raw, page);
  return Array.isArray(list) ? list.map((e) => (e?.toMap ? e.toMap() : e)) : [];
};

// ==== END: src/wrapper.js ====

