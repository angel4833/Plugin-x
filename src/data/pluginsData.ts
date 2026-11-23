import { PluginDefinition } from '../utils/pluginBundler';

export const xvideosPluginDef: PluginDefinition = {
  id: 'xvideos',
  name: 'XVideos',
  codeName: 'com.hedonhaven.xvideos',
  version: 'v0.1.0',
  serviceUrl: 'https://www.xvideos.com',
  description: 'XVideos provider plugin for Hedon Haven featuring HLS and MP4 multi-resolution playback, video search, home feed, and creator channels.',
  yamlContent: `apiVersion: 1.0
metadata:
  codeName: "com.hedonhaven.xvideos"
  prettyName: "XVideos"
  version: v0.1.0
  developer: "Hedon Haven Community"
  contactEmail: "contact@hedon-haven.top"
  issueTrackerUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/issues"
  description: "XVideos provider plugin for Hedon Haven featuring HLS/MP4 streams, channel catalogs, video previews, and search."
  updateUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/update.yaml"
providerData:
  iconUrl: "https://www.xvideos.com/favicon.ico"
  serviceUrl: "https://www.xvideos.com"
  handleUrls:
    - "https://www.xvideos.com/"
    - "https://www.xvideos.com/video"
    - "https://www.xvideos.com/channels/"
    - "https://www.xvideos.com/profiles/"
initialPageCounts:
  initialHomePage: 0
  initialSearchResultsPage: 0
  initialCommentsPage: 0
  initialVideoSuggestionsPage: 0
  initialAuthorVideosPage: 0`,
  updateYamlContent: `version: v0.1.0
downloadUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/plugin.zip"
sha256Sum: "calculate_on_release"
changelog:
  - Initial release of XVideos provider plugin for Hedon Haven
  - Support for HLS and MP4 multi-resolution playback streams
  - Homepage browsing, pagination, and video previews
  - Search integration with relevance ranking
  - Channel / Creator pages and catalog loading
  - Embedded related video extraction`,
  sourceFiles: {
    bridge: `/// Host bridge functions for Hedon Haven QuickJS runtime.

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
}`,
    universal: `// Universal formats schemas for Hedon Haven Dart <-> QuickJS bridge.
const pluginCodeName = "com.hedonhaven.xvideos";

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
  if (dateTime instanceof Date) return Math.floor(dateTime.getTime() / 1000);
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
}`,
    session: `// Session and HTTP response normalization for XVideos plugin.

const xvideosSession = {
  cookies: {},
  isLegacyBase64Host: null,
};

const XVIDEOS_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function xvideosCookieHeader() {
  return Object.keys(xvideosSession.cookies)
    .map((key) => \`\${key}=\${xvideosSession.cookies[key]}\`)
    .join("; ");
}

function xvideosDefaultHeaders(extraHeaders = {}) {
  const headers = {
    "User-Agent": XVIDEOS_USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.xvideos.com/",
    ...extraHeaders,
  };
  const cookie = xvideosCookieHeader();
  if (cookie && !headers.Cookie) {
    headers.Cookie = cookie;
  }
  return headers;
}

function xvideosRememberCookies(headers) {
  if (!headers) return;
  const raw = headers["set-cookie"] || headers["Set-Cookie"] || "";
  const values = Array.isArray(raw) ? raw : [raw];
  for (const value of values) {
    if (!value) continue;
    const match = String(value).match(/^\\s*([^=;]+)=([^;]*)/);
    if (match) xvideosSession.cookies[match[1]] = match[2];
  }
}

function xvideosDecodeBase64Bytes(base64Str) {
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

function xvideosBytesToUtf8(bytes) {
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

function xvideosDecodeBase64Utf8(base64Str) {
  if (!base64Str) return "";
  return xvideosBytesToUtf8(xvideosDecodeBase64Bytes(base64Str));
}

function xvideosNormalizeResponse(response, options = {}) {
  if (!response || typeof response !== "object") {
    return {
      statusCode: 0,
      status: 0,
      headers: {},
      body: "",
      bodyBytes: [],
      rawBodyBase64: "",
      isLegacyBase64Host: Boolean(xvideosSession.isLegacyBase64Host),
    };
  }

  const isLegacyBase64Host =
    typeof response.statusCode === "undefined" &&
    typeof response.status !== "undefined" &&
    !Array.isArray(response.bodyBytes);

  xvideosSession.isLegacyBase64Host = isLegacyBase64Host;
  const statusCode = Number(response.statusCode ?? response.status ?? 0);

  if (isLegacyBase64Host) {
    const rawBodyBase64 = typeof response.body === "string" ? response.body : "";
    const decodedBody = options.binary ? "" : xvideosDecodeBase64Utf8(rawBodyBase64);
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

async function xvideosRequest(url, headers = {}, options = {}) {
  const requestHeaders = xvideosDefaultHeaders(headers);
  const rawResponse = await httpRequest(url, requestHeaders);
  if (rawResponse && rawResponse.headers) {
    xvideosRememberCookies(rawResponse.headers);
  }
  return xvideosNormalizeResponse(rawResponse, options);
}`,
    main: `// XVideos Provider Plugin for Hedon Haven.
const PLUGIN_CODE_NAME = "com.hedonhaven.xvideos";

function getStatusCode(response) {
  if (!response) return 0;
  return Number(response.statusCode ?? response.status ?? 0);
}

async function init() {
  consoleLog("info", "XVideos plugin initialized successfully");
  return true;
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&excl;/gi, "!")
    .replace(/&lpar;/gi, "(")
    .replace(/&rpar;/gi, ")")
    .replace(/&hellip;/gi, "...")
    .replace(/\\s+/g, " ")
    .trim();
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = "https:" + url;
  else if (url.startsWith("/")) url = "https://www.xvideos.com" + url;
  return url.replace(/\\.avif(\\?.*)?$|\\.webp(\\?.*)?$/i, ".jpg$1$2");
}

function parseDuration(value) {
  const str = String(value || "").trim();
  if (!str) return 0;
  
  const iso = str.match(/^PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?$/i);
  if (iso) {
    return (Number(iso[1] || 0) * 3600) + (Number(iso[2] || 0) * 60) + Number(iso[3] || 0);
  }

  let totalSecs = 0;
  const hoursMatch = str.match(/(\\d+)\\s*(?:h|hr|hours?)/i);
  const minsMatch = str.match(/(\\d+)\\s*(?:min|mins?|m)/i);
  const secsMatch = str.match(/(\\d+)\\s*(?:sec|secs?|s)/i);

  if (hoursMatch) totalSecs += Number(hoursMatch[1]) * 3600;
  if (minsMatch) totalSecs += Number(minsMatch[1]) * 60;
  if (secsMatch) totalSecs += Number(secsMatch[1]);

  if (totalSecs > 0) return totalSecs;

  const colonMatch = str.match(/(\\d{1,2}):(\\d{2})(?::(\\d{2}))?/);
  if (colonMatch) {
    if (colonMatch[3]) {
      return Number(colonMatch[1]) * 3600 + Number(colonMatch[2]) * 60 + Number(colonMatch[3]);
    }
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  return 0;
}

function parseCompactCount(value) {
  const str = String(value || "").trim().replace(/,/g, "");
  if (!str) return 0;
  const match = str.match(/^(\\d+(?:\\.\\d+)?)\\s*([KMBkmb])?/);
  if (!match) {
    return Number.parseInt(str.replace(/[^\\d]/g, ""), 10) || 0;
  }
  const num = Number.parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "K") return Math.round(num * 1000);
  if (suffix === "M") return Math.round(num * 1000000);
  if (suffix === "B") return Math.round(num * 1000000000);
  return Math.round(num);
}

function parseVideosFromHtml(htmlBody) {
  const text = String(htmlBody || "");
  const videos = [];

  const blockRegex = /<div\\s+[^>]*?id="video_([^"]+)"[^>]*>([\\s\\S]*?)<\\/script>\\s*<\\/div>/gi;
  let match;

  while ((match = blockRegex.exec(text)) !== null) {
    const rawEid = match[1];
    const blockContent = match[2];

    const dataIdMatch = blockContent.match(/data-id="(\\d+)"/) || match[0].match(/data-id="(\\d+)"/);
    const id = rawEid || (dataIdMatch ? dataIdMatch[1] : "");
    if (!id) continue;

    const titleMatch =
      blockContent.match(/<p\\s+class="title"[^>]*>\\s*<a\\s+[^>]*?title="([^"]+)"/i) ||
      blockContent.match(/<p\\s+class="title"[^>]*>\\s*<a[^>]*>([\\s\\S]*?)<\\/a>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : "Video " + id;

    const thumbMatch =
      blockContent.match(/data-src="([^"]+)"/i) ||
      blockContent.match(/src="([^"]+)"/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : "";

    const pvvMatch = blockContent.match(/data-pvv="([^"]+)"/i);
    const previewVideo = pvvMatch ? pvvMatch[1] : null;

    const durationMatch = blockContent.match(/class="duration"[^>]*>([^<]+)<\\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : 0;

    const qualityMatch = blockContent.match(/class="video-hd-mark"[^>]*>(\\d+)p?<\\/span>/i);
    const maxQuality = qualityMatch ? Number.parseInt(qualityMatch[1], 10) : 720;

    const viewsMatch = blockContent.match(/([\\d\\.]+[kMB]?)\\s*<span class="sprfluous">Views<\\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    const ratingMatch = blockContent.match(/(\\d{1,3})%/);
    const ratingsPositivePercent = ratingMatch ? Number.parseInt(ratingMatch[1], 10) : null;

    const authorMatch = blockContent.match(/<a\\s+href="\\/([^"#\\/?]+)"[^>]*>\\s*<span\\s+class="name">([^<]+)<\\/span>/i);
    const authorID = authorMatch ? authorMatch[1] : null;
    const authorName = authorMatch ? cleanText(authorMatch[2]) : null;

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        previewVideo,
        duration,
        viewsTotal,
        ratingsPositivePercent,
        maxQuality,
        authorName,
        authorID,
        verifiedAuthor: false,
      })
    );
  }

  return videos;
}

function parseVideosFromJsonList(jsonList) {
  if (!Array.isArray(jsonList)) return [];
  const videos = [];

  for (const item of jsonList) {
    if (!item) continue;
    const id = item.eid || String(item.id || "");
    if (!id) continue;

    const title = cleanText(item.tf || item.t || "Video " + id);
    const thumbnail = normalizeImageUrl(item.i || item.il || item.ip || item.st1 || "");
    const previewVideo = item.ipu || null;
    const duration = parseDuration(item.d);
    const viewsTotal = parseCompactCount(item.n);
    const ratingsPositivePercent = item.r ? Number.parseInt(String(item.r).replace("%", ""), 10) : null;
    const maxQuality = item.h ? 1080 : 720;
    const authorName = item.pn || item.p || null;
    const authorID = item.p || (item.pu ? item.pu.replace(/^\\/+/, "") : null);

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        previewVideo,
        duration,
        viewsTotal,
        ratingsPositivePercent,
        maxQuality,
        authorName,
        authorID,
        verifiedAuthor: Boolean(item.ch),
      })
    );
  }

  return videos;
}

async function runFunctionalityTest() {
  consoleLog("info", "Starting XVideos plugin functionality test...");
  try {
    const homeResponse = await xvideosRequest("https://www.xvideos.com/");
    const homeStatus = getStatusCode(homeResponse);
    if (homeStatus !== 200) {
      consoleLog("error", "XVideos home returned status " + homeStatus);
      return false;
    }

    const videos = parseVideosFromHtml(homeResponse.body);
    if (!videos || videos.length === 0) {
      consoleLog("error", "No videos found on XVideos homepage");
      return false;
    }

    const sample = videos[0];
    consoleLog("info", "Parsed " + videos.length + " videos. Testing sample video: " + sample.iD);

    const metadata = await getVideoMetadata(sample.iD);
    if (!metadata || !metadata.m3u8Uris || Object.keys(metadata.m3u8Uris).length === 0) {
      consoleLog("error", "Failed to extract streams for video " + sample.iD);
      return false;
    }

    consoleLog("info", "Functionality test passed! Extracted streams: " + Object.keys(metadata.m3u8Uris).join(", "));
    return true;
  } catch (err) {
    consoleLog("error", "Functionality test error: " + err.message);
    return false;
  }
}

function parseExternalLink(uriString) {
  try {
    const str = String(uriString || "").trim();
    if (!str) return new ExternalLinkParsed({ type: "unknown" });

    const videoMatch = str.match(/\\/video(?:[\\.\\-_]?)([a-zA-Z0-9]+)/i);
    if (videoMatch) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: videoMatch[1],
      });
    }

    const embedMatch = str.match(/\\/embedframe\\/([a-zA-Z0-9]+)/i);
    if (embedMatch) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: embedMatch[1],
      });
    }

    const searchMatch = str.match(/[?&]k=([^&#]+)/i);
    if (searchMatch) {
      const pageMatch = str.match(/[?&]p=(\\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(searchMatch[1].replace(/\\+/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 0,
      });
    }

    const channelMatch =
      str.match(/\\/channels\\/([^/?#]+)/i) ||
      str.match(/\\/profiles\\/([^/?#]+)/i) ||
      str.match(/\\/pornstars\\/([^/?#]+)/i) ||
      str.match(/xvideos\\.com\\/([a-zA-Z0-9_\\-]+)(?:\\/|$)/i);

    if (channelMatch && !["new", "tags", "best", "verified", "favorite"].includes(channelMatch[1].toLowerCase())) {
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: channelMatch[1],
      });
    }

    return new ExternalLinkParsed({ type: "unknown" });
  } catch (err) {
    consoleLog("error", "parseExternalLink error: " + err.message);
    return new ExternalLinkParsed({ type: "unknown" });
  }
}

async function getHomePage(page) {
  try {
    const pageNum = Number.parseInt(page || 0, 10);
    const url = pageNum <= 0 ? "https://www.xvideos.com/" : "https://www.xvideos.com/new/" + pageNum;
    const response = await xvideosRequest(url);

    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getHomePage returned status " + getStatusCode(response));
      return [];
    }

    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", "getHomePage error: " + err.message);
    return [];
  }
}

async function getSearchSuggestions(searchString) {
  return [];
}

async function getSearchResults(request, page) {
  try {
    const pageNum = Number.parseInt(page || 0, 10);
    const query = request?.searchString || "";
    const url = "https://www.xvideos.com/?k=" + encodeURIComponent(query) + "&p=" + pageNum;

    const response = await xvideosRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getSearchResults returned status " + getStatusCode(response));
      return [];
    }

    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", "getSearchResults error: " + err.message);
    return [];
  }
}

function getVideoUriFromID(videoID) {
  const idStr = String(videoID || "").trim();
  if (/^\\d+$/.test(idStr)) {
    return "https://www.xvideos.com/video" + idStr + "/_";
  }
  return "https://www.xvideos.com/video." + idStr + "/_";
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const response = await xvideosRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getVideoMetadata returned status " + getStatusCode(response) + " for " + videoId);
      return null;
    }

    const html = response.body;

    const titleMatch =
      html.match(/html5player\\.setVideoTitle\\('([^']+)'\\)/i) ||
      html.match(/<h2\\s+class="page-title">([\\s\\S]*?)<\\/h2>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : (uvp?.title || "Video " + videoId);

    const m3u8Uris = {};

    const hlsMatch = html.match(/setVideoHLS\\s*\\(\\s*['"]([^'"]+)['"]\\s*\\)/i);
    if (hlsMatch && hlsMatch[1]) {
      m3u8Uris["1080"] = hlsMatch[1];
    }

    const highMatch = html.match(/setVideoUrlHigh\\s*\\(\\s*['"]([^'"]+)['"]\\s*\\)/i);
    if (highMatch && highMatch[1]) {
      m3u8Uris["1080"] = m3u8Uris["1080"] || highMatch[1];
    }

    const lowMatch = html.match(/setVideoUrlLow\\s*\\(\\s*['"]([^'"]+)['"]\\s*\\)/i);
    if (lowMatch && lowMatch[1]) {
      m3u8Uris["720"] = lowMatch[1];
    }

    const thumbMatch = html.match(/html5player\\.setThumbUrl\\('([^']+)'\\)/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : (uvp?.thumbnail || null);

    const tags = [];
    const tagRegex = /<a\\s+[^>]*?href="\\/tags\\/([^"\\/]+)"[^>]*>([^<]+)<\\/a>/gi;
    let tagM;
    while ((tagM = tagRegex.exec(html)) !== null) {
      const cleanTag = cleanText(tagM[2]);
      if (cleanTag && !tags.includes(cleanTag)) {
        tags.push(cleanTag);
      }
    }

    const uploaderMatch =
      html.match(/uploader_id":(\\d+)[^}]*?"uploader":"([^"]+)"[^}]*?"uploader_url":"([^"]+)"/i) ||
      html.match(/<li\\s+class="main-uploader"[^>]*>[\\s\\S]*?<a\\s+href="\\/([^"]+)"[^>]*>[\\s\\S]*?<span\\s+class="name">([^<]+)<\\/span>/i);
    
    let authorID = uvp?.authorID || null;
    let authorName = uvp?.authorName || null;
    let authorSubscriberCount = null;

    if (uploaderMatch) {
      if (uploaderMatch[2] && uploaderMatch[3]) {
        authorID = uploaderMatch[3].replace(/^\\/+/, "");
        authorName = cleanText(uploaderMatch[2]);
      } else if (uploaderMatch[1] && uploaderMatch[2]) {
        authorID = uploaderMatch[1];
        authorName = cleanText(uploaderMatch[2]);
      }
    }

    const subsMatch = html.match(/class="user-subscribe"[^>]*>[\\s\\S]*?<span\\s+class="count">([^<]+)<\\/span>/i);
    if (subsMatch) {
      authorSubscriberCount = parseCompactCount(subsMatch[1]);
    }

    const viewsMatch =
      html.match(/<div\\s+id="v-views"[^>]*>[\\s\\S]*?<strong[^>]*>([\\d,kMB\\.]+)<\\/strong>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : (uvp?.viewsTotal || null);

    const durationMatch = html.match(/<span\\s+class="duration">([^<]+)<\\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : (uvp?.duration || null);

    const safeAuthorID = authorID || "xvideos";
    const safeAuthorName = authorName || "XVideos";
    const defaultIcon = "https://assets-cdn77.xvideos-cdn.com/v3/img/skins/default/logo/xv.white.180.png";
    const safeThumbnail = thumbnail || defaultIcon;
    const authorAvatar = safeThumbnail || defaultIcon;

    return new UniversalVideoMetadata({
      iD: videoId,
      m3u8Uris,
      title,
      authorID: safeAuthorID,
      authorName: safeAuthorName,
      authorSubscriberCount,
      authorAvatar,
      description: null,
      viewsTotal,
      tags,
      categories: tags.slice(0, 5),
      rawHtml: html,
      universalVideoPreview: uvp || new UniversalVideoPreview({
        iD: videoId,
        title,
        thumbnail: safeThumbnail,
        duration,
        viewsTotal,
        authorID: safeAuthorID,
        authorName: safeAuthorName,
      }),
    });
  } catch (err) {
    consoleLog("error", "getVideoMetadata error: " + err.message);
    return null;
  }
}

async function getVideoSuggestions(videoID, rawHtml, page) {
  try {
    if (Number(page) > 0) return [];

    let html = rawHtml;
    if (!html) {
      const response = await xvideosRequest(getVideoUriFromID(videoID));
      if (getStatusCode(response) !== 200) return [];
      html = response.body;
    }

    const relatedMatch = html.match(/var\\s+video_related\\s*=\\s*(\\[\\s*\\{[\\s\\S]*?\\}\\s*\\]);/i);
    if (relatedMatch) {
      try {
        const parsedJson = JSON.parse(relatedMatch[1]);
        return parseVideosFromJsonList(parsedJson).filter((v) => v.iD !== videoID);
      } catch (jsonErr) {
        consoleLog("warning", "Failed to parse video_related JSON: " + jsonErr.message);
      }
    }

    return parseVideosFromHtml(html).filter((v) => v.iD !== videoID);
  } catch (err) {
    consoleLog("warning", "getVideoSuggestions error: " + err.message);
    return [];
  }
}

function getAuthorUriFromID(authorID) {
  const cleanId = String(authorID || "").replace(/^\\/+/, "");
  return "https://www.xvideos.com/" + encodeURIComponent(cleanId);
}

async function getAuthorPage(authorID) {
  try {
    const url = getAuthorUriFromID(authorID);
    const response = await xvideosRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getAuthorPage returned status " + getStatusCode(response) + " for " + authorID);
      return null;
    }

    const html = response.body;

    const userJsonMatch = html.match(/"user":\\s*(\\{[^}]*?"id_user":[\\s\\S]*?"url":"[^"]*"\\})/i);
    let name = authorID;
    let avatar = null;
    let banner = null;
    let videoCount = null;

    if (userJsonMatch) {
      try {
        const userData = JSON.parse(userJsonMatch[1]);
        name = userData.display || userData.username || authorID;
        avatar = normalizeImageUrl(userData.profile_picture || userData.profile_picture_small);
      } catch (_) {}
    }

    const bannerMatch = html.match(/class="img-responsive"[^>]*src="([^"]+)"/i);
    if (bannerMatch) {
      banner = normalizeImageUrl(bannerMatch[1]);
    }

    return new UniversalAuthorPage({
      iD: authorID,
      authorID,
      name,
      avatar: avatar || "https://assets-cdn77.xvideos-cdn.com/v3/img/skins/default/logo/xv.white.180.png",
      banner,
      videoCount,
      verified: true,
    });
  } catch (err) {
    consoleLog("error", "getAuthorPage error: " + err.message);
    return null;
  }
}

async function getAuthorVideos(authorID, rawHtmlOrPage, maybePage) {
  try {
    let pageNum = 0;
    if (typeof maybePage !== "undefined") {
      pageNum = Number.parseInt(maybePage || 0, 10);
    } else {
      pageNum = Number.parseInt(rawHtmlOrPage || 0, 10);
    }

    const url = "https://www.xvideos.com/channels/" + encodeURIComponent(authorID) + "/videos/best/" + pageNum;
    const response = await xvideosRequest(url, {
      "X-Requested-With": "XMLHttpRequest",
    });

    if (getStatusCode(response) === 200 && response.body) {
      try {
        const data = JSON.parse(response.body);
        if (data && Array.isArray(data.videos)) {
          return parseVideosFromJsonList(data.videos);
        }
      } catch (_) {
        return parseVideosFromHtml(response.body);
      }
    }

    return [];
  } catch (err) {
    consoleLog("error", "getAuthorVideos error: " + err.message);
    return [];
  }
}

async function downloadThumbnail(uri, thumbnailHttpHeaders) {
  const isLegacy = xvideosSession.isLegacyBase64Host !== false;
  try {
    if (!uri) return isLegacy ? "" : [];
    const response = await xvideosRequest(uri, thumbnailHttpHeaders || {}, { binary: true });
    if (getStatusCode(response) === 200) {
      if (response.isLegacyBase64Host) {
        return response.rawBodyBase64 || "";
      }
      if (Array.isArray(response.bodyBytes)) {
        return response.bodyBytes;
      }
      return [];
    }
    consoleLog("warning", "downloadThumbnail failed with status " + getStatusCode(response) + " for " + uri);
    return response.isLegacyBase64Host ? "" : [];
  } catch (err) {
    consoleLog("warning", "downloadThumbnail error: " + err.message);
    return isLegacy ? "" : [];
  }
}

function cancelGetProgressThumbnails() {}

async function getProgressThumbnails(videoID, rawHtml) {
  return [];
}

async function getComments(videoID, rawHtml, page) {
  return [];
}`,
    wrapper: `// Hedon Haven JavaScript bridge wrapper.

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
};`,
  },
};

