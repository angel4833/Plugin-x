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
}
