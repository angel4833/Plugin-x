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
    this.name = opts.name ?? "";
    this.avatar = opts.avatar ?? "";
    this.avatarHttpHeaders = opts.avatarHttpHeaders ?? null;
    this.banner = opts.banner ?? null;
    this.bannerHttpHeaders = opts.bannerHttpHeaders ?? null;
    this.aliases = opts.aliases ?? null;
    this.description = opts.description ?? null;
    this.advancedDescription = opts.advancedDescription ?? null;
    this.externalLinks = opts.externalLinks ?? null;
    this.viewsTotal = opts.viewsTotal ?? null;
    this.videosTotal = opts.videosTotal ?? opts.videoCount ?? null;
    this.subscribers = opts.subscribers ?? opts.subscriberCount ?? null;
    this.rank = opts.rank ?? null;
    this.verified = opts.verified ?? false;
    this.rawHtml = typeof opts.rawHtml === "string" ? opts.rawHtml : "";
    this.unavailableFields = opts.unavailableFields ?? [];
    this.scrapeFailException = opts.scrapeFailException ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "authorID": this.authorID,
      "name": this.name,
      "plugin": pluginCodeName,
      "avatar": this.avatar,
      "avatarHttpHeaders": this.avatarHttpHeaders,
      "banner": this.banner,
      "bannerHttpHeaders": this.bannerHttpHeaders,
      "aliases": this.aliases,
      "description": this.description,
      "advancedDescription": this.advancedDescription,
      "externalLinks": this.externalLinks,
      "viewsTotal": this.viewsTotal,
      "videosTotal": this.videosTotal,
      "videoCount": this.videosTotal,
      "subscribers": this.subscribers,
      "subscriberCount": this.subscribers,
      "rank": this.rank,
      "verified": this.verified,
      "rawHtml": this.rawHtml ?? "",
      "unavailableFields": this.unavailableFields,
      "scrapeFailException": this.scrapeFailException?.toMap ? this.scrapeFailException.toMap() : null,
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
  url = url.replace(/THUMBNUM/g, "1");
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

    const dataSrcMatch = blockContent.match(/data-src="([^"]+)"/i);
    const srcMatch = blockContent.match(/\\ssrc="([^"]+)"/i);
    const avifSrcMatch = blockContent.match(/data-src-avif="([^"]+)"/i);
    const mzlMatch = blockContent.match(/data-mzl="([^"]+)"/i);
    const rawThumb =
      (dataSrcMatch && !/lightbox-blank/i.test(dataSrcMatch[1]) ? dataSrcMatch[1] : "") ||
      (srcMatch && !/lightbox-blank/i.test(srcMatch[1]) ? srcMatch[1] : "") ||
      (avifSrcMatch ? avifSrcMatch[1] : "") ||
      (mzlMatch ? mzlMatch[1] : "");
    const thumbnail = normalizeImageUrl(rawThumb);

    const pvvMatch = blockContent.match(/data-pvv="([^"]+)"/i);
    const previewVideo = pvvMatch ? normalizeImageUrl(pvvMatch[1]).replace(/\\.jpg$/i, ".mp4") : null;

    const durationMatch = blockContent.match(/class="duration"[^>]*>([^<]+)<\\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : 0;

    const qualityMatch = blockContent.match(/class="video-hd-mark"[^>]*>(\\d+)p?<\\/span>/i);
    const maxQuality = qualityMatch ? Number.parseInt(qualityMatch[1], 10) : 720;

    const viewsMatch = blockContent.match(/([\\d\\.]+[kMB]?)\\s*<span class="sprfluous">Views<\\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    const ratingMatch = blockContent.match(/(\\d{1,3})%/);
    const ratingsPositivePercent = ratingMatch ? Number.parseInt(ratingMatch[1], 10) : null;

    const authorMatch = blockContent.match(/<a\\s+href="\\/([^"#\\?]+)"[^>]*>\\s*<span\\s+class="name">([^<]+)<\\/span>/i);
    const authorID = authorMatch ? authorMatch[1].replace(/\\\\\\//g, "/").replace(/^\\/+|\\/+$/g, "") : "xvideos";
    const authorName = authorMatch ? cleanText(authorMatch[2]) : "XVideos";

    const cardHeaders = {
      "User-Agent": XVIDEOS_USER_AGENT,
      "Referer": "https://www.xvideos.com/",
    };
    const unavailableFields = [];
    if (ratingsPositivePercent == null) unavailableFields.push("ratingsPositivePercent");
    if (!previewVideo) unavailableFields.push("previewVideo");
    if (viewsTotal == null) unavailableFields.push("viewsTotal");

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        thumbnailHttpHeaders: cardHeaders,
        previewVideo,
        previewVideoHttpHeaders: cardHeaders,
        duration,
        viewsTotal,
        ratingsPositivePercent,
        maxQuality,
        authorName,
        authorID,
        verifiedAuthor: false,
        unavailableFields,
      })
    );
  }

  return videos;
}