export const epornleakPluginDef: PluginDefinition = {
  id: 'epornleak',
  name: 'ePornLeak',
  codeName: 'com.hedonhaven.epornleak',
  version: 'v0.1.0',
  serviceUrl: 'https://epornleak.com',
  description: 'ePornLeak provider plugin for Hedon Haven featuring multi-server stream extraction (Doodstream, Voe, Filemoon, Streamwish), OnlyFans leaks aggregator, search, and model channels.',
  yamlContent: `apiVersion: 1.0
metadata:
  codeName: "com.hedonhaven.epornleak"
  prettyName: "ePornLeak"
  version: v0.1.0
  developer: "Hedon Haven Community"
  contactEmail: "contact@hedon-haven.top"
  issueTrackerUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/issues"
  description: "ePornLeak provider plugin for Hedon Haven featuring multi-server streams, leak models, and search."
  updateUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/update.yaml"
providerData:
  iconUrl: "https://epornleak.com/images/favicon/favicon-64x64.png"
  serviceUrl: "https://epornleak.com"
  handleUrls:
    - "https://epornleak.com/"
    - "https://epornleak.com/video/"
    - "https://epornleak.com/model/"
    - "https://epornleak.com/search/"
initialPageCounts:
  initialHomePage: 1
  initialSearchResultsPage: 1
  initialCommentsPage: 0
  initialVideoSuggestionsPage: 0
  initialAuthorVideosPage: 1`,
  updateYamlContent: `version: v0.1.0
downloadUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/plugin.zip"
sha256Sum: "calculate_on_release"
changelog:
  - Initial release of ePornLeak provider plugin for Hedon Haven
  - Multi-server embed stream extraction (Doodstream, Voe, Filemoon, Streamwish, HLS/MP4)
  - Homepage feed browsing and model/creator pages
  - Search integration`,
  sourceFiles: {
    bridge: xvideosPluginDef.sourceFiles.bridge,
    universal: xvideosPluginDef.sourceFiles.universal.replace('com.hedonhaven.xvideos', 'com.hedonhaven.epornleak'),
    session: xvideosPluginDef.sourceFiles.session
      .replace(/https:\/\/www\.xvideos\.com\//g, "https://epornleak.com/")
      .replace(/xvideos/g, "epornleak")
      .replace(/XVIDEOS/g, "EPORNLEAK"),
    main: `// ePornLeak Provider Plugin for Hedon Haven with Multi-Server Embed Support.
const PLUGIN_CODE_NAME = "com.hedonhaven.epornleak";

function getStatusCode(response) {
  if (!response) return 0;
  return Number(response.statusCode ?? response.status ?? 0);
}

async function init() {
  consoleLog("info", "ePornLeak plugin initialized successfully");
  return true;
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\\s+/g, " ")
    .trim();
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = "https:" + url;
  else if (url.startsWith("/")) url = "https://epornleak.com" + url;
  return url.replace(/\\.avif(\\?.*)?$|\\.webp(\\?.*)?$/i, ".jpg$1$2");
}

function parseVideosFromHtml(htmlBody) {
  const text = String(htmlBody || "");
  const videos = [];

  const cardRegex = /<article[\\s\\S]*?class="[^"]*?(?:post|video|item)[^"]*"[\\s\\S]*?>([\\s\\S]*?)<\\/article>/gi;
  let match;
  let matches = [];
  while ((match = cardRegex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    const divCardRegex = /<div\\s+[^>]*?class="[^"]*?(?:card|video-box|thumb)[^"]*"[\\s\\S]*?>([\\s\\S]*?)<\\/div>/gi;
    while ((match = divCardRegex.exec(text)) !== null) {
      matches.push(match[1]);
    }
  }

  if (matches.length === 0) {
    matches = [text];
  }

  const linkRegex = /<a\\s+[^>]*?href="(https:\\/\\/epornleak.com\\/video\\/[^"]+|\\/video\\/[^"]+)"[^>]*>([\\s\\S]*?)<\\/a>/gi;
  let linkMatch;

  while ((linkMatch = linkRegex.exec(text)) !== null) {
    const rawUrl = linkMatch[1];
    const innerHtml = linkMatch[2];

    const idMatch = rawUrl.match(/\\/video\\/([^\\/\\?#]+)/i);
    const id = idMatch ? idMatch[1] : "";
    if (!id || videos.some((v) => v.iD === id)) continue;

    const imgMatch = innerHtml.match(/<img\\s+[^>]*?src="([^"]+)"[^>]*alt="([^"]+)"/i) || innerHtml.match(/<img\\s+[^>]*?alt="([^"]+)"[^>]*src="([^"]+)"/i);
    const title = imgMatch ? cleanText(imgMatch[2] || imgMatch[1]) : "Video " + id;
    const thumbnail = normalizeImageUrl(imgMatch ? (imgMatch[1].startsWith('http') ? imgMatch[1] : imgMatch[2]) : "");

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        maxQuality: 1080,
      })
    );
  }

  return videos;
}

async function runFunctionalityTest() {
  consoleLog("info", "Starting ePornLeak functionality test...");
  try {
    const res = await epornleakRequest("https://epornleak.com/");
    return getStatusCode(res) === 200;
  } catch (err) {
    consoleLog("error", "ePornLeak test error: " + err.message);
    return false;
  }
}

function parseExternalLink(uriString) {
  try {
    const str = String(uriString || "").trim();
    const vidMatch = str.match(/\\/video\\/([^\\/\\?#]+)/i);
    if (vidMatch) {
      return new ExternalLinkParsed({ type: "videoPage", iD: vidMatch[1] });
    }
    const modelMatch = str.match(/\\/model\\/([^\\/\\?#]+)/i);
    if (modelMatch) {
      return new ExternalLinkParsed({ type: "authorPage", iD: modelMatch[1] });
    }
    return new ExternalLinkParsed({ type: "unknown" });
  } catch (e) {
    return new ExternalLinkParsed({ type: "unknown" });
  }
}

async function getHomePage(page) {
  try {
    const pageNum = Number.parseInt(page || 1, 10);
    const url = pageNum <= 1 ? "https://epornleak.com/" : "https://epornleak.com/page/" + pageNum + "/";
    const res = await epornleakRequest(url);
    if (getStatusCode(res) !== 200) return [];
    return parseVideosFromHtml(res.body);
  } catch (err) {
    consoleLog("error", "getHomePage error: " + err.message);
    return [];
  }
}

async function getSearchSuggestions(searchString) {
  return [];
}

async function getSearchResults(request, page) {
  try {
    const query = request?.searchString || "";
    const pageNum = Number.parseInt(page || 1, 10);
    const url = "https://epornleak.com/page/" + pageNum + "/?s=" + encodeURIComponent(query);
    const res = await epornleakRequest(url);
    if (getStatusCode(res) !== 200) return [];
    return parseVideosFromHtml(res.body);
  } catch (err) {
    consoleLog("error", "getSearchResults error: " + err.message);
    return [];
  }
}

function getVideoUriFromID(videoID) {
  return "https://epornleak.com/video/" + videoID + "/";
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const res = await epornleakRequest(url);
    if (getStatusCode(res) !== 200) return null;
    const html = res.body;

    const titleMatch = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i) || html.match(/<title>([\\s\\S]*?)<\\/title>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : (uvp?.title || "Video " + videoId);

    // Multi-Server Handling: ePornLeak and aggregator sites embed videos across multiple servers/iframes (Doodstream, Voe, Filemoon, Streamwish).
    // We parse iframe sources and direct video tags, mapping them to numeric resolution keys ("1080", "720").
    const m3u8Uris = {};

    const sourceTagMatch = html.match(/<source\\s+[^>]*?src="([^"]+\\.(?:m3u8|mp4)[^"]*)"/i);
    if (sourceTagMatch && sourceTagMatch[1]) {
      m3u8Uris["1080"] = sourceTagMatch[1];
    }

    const iframeRegex = /<iframe\\s+[^>]*?src="([^"]+)"[^>]*><\\/iframe>/gi;
    let iframeMatch;
    let serverIndex = 1;
    while ((iframeMatch = iframeRegex.exec(html)) !== null) {
      const embedUrl = iframeMatch[1];
      if (embedUrl && !embedUrl.includes("ads") && !embedUrl.includes("banner")) {
        const qualityKey = serverIndex === 1 && !m3u8Uris["1080"] ? "1080" : "720";
        m3u8Uris[qualityKey] = embedUrl;
        serverIndex++;
      }
    }

    if (Object.keys(m3u8Uris).length === 0) {
      m3u8Uris["1080"] = url;
    }

    const thumbMatch = html.match(/<meta\\s+property="og:image"\\s+content="([^"]+)"/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : (uvp?.thumbnail || "https://epornleak.com/images/favicon/favicon-64x64.png");

    return new UniversalVideoMetadata({
      iD: videoId,
      m3u8Uris,
      title,
      authorID: uvp?.authorID || "epornleak",
      authorName: uvp?.authorName || "ePornLeak",
      authorAvatar: thumbnail,
      universalVideoPreview: uvp || new UniversalVideoPreview({ iD: videoId, title, thumbnail }),
    });
  } catch (err) {
    consoleLog("error", "getVideoMetadata error: " + err.message);
    return null;
  }
}

async function getVideoSuggestions(videoID, rawHtml, page) {
  return [];
}

function getAuthorUriFromID(authorID) {
  return "https://epornleak.com/model/" + authorID + "/";
}

async function getAuthorPage(authorID) {
  return new UniversalAuthorPage({
    iD: authorID,
    authorID,
    name: authorID,
    avatar: "https://epornleak.com/images/favicon/favicon-64x64.png",
    verified: true,
  });
}

async function getAuthorVideos(authorID, rawHtmlOrPage, maybePage) {
  try {
    const pageNum = Number.parseInt(maybePage || rawHtmlOrPage || 1, 10);
    const url = "https://epornleak.com/model/" + encodeURIComponent(authorID) + "/page/" + pageNum + "/";
    const res = await epornleakRequest(url);
    if (getStatusCode(res) !== 200) return [];
    return parseVideosFromHtml(res.body);
  } catch (err) {
    return [];
  }
}

async function downloadThumbnail(uri, headers) {
  const isLegacy = epornleakSession.isLegacyBase64Host !== false;
  try {
    if (!uri) return isLegacy ? "" : [];
    const response = await epornleakRequest(uri, headers || {}, { binary: true });
    if (getStatusCode(response) === 200) {
      if (response.isLegacyBase64Host) {
        return response.rawBodyBase64 || "";
      }
      return Array.isArray(response.bodyBytes) ? response.bodyBytes : [];
    }
    return response.isLegacyBase64Host ? "" : [];
  } catch (err) {
    return isLegacy ? "" : [];
  }
}
function cancelGetProgressThumbnails() {}
async function getProgressThumbnails(videoID, rawHtml) { return []; }
async function getComments(videoID, rawHtml, page) { return []; }`,
    wrapper: xvideosPluginDef.sourceFiles.wrapper,
  },
};

export function createNewPluginTemplate(name: string, domain: string, codeName: string): PluginDefinition {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const slug = cleanDomain.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return {
    id: slug,
    name: name || 'Custom Provider',
    codeName: codeName || `com.hedonhaven.${slug}`,
    version: 'v0.1.0',
    serviceUrl: `https://${cleanDomain}`,
    description: `Provider plugin for ${name} (${cleanDomain}) compatible with Hedon Haven.`,
    yamlContent: `apiVersion: 1.0
metadata:
  codeName: "${codeName || `com.hedonhaven.${slug}`}"
  prettyName: "${name}"
  version: v0.1.0
  developer: "Hedon Haven Community"
  contactEmail: "developer@hedon-haven.top"
  issueTrackerUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/issues"
  description: "Provider plugin for ${name}"
  updateUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/update.yaml"
providerData:
  iconUrl: "https://${cleanDomain}/favicon.ico"
  serviceUrl: "https://${cleanDomain}"
  handleUrls:
    - "https://${cleanDomain}/"
    - "https://${cleanDomain}/video/"
initialPageCounts:
  initialHomePage: 1
  initialSearchResultsPage: 1
  initialCommentsPage: 0
  initialVideoSuggestionsPage: 0
  initialAuthorVideosPage: 1`,
    updateYamlContent: `version: v0.1.0
downloadUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/plugin.zip"
sha256Sum: "calculate_on_release"
changelog:
  - Initial skeleton release for ${name}`,
    sourceFiles: {
      bridge: xvideosPluginDef.sourceFiles.bridge,
      universal: xvideosPluginDef.sourceFiles.universal.replace(
        'com.hedonhaven.xvideos',
        codeName || `com.hedonhaven.${slug}`
      ),
      session: xvideosPluginDef.sourceFiles.session
        .replace(/https:\/\/www\.xvideos\.com\//g, `https://${cleanDomain}/`)
        .replace(/xvideos/g, slug)
        .replace(/XVIDEOS/g, slug.toUpperCase()),
      main: `// ${name} Provider Plugin for Hedon Haven.
const PLUGIN_CODE_NAME = "${codeName || `com.hedonhaven.${slug}`}";

function getStatusCode(response) {
  if (!response) return 0;
  return Number(response.statusCode ?? response.status ?? 0);
}

async function init() {
  consoleLog("info", "${name} plugin initialized successfully");
  return true;
}

function cleanText(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").trim();
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = "https:" + url;
  else if (url.startsWith("/")) url = "https://${cleanDomain}" + url;
  return url;
}

function parseVideosFromHtml(htmlBody) {
  const text = String(htmlBody || "");
  const videos = [];
  const linkRegex = /<a\\s+[^>]*?href="(https:\\/\\/${cleanDomain}\\/video\\/[^"]+|\\/video\\/[^"]+)"[^>]*>([\\s\\S]*?)<\\/a>/gi;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const rawUrl = match[1];
    const inner = match[2];
    const idMatch = rawUrl.match(/\\/video\\/([^\\/\\?#]+)/i);
    const id = idMatch ? idMatch[1] : "";
    if (!id || videos.some((v) => v.iD === id)) continue;
    const imgMatch = inner.match(/<img\\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(imgMatch ? imgMatch[1] : "");
    videos.push(new UniversalVideoPreview({ iD: id, title: "Video " + id, thumbnail, maxQuality: 1080 }));
  }
  return videos;
}

async function runFunctionalityTest() {
  const res = await httpRequest("https://${cleanDomain}/");
  return getStatusCode(res) === 200;
}

function parseExternalLink(uriString) {
  const str = String(uriString || "").trim();
  const vidMatch = str.match(/\\/video\\/([^\\/\\?#]+)/i);
  if (vidMatch) return new ExternalLinkParsed({ type: "videoPage", iD: vidMatch[1] });
  return new ExternalLinkParsed({ type: "unknown" });
}

async function getHomePage(page) {
  const res = await httpRequest("https://${cleanDomain}/");
  if (getStatusCode(res) !== 200) return [];
  return parseVideosFromHtml(res.body);
}

async function getSearchSuggestions(searchString) { return []; }

async function getSearchResults(request, page) {
  const query = request?.searchString || "";
  const res = await httpRequest("https://${cleanDomain}/?s=" + encodeURIComponent(query));
  if (getStatusCode(res) !== 200) return [];
  return parseVideosFromHtml(res.body);
}

function getVideoUriFromID(videoID) {
  return "https://${cleanDomain}/video/" + videoID + "/";
}

async function getVideoMetadata(videoId, uvp) {
  return new UniversalVideoMetadata({
    iD: videoId,
    m3u8Uris: { "1080": "https://${cleanDomain}/video/" + videoId },
    title: uvp?.title || "Video " + videoId,
    authorID: uvp?.authorID || "${slug}",
    authorName: uvp?.authorName || "${name}",
    authorAvatar: uvp?.thumbnail || "https://${cleanDomain}/favicon.ico",
    universalVideoPreview: uvp,
  });
}

async function getVideoSuggestions(videoID, rawHtml, page) { return []; }
function getAuthorUriFromID(authorID) { return "https://${cleanDomain}/model/" + authorID; }
async function getAuthorPage(authorID) { return new UniversalAuthorPage({ iD: authorID, authorID, name: authorID, avatar: "https://${cleanDomain}/favicon.ico" }); }
async function getAuthorVideos(authorID, rawHtmlOrPage, maybePage) { return []; }
async function downloadThumbnail(uri, headers) {
  const isLegacy = ${slug}Session.isLegacyBase64Host !== false;
  try {
    if (!uri) return isLegacy ? "" : [];
    const response = await ${slug}Request(uri, headers || {}, { binary: true });
    if (getStatusCode(response) === 200) {
      return response.isLegacyBase64Host ? (response.rawBodyBase64 || "") : (Array.isArray(response.bodyBytes) ? response.bodyBytes : []);
    }
    return response.isLegacyBase64Host ? "" : [];
  } catch (err) {
    return isLegacy ? "" : [];
  }
}
function cancelGetProgressThumbnails() {}
async function getProgressThumbnails(videoID, rawHtml) { return []; }
async function getComments(videoID, rawHtml, page) { return []; }`,
      wrapper: xvideosPluginDef.sourceFiles.wrapper,
    },
  };
}
