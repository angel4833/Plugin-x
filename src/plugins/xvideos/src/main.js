// XVideos Provider Plugin for Hedon Haven.
// Follows Hedon Haven QuickJS external JavaScript contract.

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
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = `https:${url}`;
  else if (url.startsWith("/")) url = `https://www.xvideos.com${url}`;
  
  // Replace .avif with .jpg if possible to ensure compatibility with Flutter Image widget
  return url.replace(/\.avif(\?.*)?$/i, ".jpg$1");
}

function parseDuration(value) {
  const str = String(value || "").trim();
  if (!str) return 0;
  
  // ISO-8601 format like PT3M20S
  const iso = str.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (iso) {
    return (Number(iso[1] || 0) * 3600) + (Number(iso[2] || 0) * 60) + Number(iso[3] || 0);
  }

  // Text formats like "1 h 12 min", "5 min", "45 sec"
  let totalSecs = 0;
  const hoursMatch = str.match(/(\d+)\s*(?:h|hr|hours?)/i);
  const minsMatch = str.match(/(\d+)\s*(?:min|mins?|m)/i);
  const secsMatch = str.match(/(\d+)\s*(?:sec|secs?|s)/i);

  if (hoursMatch) totalSecs += Number(hoursMatch[1]) * 3600;
  if (minsMatch) totalSecs += Number(minsMatch[1]) * 60;
  if (secsMatch) totalSecs += Number(secsMatch[1]);

  if (totalSecs > 0) return totalSecs;

  // Digital format like "12:34" or "1:02:34"
  const colonMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
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

function extractVideoIdFromUrl(url) {
  if (!url) return "";
  const match = String(url).match(/\/video(?:[\.\-_]?)([a-zA-Z0-9]+)/i);
  return match ? match[1] : "";
}

function parseVideosFromHtml(htmlBody) {
  const text = String(htmlBody || "");
  const videos = [];

  // XVideos uses <div id="video_XXXX" data-id="12345" data-eid="XXXX" class="frame-block thumb-block ...">
  const blockRegex = /<div\s+[^>]*?id="video_([^"]+)"[^>]*>([\s\S]*?)<\/script>\s*<\/div>/gi;
  let match;

  while ((match = blockRegex.exec(text)) !== null) {
    const rawEid = match[1];
    const blockContent = match[2];

    const dataIdMatch = blockContent.match(/data-id="(\d+)"/) || match[0].match(/data-id="(\d+)"/);
    const id = rawEid || (dataIdMatch ? dataIdMatch[1] : "");
    if (!id) continue;

    // Title & link
    const titleMatch =
      blockContent.match(/<p\s+class="title"[^>]*>\s*<a\s+[^>]*?title="([^"]+)"/i) ||
      blockContent.match(/<p\s+class="title"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : `Video ${id}`;

    // Thumbnail: data-src or src
    const thumbMatch =
      blockContent.match(/data-src="([^"]+)"/i) ||
      blockContent.match(/src="([^"]+)"/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : "";

    // Preview video (short loop): data-pvv
    const pvvMatch = blockContent.match(/data-pvv="([^"]+)"/i);
    const previewVideo = pvvMatch ? pvvMatch[1] : null;

    // Duration: <span class="duration">3 min</span>
    const durationMatch = blockContent.match(/class="duration"[^>]*>([^<]+)<\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : 0;

    // Quality: <span class="video-hd-mark">1080p</span> or 720p
    const qualityMatch = blockContent.match(/class="video-hd-mark"[^>]*>(\d+)p?<\/span>/i);
    const maxQuality = qualityMatch ? Number.parseInt(qualityMatch[1], 10) : 720;

    // Views: e.g. 108.2k Views
    const viewsMatch = blockContent.match(/([\d\.]+[kMB]?)\s*<span class="sprfluous">Views<\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    // Rating: e.g. 98%
    const ratingMatch = blockContent.match(/(\d{1,3})%/);
    const ratingsPositivePercent = ratingMatch ? Number.parseInt(ratingMatch[1], 10) : null;

    // Author: <a href="/welcomix"><span class="name">Welcomix</span></a>
    const authorMatch = blockContent.match(/<a\s+href="\/([^"#\/?]+)"[^>]*>\s*<span\s+class="name">([^<]+)<\/span>/i);
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

    const title = cleanText(item.tf || item.t || `Video ${id}`);
    const thumbnail = normalizeImageUrl(item.i || item.il || item.ip || item.st1 || "");
    const previewVideo = item.ipu || null;
    const duration = parseDuration(item.d);
    const viewsTotal = parseCompactCount(item.n);
    const ratingsPositivePercent = item.r ? Number.parseInt(String(item.r).replace("%", ""), 10) : null;
    const maxQuality = item.h ? 1080 : 720;
    const authorName = item.pn || item.p || null;
    const authorID = item.p || (item.pu ? item.pu.replace(/^\/+/, "") : null);

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
      consoleLog("error", `XVideos home returned status ${homeStatus}`);
      return false;
    }

    const videos = parseVideosFromHtml(homeResponse.body);
    if (!videos || videos.length === 0) {
      consoleLog("error", "No videos found on XVideos homepage");
      return false;
    }

    const sample = videos[0];
    consoleLog("info", `Parsed ${videos.length} videos. Testing sample video: ${sample.iD}`);

    const metadata = await getVideoMetadata(sample.iD);
    if (!metadata || !metadata.m3u8Uris || Object.keys(metadata.m3u8Uris).length === 0) {
      consoleLog("error", `Failed to extract streams for video ${sample.iD}`);
      return false;
    }

    consoleLog("info", `Functionality test passed! Extracted streams: ${Object.keys(metadata.m3u8Uris).join(", ")}`);
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

    // Video URL: /video.olotaoae447/slug or /video92605018/slug
    const videoMatch = str.match(/\/video(?:[\.\-_]?)([a-zA-Z0-9]+)/i);
    if (videoMatch) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: videoMatch[1],
      });
    }

    // Embed URL: /embedframe/olotaoae447
    const embedMatch = str.match(/\/embedframe\/([a-zA-Z0-9]+)/i);
    if (embedMatch) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: embedMatch[1],
      });
    }

    // Search URL: ?k=query
    const searchMatch = str.match(/[?&]k=([^&#]+)/i);
    if (searchMatch) {
      const pageMatch = str.match(/[?&]p=(\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(searchMatch[1].replace(/\+/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 0,
      });
    }

    // Channels / Profiles / Authors
    const channelMatch =
      str.match(/\/channels\/([^/?#]+)/i) ||
      str.match(/\/profiles\/([^/?#]+)/i) ||
      str.match(/\/pornstars\/([^/?#]+)/i) ||
      str.match(/xvideos\.com\/([a-zA-Z0-9_\-]+)(?:\/|$)/i);

    if (channelMatch && !["new", "tags", "best", "verified", "favorite"].includes(channelMatch[1].toLowerCase())) {
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: channelMatch[1],
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
    const pageNum = Number.parseInt(page || 0, 10);
    const url = pageNum <= 0 ? "https://www.xvideos.com/" : `https://www.xvideos.com/new/${pageNum}`;
    const response = await xvideosRequest(url);

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
  // XVideos does not provide a public REST autocomplete endpoint,
  // return empty array or search query as single suggestion
  return [];
}

async function getSearchResults(request, page) {
  try {
    const pageNum = Number.parseInt(page || 0, 10);
    const query = request?.searchString || "";
    const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}&p=${pageNum}`;

    const response = await xvideosRequest(url);
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
  const idStr = String(videoID || "").trim();
  if (/^\d+$/.test(idStr)) {
    return `https://www.xvideos.com/video${idStr}/_`;
  }
  return `https://www.xvideos.com/video.${idStr}/_`;
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const response = await xvideosRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getVideoMetadata returned status ${getStatusCode(response)} for ${videoId}`);
      return null;
    }

    const html = response.body;

    // 1. Video Title
    const titleMatch =
      html.match(/html5player\.setVideoTitle\('([^']+)'\)/i) ||
      html.match(/<h2\s+class="page-title">([\s\S]*?)<\/h2>/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : (uvp?.title || `Video ${videoId}`);

    // 2. Extracted Streams: HLS & MP4 (keys must be numeric quality strings like "1080", "720" per Hedon Haven contract)
    const m3u8Uris = {};

    const hlsMatch = html.match(/setVideoHLS\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (hlsMatch && hlsMatch[1]) {
      m3u8Uris["1080"] = hlsMatch[1];
    }

    const highMatch = html.match(/setVideoUrlHigh\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (highMatch && highMatch[1]) {
      m3u8Uris["1080"] = m3u8Uris["1080"] || highMatch[1];
    }

    const lowMatch = html.match(/setVideoUrlLow\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (lowMatch && lowMatch[1]) {
      m3u8Uris["720"] = lowMatch[1];
    }

    // Fallback if no streams found directly
    if (Object.keys(m3u8Uris).length === 0) {
      consoleLog("warning", `No playable streams found for ${videoId}`);
    }

    // 3. Thumbnails
    const thumbMatch = html.match(/html5player\.setThumbUrl\('([^']+)'\)/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : (uvp?.thumbnail || null);

    // 4. Tags
    const tags = [];
    const tagRegex = /<a\s+[^>]*?href="\/tags\/([^"\/]+)"[^>]*>([^<]+)<\/a>/gi;
    let tagM;
    while ((tagM = tagRegex.exec(html)) !== null) {
      const cleanTag = cleanText(tagM[2]);
      if (cleanTag && !tags.includes(cleanTag)) {
        tags.push(cleanTag);
      }
    }

    // 5. Uploader info
    const uploaderMatch =
      html.match(/uploader_id":(\d+)[^}]*?"uploader":"([^"]+)"[^}]*?"uploader_url":"([^"]+)"/i) ||
      html.match(/<li\s+class="main-uploader"[^>]*>[\s\S]*?<a\s+href="\/([^"]+)"[^>]*>[\s\S]*?<span\s+class="name">([^<]+)<\/span>/i);
    
    let authorID = uvp?.authorID || null;
    let authorName = uvp?.authorName || null;
    let authorSubscriberCount = null;

    if (uploaderMatch) {
      if (uploaderMatch[2] && uploaderMatch[3]) {
        authorID = uploaderMatch[3].replace(/^\/+/, "");
        authorName = cleanText(uploaderMatch[2]);
      } else if (uploaderMatch[1] && uploaderMatch[2]) {
        authorID = uploaderMatch[1];
        authorName = cleanText(uploaderMatch[2]);
      }
    }

    const subsMatch = html.match(/class="user-subscribe"[^>]*>[\s\S]*?<span\s+class="count">([^<]+)<\/span>/i);
    if (subsMatch) {
      authorSubscriberCount = parseCompactCount(subsMatch[1]);
    }

    // 6. Views
    const viewsMatch =
      html.match(/<div\s+id="v-views"[^>]*>[\s\S]*?<strong[^>]*>([\d,kMB\.]+)<\/strong>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : (uvp?.viewsTotal || null);

    // 7. Duration
    const durationMatch = html.match(/<span\s+class="duration">([^<]+)<\/span>/i);
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
    consoleLog("error", `getVideoMetadata error: ${err.message}`);
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

    // XVideos embeds related videos in `var video_related = [{...}];`
    const relatedMatch = html.match(/var\s+video_related\s*=\s*(\[\s*\{[\s\S]*?\}\s*\]);/i);
    if (relatedMatch) {
      try {
        const parsedJson = JSON.parse(relatedMatch[1]);
        return parseVideosFromJsonList(parsedJson).filter((v) => v.iD !== videoID);
      } catch (jsonErr) {
        consoleLog("warning", `Failed to parse video_related JSON: ${jsonErr.message}`);
      }
    }

    // Fallback: parse video cards from HTML
    return parseVideosFromHtml(html).filter((v) => v.iD !== videoID);
  } catch (err) {
    consoleLog("warning", `getVideoSuggestions error: ${err.message}`);
    return [];
  }
}

function getAuthorUriFromID(authorID) {
  const cleanId = String(authorID || "").replace(/^\/+/, "");
  return `https://www.xvideos.com/${encodeURIComponent(cleanId)}`;
}

async function getAuthorPage(authorID) {
  try {
    const url = getAuthorUriFromID(authorID);
    const response = await xvideosRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getAuthorPage returned status ${getStatusCode(response)} for ${authorID}`);
      return null;
    }

    const html = response.body;

    // Check embedded user JSON
    const userJsonMatch = html.match(/"user":\s*(\{[^}]*?"id_user":[\s\S]*?"url":"[^"]*"\})/i);
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

    // Banner
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
    consoleLog("error", `getAuthorPage error: ${err.message}`);
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

    // XVideos channel videos endpoint
    const url = `https://www.xvideos.com/channels/${encodeURIComponent(authorID)}/videos/best/${pageNum}`;
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
        // Fallback to HTML parsing if not JSON
        return parseVideosFromHtml(response.body);
      }
    }

    return [];
  } catch (err) {
    consoleLog("error", `getAuthorVideos error: ${err.message}`);
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