function parseVideosFromJsonList(jsonList) {
  if (!Array.isArray(jsonList)) return [];
  const videos = [];
  const cardHeaders = {
    "User-Agent": XVIDEOS_USER_AGENT,
    "Referer": "https://www.xvideos.com/",
  };

  for (const item of jsonList) {
    if (!item) continue;
    const id = item.eid || String(item.id || "");
    if (!id) continue;

    const title = cleanText(item.tf || item.t || "Video " + id);
    const thumbnail = normalizeImageUrl(item.i || item.il || item.ip || item.st1 || "");
    const previewVideo = item.ipu ? String(item.ipu).trim() : null;
    const duration = parseDuration(item.d);
    const viewsTotal = item.n != null ? parseCompactCount(item.n) : null;
    const ratingsPositivePercent = item.r ? Number.parseInt(String(item.r).replace("%", ""), 10) : null;
    const maxQuality = item.h ? 1080 : 720;
    const authorName = item.pn || item.p || "XVideos";
    const rawAuthorId = item.p || (item.pu ? item.pu : "xvideos");
    const authorID = String(rawAuthorId).replace(/\\\\\\//g, "/").replace(/^\\/+|\\/+$/g, "") || "xvideos";

    const unavailableFields = [];
    if (ratingsPositivePercent == null) unavailableFields.push("ratingsPositivePercent");
    if (!previewVideo) unavailableFields.push("previewVideo");
    if (viewsTotal == null) unavailableFields.push("viewsTotal");

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        thumbnailHttpHeaders: cardHeaders,
        previewVideo,
        previewVideoHttpHeaders: cardHeaders,
        duration,
        viewsTotal,
        ratingsPositivePercent,
        maxQuality,
        authorName,
        authorID,
        verifiedAuthor: Boolean(item.ch),
        unavailableFields,
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
    if (Number.isNaN(pageNum) || pageNum <= 0) {
      const response = await xvideosRequest("https://www.xvideos.com/");
      if (getStatusCode(response) !== 200) {
        consoleLog("error", "getHomePage returned status " + getStatusCode(response));
        return [];
      }
      return parseVideosFromHtml(response.body);
    }

    const p1 = pageNum * 2 - 1;
    const p2 = pageNum * 2;
    const [res1, res2] = await Promise.all([
      xvideosRequest("https://www.xvideos.com/new/" + p1),
      xvideosRequest("https://www.xvideos.com/new/" + p2),
    ]);

    const combined = [];
    const seen = new Set();
    for (const res of [res1, res2]) {
      if (getStatusCode(res) === 200 && res.body) {
        for (const v of parseVideosFromHtml(res.body)) {
          if (v && v.iD && !seen.has(v.iD)) {
            seen.add(v.iD);
            combined.push(v);
          }
        }
      }
    }
    return combined;
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
    const query = String(request?.searchString || "").trim();
    if (!query) {
      return await getHomePage(pageNum);
    }

    const safePage = Number.isNaN(pageNum) || pageNum < 0 ? 0 : pageNum;
    const p1 = safePage * 2;
    const p2 = safePage * 2 + 1;
    const [res1, res2] = await Promise.all([
      xvideosRequest("https://www.xvideos.com/?k=" + encodeURIComponent(query) + "&p=" + p1),
      xvideosRequest("https://www.xvideos.com/?k=" + encodeURIComponent(query) + "&p=" + p2),
    ]);

    const combined = [];
    const seen = new Set();
    for (const res of [res1, res2]) {
      if (getStatusCode(res) === 200 && res.body) {
        for (const v of parseVideosFromHtml(res.body)) {
          if (v && v.iD && !seen.has(v.iD)) {
            seen.add(v.iD);
            combined.push(v);
          }
        }
      }
    }
    return combined;
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
        authorID = uploaderMatch[3].replace(/\\\\\\//g, "/").replace(/^\\/+|\\/+$/g, "");
        authorName = cleanText(uploaderMatch[2]);
      } else if (uploaderMatch[1] && uploaderMatch[2]) {
        authorID = uploaderMatch[1].replace(/\\\\\\//g, "/").replace(/^\\/+|\\/+$/g, "");
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

function normalizeXVideosAuthorId(authorID) {
  return String(authorID || "").replace(/\\\\\\//g, "/").replace(/^\\/+|\\/+$/g, "").trim();
}

function getAuthorUriFromID(authorID) {
  const cleanId = normalizeXVideosAuthorId(authorID);
  if (!cleanId || cleanId === "xvideos") {
    return "https://www.xvideos.com/";
  }
  const encodedPath = cleanId.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return "https://www.xvideos.com/" + encodedPath;
}

async function getAuthorPage(authorID) {
  try {
    const cleanId = normalizeXVideosAuthorId(authorID) || "xvideos";
    const defaultIcon = "https://assets-cdn77.xvideos-cdn.com/v3/img/skins/default/logo/xv.white.180.png";
    if (cleanId === "xvideos") {
      return new UniversalAuthorPage({
        iD: "xvideos",
        authorID: "xvideos",
        name: "XVideos",
        avatar: defaultIcon,
        verified: true,
        rawHtml: "",
      });
    }

    const url = getAuthorUriFromID(cleanId);
    const response = await xvideosRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getAuthorPage returned status " + getStatusCode(response) + " for " + cleanId);
      return null;
    }

    const html = response.body || "";

    let name = cleanId;
    let avatar = null;
    let banner = null;

    const userJsonMatch = html.match(/"user":\\s*(\\{[^}]*?"id_user":[\\s\\S]*?"url":"[^"]*"\\})/i);
    if (userJsonMatch) {
      try {
        const userData = JSON.parse(userJsonMatch[1]);
        name = userData.display || userData.username || name;
        avatar = normalizeImageUrl(userData.profile_picture || userData.profile_picture_small);
      } catch (_) {}
    }

    const picMatch = html.match(/class="profile-pic"[\\s\\S]*?<img[^>]*?\\ssrc="([^"]+)"/i);
    if (!avatar && picMatch && picMatch[1]) {
      avatar = normalizeImageUrl(picMatch[1]);
    }
    const altMatch = html.match(/class="profile-pic"[\\s\\S]*?<img[^>]*?\\salt="([^"]+)"/i);
    if (name === cleanId && altMatch && altMatch[1]) {
      name = cleanText(altMatch[1]);
    }

    if (name === cleanId) {
      const titleMatch = html.match(/<title>([\\s\\S]*?)<\\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const cleaned = cleanText(titleMatch[1]).replace(/\\s*-\\s*(?:Channel page|Profile page|Pornstar page|Model page|XVIDEOS\\.COM).*$/i, "").trim();
        if (cleaned) name = cleaned;
      }
    }

    const bannerMatch = html.match(/class="img-responsive"[^>]*src="([^"]+)"/i);
    if (bannerMatch) {
      banner = normalizeImageUrl(bannerMatch[1]);
    }
    const subsMatch = html.match(/Subscribers:<\\/strong>\\s*<span>([^<]+)<\\/span>/i);
    const subscribers = subsMatch ? parseCompactCount(subsMatch[1]) : null;
    const viewsMatch = html.match(/Total video views:<\\/strong>\\s*<span>([^<]+)<\\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    return new UniversalAuthorPage({
      iD: cleanId,
      authorID: cleanId,
      name,
      avatar: avatar || defaultIcon,
      banner,
      subscribers,
      viewsTotal,
      verified: true,
      rawHtml: html,
    });
  } catch (err) {
    consoleLog("error", "getAuthorPage error: " + err.message);
    return null;
  }
}

async function getAuthorVideos(authorID, rawHtmlOrPage, maybePage) {
  try {
    let pageNum = 0;
    let passedHtml = "";
    if (typeof maybePage !== "undefined") {
      pageNum = Number.parseInt(maybePage || 0, 10);
      if (typeof rawHtmlOrPage === "string") passedHtml = rawHtmlOrPage;
    } else {
      pageNum = Number.parseInt(rawHtmlOrPage || 0, 10);
    }
    if (Number.isNaN(pageNum) || pageNum < 0) pageNum = 0;

    const cleanId = normalizeXVideosAuthorId(authorID);
    const slug = cleanId.split("/").filter(Boolean).pop() || cleanId;

    const candidates = [
      "https://www.xvideos.com/channels/" + encodeURIComponent(slug) + "/videos/best/" + pageNum,
      "https://www.xvideos.com/profiles/" + encodeURIComponent(slug) + "/videos/best/" + pageNum,
    ];

    for (const url of candidates) {
      const response = await xvideosRequest(url, {
        "X-Requested-With": "XMLHttpRequest",
      });

      if (getStatusCode(response) === 200 && response.body) {
        try {
          const data = JSON.parse(response.body);
          if (data && Array.isArray(data.videos) && data.videos.length > 0) {
            return parseVideosFromJsonList(data.videos);
          }
        } catch (_) {
          const parsed = parseVideosFromHtml(response.body);
          if (parsed.length > 0) return parsed;
        }
      }
    }

    if (pageNum === 0 && passedHtml) {
      return parseVideosFromHtml(passedHtml);
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
    const cleanUri = normalizeImageUrl(uri);
    if (!cleanUri) return isLegacy ? "" : [];
    const response = await xvideosRequest(cleanUri, thumbnailHttpHeaders || {}, { binary: true });
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
  description: 'ePornLeak provider plugin for Hedon Haven featuring encrypted JWPlayer HLS (.m3u8) stream decoding, model profiles, autocomplete suggestions, and search.',
  yamlContent: `apiVersion: 1.0
metadata:
  codeName: "com.hedonhaven.epornleak"
  prettyName: "ePornLeak"
  version: v0.1.0
  developer: "Hedon Haven Community"
  contactEmail: "contact@hedon-haven.top"
  issueTrackerUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/issues"
  description: "ePornLeak provider plugin for Hedon Haven featuring direct HLS streams, OnlyFans leak models/channels, category browsing, and search."
  updateUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/update.yaml"
providerData:
  iconUrl: "https://epornleak.com/images/favicon/favicon-64x64.png"
  serviceUrl: "https://epornleak.com"
  handleUrls:
    - "https://epornleak.com/"
    - "https://epornleak.com/video/"
    - "https://epornleak.com/model/"
    - "https://epornleak.com/categories/"
    - "https://epornleak.com/search"
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
  - Decodes encrypted JWPlayer HLS (.m3u8) streams from player-wrap data-source
  - Supports homepage, search, search autocomplete (/suggest), model profiles, and suggested videos
  - Dual-host compatibility for Hedon Haven v0.6.7 (Base64) and >=0.6.8 (bodyBytes)`,
  sourceFiles: {
    bridge: xvideosPluginDef.sourceFiles.bridge,
    universal: xvideosPluginDef.sourceFiles.universal.replace('com.hedonhaven.xvideos', 'com.hedonhaven.epornleak'),
    session: xvideosPluginDef.sourceFiles.session
      .replace(/https:\/\/www\.xvideos\.com\//g, "https://epornleak.com/")
      .replace(/xvideos/g, "epornleak")
      .replace(/XVIDEOS/g, "EPORNLEAK"),
    main: `// ePornLeak Provider Plugin for Hedon Haven.
// Follows Hedon Haven QuickJS external JavaScript contract.

const PLUGIN_CODE_NAME = "com.hedonhaven.epornleak";
const EPORNLEAK_BASE_URL = "https://epornleak.com";
const EPORNLEAK_DEFAULT_ICON = "https://epornleak.com/images/favicon/favicon-64x64.png";

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
    .replace(/&excl;/gi, "!")
    .replace(/&lpar;/gi, "(")
    .replace(/&rpar;/gi, ")")
    .replace(/&hellip;/gi, "...")
    .replace(/&nbsp;/gi, " ")
    .replace(/\\s+/g, " ")
    .trim();
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = "https:" + url;
  else if (url.startsWith("/")) url = EPORNLEAK_BASE_URL + url;
  return url;
}

function parseDuration(value) {
  const str = String(value || "").trim();
  if (!str) return 0;

  const iso = str.match(/^PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?$/i);
  if (iso) {
    return Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0);
  }

  const colonMatch = str.match(/(\\d{1,2}):(\\d{2})(?::(\\d{2}))?/);
  if (colonMatch) {
    if (colonMatch[3]) {
      return Number(colonMatch[1]) * 3600 + Number(colonMatch[2]) * 60 + Number(colonMatch[3]);
    }
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  let totalSecs = 0;
  const hMatch = str.match(/(\\d+)\\s*(?:h|hr|hours?)/i);
  const mMatch = str.match(/(\\d+)\\s*(?:min|mins?|m)/i);
  const sMatch = str.match(/(\\d+)\\s*(?:sec|secs?|s)/i);
  if (hMatch) totalSecs += Number(hMatch[1]) * 3600;
  if (mMatch) totalSecs += Number(mMatch[1]) * 60;
  if (sMatch) totalSecs += Number(sMatch[1]);
  return totalSecs;
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

function parseDateSafe(rawDate) {
  if (!rawDate) return null;
  const cleaned = String(rawDate).trim().replace(/^(\\d{4}-\\d{2}-\\d{2})\\s+(\\d{2}:\\d{2}:\\d{2})$/, "$1T$2Z");
  const d = new Date(cleaned);
  return Number.isNaN(d.getTime()) ? null : d;
}

function extractVideoSlugFromUrl(url) {
  if (!url) return "";
  const match = String(url).match(/\\/video\\/([^\\/?#]+)/i);
  return match ? match[1] : "";
}

function decodePlayerDataSource(encodedSource, htmlBody) {
  if (!encodedSource) return "";
  const raw = String(encodedSource).trim();

  if (htmlBody) {
    const fnMatch = htmlBody.match(/(\\(function\\s*\\(_0x[\\s\\S]*?function\\s+f\\(_0x[a-f0-9]+\\)\\s*\\{[\\s\\S]*?\\}\\s*)var\\s+playerWrap/);
    if (fnMatch) {
      try {
        const atobPolyfill = (b64) => epornleakDecodeBase64Utf8(b64);
        const runner = new Function("atob", "src", fnMatch[1] + "\\nreturn f(src);");
        const decoded = runner(atobPolyfill, raw);
        if (typeof decoded === "string" && /^https?:\\/\\//i.test(decoded.trim())) {
          return decoded.trim();
        }
      } catch (err) {
        consoleLog("warning", "Dynamic player decoder fallback triggered: " + err.message);
      }
    }
  }

  if (raw.length > 32) {
    try {
      const inner = raw.slice(16, -16).split("").reverse().join("");
      const candidate = epornleakDecodeBase64Utf8(inner);
      if (/^https?:\\/\\//i.test(candidate.trim())) {
        return candidate.trim();
      }
    } catch (_) {}
  }

  try {
    const reversed = raw.split("").reverse().join("");
    for (const marker of ["aHR0cHM6Ly8", "aHR0cDovLw"]) {
      const idx = reversed.indexOf(marker);
      if (idx >= 0) {
        const candidate = epornleakDecodeBase64Utf8(reversed.slice(idx));
        const urlMatch = candidate.match(/https?:\\/\\/[^\\s"'<>]+/i);
        if (urlMatch) return urlMatch[0];
      }
    }
  } catch (_) {}

  return "";
}

function parseVideosFromHtml(htmlBody) {
  const text = String(htmlBody || "");
  const videos = [];
  const seen = new Set();

  const parts = text.split(/<div\\s+class="ui-card-root\\s+ui-card-video">/i);

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i].split(/<\\/section>|<nav\\s|<footer/i)[0];

    const linkMatch = chunk.match(/<a\\s+class="ui-card-link"\\s+href="([^"]+)"(?:\\s+title="([^"]*)")?/i);
    if (!linkMatch) continue;

    const id = extractVideoSlugFromUrl(linkMatch[1]);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const titleFromAttr = linkMatch[2] ? cleanText(linkMatch[2]) : "";
    const titleFromTag = chunk.match(/<h3[^>]*class="[^"]*ui-card-title[^"]*"[^>]*>([\\s\\S]*?)<\\/h3>/i)
      || chunk.match(/class="[^"]*ui-card-title[^"]*"[^>]*>([\\s\\S]*?)<\\/div>/i);
    const title = titleFromTag ? cleanText(titleFromTag[1]) : (titleFromAttr || "Video " + id);

    const thumbMatch =
      chunk.match(/<img\\s+class="ui-card-thumbnail"\\s+[^>]*?src="([^"]+)"/i) ||
      chunk.match(/<img\\s+[^>]*?src="([^"]+\\/(?:player|thumbnail)\\.(?:jpg|webp)[^"]*)"/i) ||
      chunk.match(/<img\\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : EPORNLEAK_DEFAULT_ICON;

    const durMatch = chunk.match(/class="ui-card-duration[^"]*"[^>]*>([^<]+)<\\/div>/i);
    const duration = durMatch ? parseDuration(durMatch[1]) : null;

    const posterMatch = chunk.match(/<a\\s+class="ui-card-poster"\\s+href="[^"]*\\/model\\/([^"\\/?#]+)"(?:\\s+title="([^"]*)")?/i);
    const posterNameMatch = chunk.match(/class="ui-card-poster-name"[^>]*>[\\s\\S]*?<span[^>]*>([^<]+)<\\/span>/i);
    const authorID = posterMatch ? posterMatch[1] : null;
    const authorName = posterNameMatch
      ? cleanText(posterNameMatch[1])
      : (posterMatch && posterMatch[2] ? cleanText(posterMatch[2]) : null);

    const viewsMatch = chunk.match(/<div\\s+class="ui-card-views"[^>]*>[\\s\\S]*?<span>([^<]+)<\\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    videos.push(
      new UniversalVideoPreview({
        iD: id,
        title,
        thumbnail,
        duration,
        viewsTotal,
        maxQuality: 1080,
        authorID,
        authorName,
        verifiedAuthor: Boolean(authorID),
      })
    );
  }

  return videos;
}

async function runFunctionalityTest() {
  consoleLog("info", "Starting ePornLeak plugin functionality test...");
  try {
    const homeResponse = await epornleakRequest(EPORNLEAK_BASE_URL + "/");
    const homeStatus = getStatusCode(homeResponse);
    if (homeStatus !== 200) {
      consoleLog("error", "ePornLeak home returned status " + homeStatus);
      return false;
    }

    const videos = parseVideosFromHtml(homeResponse.body);
    if (!videos || videos.length === 0) {
      consoleLog("error", "No videos parsed from ePornLeak homepage");
      return false;
    }

    const sample = videos[0];
    const metadata = await getVideoMetadata(sample.iD, sample);
    if (!metadata || !metadata.m3u8Uris || Object.keys(metadata.m3u8Uris).length === 0) {
      consoleLog("error", "Failed to decode stream URL for " + sample.iD);
      return false;
    }

    consoleLog("info", "ePornLeak functionality test passed! Stream keys: " + Object.keys(metadata.m3u8Uris).join(", "));
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

    const videoMatch = str.match(/\\/video\\/([^/?#]+)/i);
    if (videoMatch) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: videoMatch[1],
      });
    }

    const modelMatch = str.match(/\\/model\\/([^/?#]+)/i);
    if (modelMatch) {
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: modelMatch[1],
      });
    }

    const searchMatch = str.match(/[?&]s=([^&#]+)/i);
    if (searchMatch) {
      const pageMatch = str.match(/[?&]page=(\\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(searchMatch[1].replace(/\\+/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 1,
      });
    }

    const catTagMatch = str.match(/\\/(?:categories|tags)\\/([^/?#]+)/i);
    if (catTagMatch) {
      const pageMatch = str.match(/[?&]page=(\\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(catTagMatch[1].replace(/-/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 1,
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
    const pageNum = Number.parseInt(page || 1, 10);
    const url = pageNum <= 1 ? EPORNLEAK_BASE_URL + "/" : EPORNLEAK_BASE_URL + "/?page=" + pageNum;
    const response = await epornleakRequest(url);
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
  try {
    const q = String(searchString || "").trim();
    if (!q) return [];
    const response = await epornleakRequest(EPORNLEAK_BASE_URL + "/suggest?s=" + encodeURIComponent(q), {
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
    });
    if (getStatusCode(response) !== 200 || !response.body) return [];
    const data = JSON.parse(response.body);
    if (data && Array.isArray(data.suggestions)) {
      return data.suggestions
        .map((item) => (item && item.value ? String(item.value).trim() : ""))
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
    const url = query
      ? EPORNLEAK_BASE_URL + "/search?s=" + encodeURIComponent(query) + "&type=video&page=" + pageNum
      : EPORNLEAK_BASE_URL + "/popular?page=" + pageNum;

    const response = await epornleakRequest(url);
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
  const cleanId = String(videoID || "").trim().replace(/^\\/+|\\/+$/g, "");
  return EPORNLEAK_BASE_URL + "/video/" + cleanId;
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const response = await epornleakRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getVideoMetadata returned status " + getStatusCode(response) + " for " + videoId);
      return null;
    }

    const html = response.body;

    const titleMatch =
      html.match(/<h1[^>]*class="[^"]*pages-view-video-video-title[^"]*"[^>]*>([\\s\\S]*?)<\\/h1>/i) ||
      html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i) ||
      html.match(/<meta\\s+property="og:title"\\s+content="([^"]+)"/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : (uvp?.title || "Video " + videoId);

    const m3u8Uris = {};
    const dataSourceMatch = html.match(/id="player-wrap"[^>]*?data-source="([^"]+)"/i)
      || html.match(/data-source="([^"]+)"/i);
    if (dataSourceMatch && dataSourceMatch[1]) {
      const decodedUrl = decodePlayerDataSource(dataSourceMatch[1], html);
      if (decodedUrl) {
        m3u8Uris["1080"] = decodedUrl;
      }
    }

    if (Object.keys(m3u8Uris).length === 0) {
      const sourceMatch = html.match(/<source\\s+[^>]*?src="([^"]+\\.(?:m3u8|mp4)[^"]*)"/i);
      if (sourceMatch && sourceMatch[1]) {
        m3u8Uris["1080"] = sourceMatch[1];
      }
    }

    if (Object.keys(m3u8Uris).length === 0) {
      const iframeRegex = /<iframe\\s+[^>]*?src="([^"]+)"[^>]*>/gi;
      let iframeMatch;
      const qualities = ["1080", "720", "480", "360"];
      let idx = 0;
      while ((iframeMatch = iframeRegex.exec(html)) !== null && idx < qualities.length) {
        const embedUrl = iframeMatch[1];
        if (embedUrl && !/nelvoroq|ads|twinrdengine|banner/i.test(embedUrl)) {
          m3u8Uris[qualities[idx++]] = embedUrl;
        }
      }
    }

    if (Object.keys(m3u8Uris).length === 0) {
      consoleLog("warning", "No playable stream extracted for ePornLeak video " + videoId);
    }

    const thumbMatch =
      html.match(/class="video-poster"\\s+[^>]*?src="([^"]+)"/i) ||
      html.match(/<meta\\s+property="og:image"\\s+content="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(thumbMatch ? thumbMatch[1] : (uvp?.thumbnail || "")) || EPORNLEAK_DEFAULT_ICON;

    const creatorMatch = html.match(/<a\\s+class="pv-sheet-creator"\\s+href="[^"]*\\/model\\/([^"\\/?#]+)"/i);
    const creatorNameMatch = html.match(/id="pv-sheet-name"[^>]*>([\\s\\S]*?)<\\/span>/i);
    const creatorAvatarMatch = html.match(/class="pv-sheet-avatar"[^>]*>[\\s\\S]*?<img\\s+[^>]*?src="([^"]+)"/i);

    const safeAuthorID = (creatorMatch ? creatorMatch[1] : null) || uvp?.authorID || "epornleak";
    const safeAuthorName = (creatorNameMatch ? cleanText(creatorNameMatch[1]) : null) || uvp?.authorName || "ePornLeak";
    const authorAvatar = normalizeImageUrl(creatorAvatarMatch ? creatorAvatarMatch[1] : "") || thumbnail || EPORNLEAK_DEFAULT_ICON;

    const descMatch = html.match(/<p\\s+id="post-description"[^>]*>([\\s\\S]*?)<\\/p>/i);
    const description = descMatch ? cleanText(descMatch[1]) : null;

    const viewsMatch = html.match(/class="pages-view-video-views"[^>]*>[\\s\\S]*?<span>([^<]+)<\\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : (uvp?.viewsTotal ?? null);

    const durationMatch = html.match(/class="pages-view-video-length"[^>]*>[\\s\\S]*?<span>([^<]+)<\\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : (uvp?.duration ?? null);

    const timeMatch = html.match(/<time\\s+datetime="([^"]+)"/i);
    const uploadDate = parseDateSafe(timeMatch ? timeMatch[1] : null);

    const categories = [];
    const catRegex = /<li\\s+class="is-category">\\s*<a[^>]*><span>([^<]+)<\\/span>/gi;
    let catM;
    while ((catM = catRegex.exec(html)) !== null) {
      const val = cleanText(catM[1]);
      if (val && !categories.includes(val)) categories.push(val);
    }

    const tags = [];
    const tagRegex = /<li>\\s*<a\\s+href="[^"]*\\/tags\\/[^"]+"\\s+rel="tag"><span>([^<]+)<\\/span>/gi;
    let tagM;
    while ((tagM = tagRegex.exec(html)) !== null) {
      const val = cleanText(tagM[1]);
      if (val && !tags.includes(val)) tags.push(val);
    }

    return new UniversalVideoMetadata({
      iD: videoId,
      m3u8Uris,
      playbackHttpHeaders: {
        "Referer": EPORNLEAK_BASE_URL + "/",
        "User-Agent": EPORNLEAK_USER_AGENT,
      },
      title,
      authorID: safeAuthorID,
      authorName: safeAuthorName,
      authorAvatar,
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
        verifiedAuthor: true,
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
      const response = await epornleakRequest(getVideoUriFromID(videoID));
      if (getStatusCode(response) !== 200) return [];
      html = response.body;
    }

    const relIdx = html.indexOf("list_videos_random_videos_items");
    const sectionHtml = relIdx >= 0 ? html.slice(relIdx) : html;
    return parseVideosFromHtml(sectionHtml).filter((v) => v.iD !== videoID);
  } catch (err) {
    consoleLog("warning", "getVideoSuggestions error: " + err.message);
    return [];
  }
}

function getAuthorUriFromID(authorID) {
  const cleanId = String(authorID || "").trim().replace(/^\\/+|\\/+$/g, "");
  if (!cleanId || cleanId === "epornleak") {
    return EPORNLEAK_BASE_URL + "/";
  }
  return EPORNLEAK_BASE_URL + "/model/" + encodeURIComponent(cleanId);
}

async function getAuthorPage(authorID) {
  try {
    const cleanId = String(authorID || "").trim() || "epornleak";
    if (cleanId === "epornleak") {
      return new UniversalAuthorPage({
        iD: "epornleak",
        authorID: "epornleak",
        name: "ePornLeak",
        avatar: EPORNLEAK_DEFAULT_ICON,
        verified: true,
        rawHtml: "",
      });
    }

    const url = getAuthorUriFromID(cleanId);
    const response = await epornleakRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getAuthorPage returned status " + getStatusCode(response) + " for " + cleanId);
      return null;
    }

    const html = response.body || "";
    const nameMatch = html.match(/class="[^"]*blocks-model-view-name[^"]*"[^>]*>([\\s\\S]*?)<\\/p>/i);
    const name = nameMatch ? cleanText(nameMatch[1]) : cleanId;

    const avatarMatch =
      html.match(/blocks-model-view-neighbor-current[\\s\\S]*?<img\\s+src="([^"]+)"/i) ||
      html.match(/<meta\\s+property="og:image"\\s+content="([^"]+)"/i);
    const avatar = normalizeImageUrl(avatarMatch ? avatarMatch[1] : "") || EPORNLEAK_DEFAULT_ICON;

    const statsMatch = html.match(/blocks-model-view-stats-value">([\\d,]+)<\\/div>\\s*<div[^>]*>Videos<\\/div>/i);
    const videoCount = statsMatch ? parseCompactCount(statsMatch[1]) : null;

    return new UniversalAuthorPage({
      iD: cleanId,
      authorID: cleanId,
      name,
      avatar,
      videosTotal: videoCount,
      videoCount,
      verified: true,
      rawHtml: html,
    });
  } catch (err) {
    consoleLog("error", "getAuthorPage error: " + err.message);
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

    const cleanId = String(authorID || "").trim() || "epornleak";
    const base = getAuthorUriFromID(cleanId);
    const url = pageNum <= 1 ? base : base + "?page=" + pageNum;

    const response = await epornleakRequest(url);
    if (getStatusCode(response) !== 200) return [];
    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", "getAuthorVideos error: " + err.message);
    return [];
  }
}

async function downloadThumbnail(uri, thumbnailHttpHeaders) {
  const isLegacy = epornleakSession.isLegacyBase64Host !== false;
  try {
    if (!uri) return isLegacy ? "" : [];
    const response = await epornleakRequest(uri, thumbnailHttpHeaders || {}, { binary: true });
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
    wrapper: xvideosPluginDef.sourceFiles.wrapper,
  },
};

export const xxxparodyhdPluginDef: PluginDefinition = {
  id: 'xxxparodyhd',
  name: 'XXXParodyHD',
  codeName: 'com.hedonhaven.xxxparodyhd',
  version: 'v0.1.0',
  serviceUrl: 'https://xxxparodyhd.net',
  description: 'XXXParodyHD provider plugin for Hedon Haven featuring multi-server embed resolution (LuluStream HLS, MixDrop MP4, VOE, DoodStream), studios, pornstars, and search.',
  yamlContent: `apiVersion: 1.0
metadata:
  codeName: "com.hedonhaven.xxxparodyhd"
  prettyName: "XXXParodyHD"
  version: v0.1.0
  developer: "Hedon Haven Community"
  contactEmail: "contact@hedon-haven.top"
  issueTrackerUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/issues"
  description: "XXXParodyHD provider plugin for Hedon Haven with multi-server stream extraction (LuluStream HLS, MixDrop MP4, VOE, DoodStream), studios, pornstars, and search."
  updateUrl: "https://github.com/Hedon-Haven/3rd-party-plugin-examples/releases/latest/download/update.yaml"
providerData:
  iconUrl: "https://xxxparodyhd.net/wp-content/uploads/spt-brand/icon-192-da7c422f.png"
  serviceUrl: "https://xxxparodyhd.net"
  handleUrls:
    - "https://xxxparodyhd.net/"
    - "https://xxxparodyhd.net/movies/"
    - "https://xxxparodyhd.net/director/"
    - "https://xxxparodyhd.net/pornstar/"
    - "https://xxxparodyhd.net/search/"
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
  - Initial release of XXXParodyHD provider plugin for Hedon Haven
  - Multi-server embed resolver supporting LuluStream (.m3u8), MixDrop (.mp4), StreamWish, VOE, and DoodStream
  - Search via /search/<query>/ and autocomplete via TurboSearch REST API
  - Full support for Studios (/director/) and Pornstars (/pornstar/) catalogs
  - Dual-host compatibility for Hedon Haven v0.6.7 (Base64) and >=0.6.8 (bodyBytes)`,
  sourceFiles: {
    bridge: xvideosPluginDef.sourceFiles.bridge,
    universal: xvideosPluginDef.sourceFiles.universal.replace('com.hedonhaven.xvideos', 'com.hedonhaven.xxxparodyhd'),
    session: xvideosPluginDef.sourceFiles.session
      .replace(/https:\/\/www\.xvideos\.com\//g, "https://xxxparodyhd.net/")
      .replace(/xvideos/g, "xxxparodyhd")
      .replace(/XVIDEOS/g, "XXXPARODYHD"),
    main: `// XXXParodyHD Provider Plugin for Hedon Haven.
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
    .replace(/\\s+/g, " ")
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
  if (url.startsWith("//")) url = "https:" + url;
  else if (url.startsWith("/")) url = XXXPARODYHD_BASE_URL + url;
  return url;
}

function normalizeStreamUrl(value) {
  if (!value) return "";
  let url = String(value).trim().replace(/\\\\\\//g, "/");
  if (url.startsWith("//")) url = "https:" + url;
  return url;
}

function getOrigin(url) {
  const m = String(url || "").match(/^(https?:\\/\\/[^\\/?#]+)/i);
  return m ? m[1] : XXXPARODYHD_BASE_URL;
}

function parseDuration(value) {
  const str = String(value || "").trim();
  if (!str) return 0;

  const iso = str.match(/^PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?$/i);
  if (iso) {
    return Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0);
  }

  const colonMatch = str.match(/(\\d{1,2}):(\\d{2})(?::(\\d{2}))?/);
  if (colonMatch) {
    if (colonMatch[3]) {
      return Number(colonMatch[1]) * 3600 + Number(colonMatch[2]) * 60 + Number(colonMatch[3]);
    }
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  let totalSecs = 0;
  const hMatch = str.match(/(\\d+)\\s*(?:h|hr|hours?)/i);
  const mMatch = str.match(/(\\d+)\\s*(?:min|mins?|m)/i);
  const sMatch = str.match(/(\\d+)\\s*(?:sec|secs?|s)/i);
  if (hMatch) totalSecs += Number(hMatch[1]) * 3600;
  if (mMatch) totalSecs += Number(mMatch[1]) * 60;
  if (sMatch) totalSecs += Number(sMatch[1]);
  return totalSecs;
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

function extractMovieSlugFromUrl(url) {
  if (!url) return "";
  const clean = String(url).split("?")[0].split("#")[0].replace(/\\/+$/, "");
  const m = clean.match(/xxxparodyhd\\.net\\/([^\\/]+)$/i) || clean.match(/\\/([^\\/]+)$/);
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

  const cardParts = text.split(/<article\\s+class="card">/i);
  for (let i = 1; i < cardParts.length; i++) {
    const chunk = cardParts[i].split(/<\\/article>/i)[0];

    const linkMatch =
      chunk.match(/<h3\\s+class="card__t"[^>]*>\\s*<a\\s+href="([^"]+)"[^>]*>([\\s\\S]*?)<\\/a>/i) ||
      chunk.match(/<a\\s+class="card__th"\\s+href="([^"]+)"/i);
    if (!linkMatch) continue;

    const id = extractMovieSlugFromUrl(linkMatch[1]);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const altMatch = chunk.match(/alt="(?:Watch\\s+)?([^"]+?)(?:\\s+Porn Online Free)?"/i);
    const title = linkMatch[2] ? cleanText(linkMatch[2]) : (altMatch ? cleanText(altMatch[1]) : "Movie " + id);

    const thumbMatch = chunk.match(/<img\\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(thumbMatch ? thumbMatch[1] : "") || XXXPARODYHD_DEFAULT_ICON;

    const durMatch = chunk.match(/<span\\s+class="card__dur"[^>]*>([^<]+)<\\/span>/i);
    const duration = durMatch ? parseDuration(durMatch[1]) : null;

    const viewsMatch = chunk.match(/<span\\s+class="m-v"[^>]*>[\\s\\S]*?<\\/svg>\\s*([\\d,KMBkmb\\.]+)/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    const dirMatch = chunk.match(/<a\\s+class="card__tx"\\s+href="[^"]*\\/(director|pornstar)\\/([^"\\/?#]+)\\/"(?:\\s+title="([^"]*)")?/i);
    const byMatch = chunk.match(/<span\\s+class="card__by"[^>]*>([^<]+)<\\/span>/i);
    const authorID = dirMatch ? dirMatch[1] + "/" + dirMatch[2] : "xxxparodyhd";
    const authorName = dirMatch
      ? cleanText(dirMatch[3] || dirMatch[2])
      : (byMatch ? cleanText(byMatch[1]) : "XXXParodyHD");

    const qMatch = chunk.match(/<span\\s+class="card__q"[^>]*>([^<]+)<\\/span>/i);
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

function unpackPackerScripts(html) {
  const results = [];
  const source = String(html || "");
  let idx = 0;

  while ((idx = source.indexOf("eval(function(p,a,c,k,e,", idx)) !== -1) {
    let depth = 0;
    let i = idx + 4;
    let inStr = null;
    let esc = false;

    for (; i < source.length; i++) {
      const ch = source[i];
      if (esc) {
        esc = false;
        continue;
      }
      if (ch === "\\\\") {
        esc = true;
        continue;
      }
      if (inStr) {
        if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === "\`") {
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
        consoleLog("warning", "Packer unpack skipped: " + err.message);
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
      "Referer": XXXPARODYHD_BASE_URL + "/",
    });
    const status = getStatusCode(res);
    if (status !== 200 || !res.body) {
      consoleLog("warning", "Server " + label + " returned HTTP " + status);
      return null;
    }

    const html = res.body;

    if (slug.includes("voe") || /voe\\.sx/i.test(url)) {
      const redirMatch = html.match(/window\\.location\\.href\\s*=\\s*['"](https?:\\/\\/[^'"]+)['"]/i);
      if (redirMatch && redirMatch[1]) {
        const redirRes = await xxxparodyhdRequest(redirMatch[1], { "Referer": url });
        if (getStatusCode(redirRes) === 200 && redirRes.body) {
          const b64HlsMatch = redirRes.body.match(/['"]hls['"]\\s*:\\s*['"]([A-Za-z0-9+/=]{20,})['"]/i);
          if (b64HlsMatch) {
            const decoded = xxxparodyhdDecodeBase64Utf8(b64HlsMatch[1]);
            if (/^https?:\\/\\//i.test(decoded)) {
              return { url: decoded, referer: getOrigin(redirMatch[1]) + "/", label, kind: "m3u8" };
            }
          }
          const directVoe = redirRes.body.match(/https?:\\/\\/[^"'\\s<>]+\\.m3u8[^"'\\s<>]*/i);
          if (directVoe) {
            return { url: directVoe[0], referer: getOrigin(redirMatch[1]) + "/", label, kind: "m3u8" };
          }
        }
      }
    }

    const unpacked = unpackPackerScripts(html);
    const combined = unpacked.length > 0 ? unpacked.join("\\n") + "\\n" + html : html;

    const furlMatch = combined.match(/MDCore\\.furl\\s*=\\s*["']([^"']+)["']/i);
    const wurlMatch = combined.match(/MDCore\\.wurl\\s*=\\s*["']([^"']+)["']/i);
    const mdRaw = (furlMatch && furlMatch[1].trim()) || (wurlMatch && wurlMatch[1].trim()) || "";
    if (mdRaw) {
      const streamUrl = normalizeStreamUrl(mdRaw);
      if (streamUrl.startsWith("http")) {
        return { url: streamUrl, referer: origin + "/", label, kind: "mp4" };
      }
    }

    const jwFileMatch =
      combined.match(/sources\\s*:\\s*\\[\\s*\\{[^}]*?file\\s*:\\s*["'](https?:\\/\\/[^"']+)["']/i) ||
      combined.match(/file\\s*:\\s*["'](https?:\\/\\/[^"']+\\.(?:m3u8|mp4)[^"']*)["']/i);
    if (jwFileMatch && jwFileMatch[1]) {
      const streamUrl = normalizeStreamUrl(jwFileMatch[1]);
      return {
        url: streamUrl,
        referer: origin + "/",
        label,
        kind: streamUrl.includes(".m3u8") ? "m3u8" : "mp4",
      };
    }

    const m3u8Match = combined.match(/https?:\\/\\/[^"'\\s<>\\\\]+\\.m3u8(?:[^"'\\s<>\\\\]*)/i);
    if (m3u8Match && m3u8Match[0]) {
      const streamUrl = normalizeStreamUrl(m3u8Match[0]);
      return { url: streamUrl, referer: origin + "/", label, kind: "m3u8" };
    }

    const mp4Match = combined.match(/(?:https?:)?\\/\\/[^"'\\s<>\\\\]+\\.mp4(?:[^"'\\s<>\\\\]*)/i);
    if (mp4Match && mp4Match[0] && !/banner|ads|promo|preview/i.test(mp4Match[0])) {
      const streamUrl = normalizeStreamUrl(mp4Match[0]);
      if (streamUrl.startsWith("http")) {
        return { url: streamUrl, referer: origin + "/", label, kind: "mp4" };
      }
    }

    const passMatch = html.match(/['"](\\/pass_md5\\/[^'"]+)['"]/i);
    if (passMatch && passMatch[1]) {
      const passUrl = origin + passMatch[1];
      const passRes = await xxxparodyhdRequest(passUrl, { "Referer": url });
      if (getStatusCode(passRes) === 200 && passRes.body && passRes.body.startsWith("http")) {
        const token = passMatch[1].split("/").pop() || "token";
        const suffix = "abcdefghij?token=" + token + "&expiry=" + Date.now();
        return { url: passRes.body + suffix, referer: origin + "/", label, kind: "mp4" };
      }
    }

    return null;
  } catch (err) {
    consoleLog("warning", "Server " + label + " resolve error: " + err.message);
    return null;
  }
}

function getServerPriority(server) {
  const x = String(server?.x || server?.l || "").toLowerCase();
  const u = String(server?.u || "").toLowerCase();
  // Prefer direct .mp4 providers first (MixDrop, DoodStream) over HLS (.m3u8)
  if (x.includes("mixdrop") || u.includes("mixdrop") || u.includes("mxdrop")) return 1;
  if (x.includes("dood") || u.includes("playmogo")) return 2;
  if (x.includes("lulu") || u.includes("lulu")) return 3;
  if (x.includes("wish") || x.includes("filemoon") || x.includes("vidhide")) return 4;
  if (x.includes("voe") || u.includes("voe")) return 5;
  return 6;
}

async function resolveAllServers(servers) {
  if (!Array.isArray(servers) || servers.length === 0) return [];
  const sorted = [...servers].sort((a, b) => getServerPriority(a) - getServerPriority(b));

  const primaryBatch = sorted.slice(0, 3);
  const primaryResolved = (await Promise.all(primaryBatch.map(resolveEmbedServer))).filter(Boolean);
  if (primaryResolved.length > 0) {
    return primaryResolved;
  }

  const secondaryBatch = sorted.slice(3, 7);
  if (secondaryBatch.length === 0) return [];
  return (await Promise.all(secondaryBatch.map(resolveEmbedServer))).filter(Boolean);
}

async function runFunctionalityTest() {
  consoleLog("info", "Starting XXXParodyHD plugin functionality test...");
  try {
    const homeResponse = await xxxparodyhdRequest(XXXPARODYHD_BASE_URL + "/");
    if (getStatusCode(homeResponse) !== 200) {
      consoleLog("error", "XXXParodyHD home returned status " + getStatusCode(homeResponse));
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
      consoleLog("error", "Failed to resolve stream servers for " + sample.iD);
      return false;
    }

    consoleLog("info", "XXXParodyHD functionality test passed! Streams: " + Object.keys(metadata.m3u8Uris).join(", "));
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

    const dirMatch = str.match(/\\/(director|pornstar)\\/([^\\/?#]+)/i);
    if (dirMatch) {
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: dirMatch[1].toLowerCase() + "/" + dirMatch[2],
      });
    }

    const searchMatch = str.match(/\\/search\\/([^\\/?#]+)/i) || str.match(/[?&]s=([^&#]+)/i);
    if (searchMatch) {
      const pageMatch = str.match(/\\/page\\/(\\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(searchMatch[1].replace(/\\+/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 1,
      });
    }

    const genreMatch = str.match(/\\/(?:genre|category)\\/([^\\/?#]+)/i);
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
    consoleLog("error", "parseExternalLink error: " + err.message);
    return new ExternalLinkParsed({ type: "unknown" });
  }
}

async function getHomePage(page) {
  try {
    const pageNum = Number.parseInt(page || 1, 10);
    const url = pageNum <= 1 ? XXXPARODYHD_BASE_URL + "/" : XXXPARODYHD_BASE_URL + "/page/" + pageNum + "/";
    const response = await xxxparodyhdRequest(url);
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
  try {
    const q = String(searchString || "").trim();
    if (q.length < 2) return [];
    const response = await xxxparodyhdRequest(
      XXXPARODYHD_BASE_URL + "/wp-json/turbosearch/v1/suggest?q=" + encodeURIComponent(q),
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
    const url = query
      ? (pageNum <= 1
          ? XXXPARODYHD_BASE_URL + "/search/" + encodeURIComponent(query) + "/"
          : XXXPARODYHD_BASE_URL + "/search/" + encodeURIComponent(query) + "/page/" + pageNum + "/")
      : (pageNum <= 1
          ? XXXPARODYHD_BASE_URL + "/most-viewed/"
          : XXXPARODYHD_BASE_URL + "/most-viewed/page/" + pageNum + "/");

    const response = await xxxparodyhdRequest(url);
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
  const cleanId = String(videoID || "").trim().replace(/^\\/+|\\/+$/g, "");
  return XXXPARODYHD_BASE_URL + "/" + cleanId + "/";
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getVideoMetadata returned status " + getStatusCode(response) + " for " + videoId);
      return null;
    }

    const html = response.body;

    const titleMatch =
      html.match(/<h1\\s+class="vid__t[^"]*"[^>]*>([\\s\\S]*?)<\\/h1>/i) ||
      html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i) ||
      html.match(/<meta\\s+property="og:title"\\s+content="([^"]+)"/i);
    const title = titleMatch
      ? cleanText(titleMatch[1]).replace(/\\s*-\\s*XXX Parody$/i, "")
      : (uvp?.title || "Movie " + videoId);

    let servers = [];
    const dsMatch = html.match(/data-servers="([^"]+)"/i);
    if (dsMatch && dsMatch[1]) {
      try {
        const jsonText = decodeHtmlEntities(dsMatch[1]).replace(/\\\\\\//g, "/");
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) servers = parsed;
      } catch (jsonErr) {
        consoleLog("warning", "Failed to parse data-servers JSON: " + jsonErr.message);
      }
    }

    const resolvedStreams = await resolveAllServers(servers);
    const m3u8Uris = {};
    const qualityKeys = ["1080", "720", "480", "360"];
    const usedUrls = new Set();

    // Prioritize direct .mp4 streams first; only use .m3u8 if no .mp4 resolved.
    resolvedStreams.sort((a, b) => (a.kind === "mp4" ? 0 : 1) - (b.kind === "mp4" ? 0 : 1));
    const mp4Streams = resolvedStreams.filter((s) => s && s.kind === "mp4" && s.url);
    const preferredStreams = mp4Streams.length > 0 ? mp4Streams : resolvedStreams;

    let qIdx = 0;
    for (const st of preferredStreams) {
      if (!st || !st.url || usedUrls.has(st.url) || qIdx >= qualityKeys.length) continue;
      usedUrls.add(st.url);
      m3u8Uris[qualityKeys[qIdx++]] = st.url;
    }

    const primaryStream = preferredStreams[0] || null;
    const playbackHeaders = {
      "User-Agent": XXXPARODYHD_USER_AGENT,
    };
    if (primaryStream && primaryStream.referer && !/mixdrop|mxcontent/i.test(primaryStream.url)) {
      playbackHeaders["Referer"] = primaryStream.referer;
    }

    const thumbMatch =
      html.match(/<meta\\s+property="og:image"\\s+content="([^"]+)"/i) ||
      html.match(/<img\\s+class="card__img"\\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(thumbMatch ? thumbMatch[1] : (uvp?.thumbnail || "")) || XXXPARODYHD_DEFAULT_ICON;

    const studioMatch = html.match(/<b>Studio<\\/b>[\\s\\S]*?<a\\s+class="chip"\\s+href="[^"]*\\/director\\/([^"\\/?#]+)\\/">([^<]+)<\\/a>/i);
    const safeAuthorID = studioMatch ? "director/" + studioMatch[1] : (uvp?.authorID || "xxxparodyhd");
    const safeAuthorName = studioMatch ? cleanText(studioMatch[2]) : (uvp?.authorName || "XXXParodyHD");
    const authorAvatar = thumbnail || XXXPARODYHD_DEFAULT_ICON;

    const actors = [];
    const starSectionMatch = html.match(/<b>Pornstars<\\/b>([\\s\\S]*?)<\\/div>\\s*<\\/div>\\s*<\\/div>/i);
    if (starSectionMatch) {
      const starRegex = /<a\\s+class="chip\\s+chip--star"\\s+href="[^"]*\\/pornstar\\/([^"\\/?#]+)\\/">([^<]+)<\\/a>/gi;
      let sm;
      while ((sm = starRegex.exec(starSectionMatch[1])) !== null) {
        actors.push({
          name: cleanText(sm[2]),
          authorID: "pornstar/" + sm[1],
          avatar: authorAvatar,
        });
      }
    }

    const descMatch = html.match(/<div\\s+class="desc">([\\s\\S]*?)<\\/div>/i);
    const description = descMatch ? cleanText(descMatch[1]) : null;

    const viewsMatch = html.match(/data-views[^>]*>([\\d,KMBkmb\\.]+)</i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : (uvp?.viewsTotal ?? null);

    const durMatch = html.match(/st--duration"[^>]*>[\\s\\S]*?<\\/svg>([^<]+)<\\/span>/i);
    const duration = durMatch ? parseDuration(durMatch[1]) : (uvp?.duration ?? null);

    const dateMatch = html.match(/st--date"[^>]*>[\\s\\S]*?<time\\s+datetime="([^"]+)"/i);
    let uploadDate = null;
    if (dateMatch && dateMatch[1]) {
      const d = new Date(dateMatch[1]);
      if (!Number.isNaN(d.getTime())) uploadDate = d;
    }

    const categories = [];
    const tags = [];
    const genreRegex = /<a\\s+class="chip"\\s+href="[^"]*\\/genre\\/[^"]+">([^<]+)<\\/a>/gi;
    let gm;
    while ((gm = genreRegex.exec(html)) !== null) {
      const val = cleanText(gm[1]);
      if (val && !tags.includes(val)) tags.push(val);
    }
    const catRegex = /<a\\s+class="chip"\\s+href="[^"]*\\/category\\/[^"]+">([^<]+)<\\/a>/gi;
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
      playbackHttpHeaders: playbackHeaders,
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
    consoleLog("error", "getVideoMetadata error: " + err.message);
    return null;
  }
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
    consoleLog("warning", "getVideoSuggestions error: " + err.message);
    return [];
  }
}

function getAuthorUriFromID(authorID) {
  const cleanId = String(authorID || "").trim().replace(/^\\/+|\\/+$/g, "");
  if (!cleanId || cleanId === "xxxparodyhd") {
    return XXXPARODYHD_BASE_URL + "/";
  }
  if (cleanId.startsWith("director/") || cleanId.startsWith("pornstar/")) {
    return XXXPARODYHD_BASE_URL + "/" + cleanId + "/";
  }
  return XXXPARODYHD_BASE_URL + "/director/" + encodeURIComponent(cleanId) + "/";
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
        rawHtml: "",
      });
    }

    const url = getAuthorUriFromID(cleanId);
    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", "getAuthorPage returned status " + getStatusCode(response) + " for " + cleanId);
      return null;
    }

    const html = response.body || "";
    const h1Match = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i);
    const name = h1Match ? cleanText(h1Match[1]).replace(/\\s+Parodies$|\\s+Parody Roles$/i, "") : cleanId;

    const videos = parseVideosFromHtml(html);
    const avatar = (videos[0] && videos[0].thumbnail) ? videos[0].thumbnail : XXXPARODYHD_DEFAULT_ICON;
    const countMatch = html.match(/(\\d+)\\s*(?:movies|videos|parodies)/i);
    const videosTotal = countMatch ? Number.parseInt(countMatch[1], 10) : (videos.length || null);

    return new UniversalAuthorPage({
      iD: cleanId,
      authorID: cleanId,
      name,
      avatar,
      banner: videos[1]?.thumbnail || avatar,
      videosTotal,
      videoCount: videosTotal,
      verified: true,
      rawHtml: html,
    });
  } catch (err) {
    consoleLog("error", "getAuthorPage error: " + err.message);
    return null;
  }
}

async function getAuthorVideos(authorID, rawHtmlOrPage, maybePage) {
  try {
    let pageNum = 1;
    let passedHtml = "";
    if (typeof maybePage !== "undefined") {
      pageNum = Number.parseInt(maybePage || 1, 10);
      if (typeof rawHtmlOrPage === "string") passedHtml = rawHtmlOrPage;
    } else {
      pageNum = Number.parseInt(rawHtmlOrPage || 1, 10);
    }
    if (Number.isNaN(pageNum) || pageNum < 1) pageNum = 1;

    if (pageNum <= 1 && passedHtml && passedHtml.includes("<article")) {
      const parsed = parseVideosFromHtml(passedHtml);
      if (parsed.length > 0) return parsed;
    }

    const cleanId = String(authorID || "").trim() || "xxxparodyhd";
    const base = getAuthorUriFromID(cleanId);
    const url = pageNum <= 1 ? base : base + "page/" + pageNum + "/";

    const response = await xxxparodyhdRequest(url);
    if (getStatusCode(response) !== 200) return [];
    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", "getAuthorVideos error: " + err.message);
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
