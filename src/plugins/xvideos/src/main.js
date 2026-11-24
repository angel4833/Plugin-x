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

  // Replace XVideos frontend lazy placeholder THUMBNUM with frame 1
  url = url.replace(/THUMBNUM/g, "1");
  // Replace .avif / .webp with .jpg to ensure compatibility with Flutter Image widget
  return url.replace(/\.(?:avif|webp)(\?.*)?$/i, ".jpg$1");
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

    // Thumbnail: prefer data-src / non-blank src / data-src-avif / data-mzl
    const dataSrcMatch = blockContent.match(/data-src="([^"]+)"/i);
    const srcMatch = blockContent.match(/\ssrc="([^"]+)"/i);
    const avifSrcMatch = blockContent.match(/data-src-avif="([^"]+)"/i);
    const mzlMatch = blockContent.match(/data-mzl="([^"]+)"/i);
    const rawThumb =
      (dataSrcMatch && !/lightbox-blank/i.test(dataSrcMatch[1]) ? dataSrcMatch[1] : "") ||
      (srcMatch && !/lightbox-blank/i.test(srcMatch[1]) ? srcMatch[1] : "") ||
      (avifSrcMatch ? avifSrcMatch[1] : "") ||
      (mzlMatch ? mzlMatch[1] : "");
    const thumbnail = normalizeImageUrl(rawThumb);

    // Preview video (short loop): data-pvv
    const pvvMatch = blockContent.match(/data-pvv="([^"]+)"/i);
    const previewVideo = pvvMatch ? normalizeImageUrl(pvvMatch[1]).replace(/\.jpg$/i, ".mp4") : null;

    // Duration: <span class="duration">3 min</span>
    const durationMatch = blockContent.match(/class="duration"[^>]*>([^<]+)<\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : 0;

    // Quality: <span class="video-hd-mark">1080p</span> or 1440p
    const qualityMatch = blockContent.match(/class="video-hd-mark"[^>]*>(\d+)p?<\/span>/i);
    const maxQuality = qualityMatch ? Number.parseInt(qualityMatch[1], 10) : 720;

    // Views: e.g. 108.2k Views
    const viewsMatch = blockContent.match(/([\d\.]+[kMB]?)\s*<span class="sprfluous">Views<\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : null;

    // Rating: e.g. 98%
    const ratingMatch = blockContent.match(/(\d{1,3})%/);
    const ratingsPositivePercent = ratingMatch ? Number.parseInt(ratingMatch[1], 10) : null;

    // Author: <a href="/welcomix"><span class="name">Welcomix</span></a>
    const authorMatch = blockContent.match(/<a\s+href="\/([^"#\?]+)"[^>]*>\s*<span\s+class="name">([^<]+)<\/span>/i);
    const authorID = authorMatch ? authorMatch[1].replace(/\\\//g, "/").replace(/^\/+|\/+$/g, "") : "xvideos";
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

    const title = cleanText(item.tf || item.t || `Video ${id}`);
    const thumbnail = normalizeImageUrl(item.i || item.il || item.ip || item.st1 || "");
    const previewVideo = item.ipu ? String(item.ipu).trim() : null;
    const duration = parseDuration(item.d);
    const viewsTotal = item.n != null ? parseCompactCount(item.n) : null;
    const ratingsPositivePercent = item.r ? Number.parseInt(String(item.r).replace("%", ""), 10) : null;
    const maxQuality = item.h ? 1080 : 720;
    const authorName = item.pn || item.p || "XVideos";
    const rawAuthorId = item.p || (item.pu ? item.pu : "xvideos");
    const authorID = String(rawAuthorId).replace(/\\\//g, "/").replace(/^\/+|\/+$/g, "") || "xvideos";

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
    if (Number.isNaN(pageNum) || pageNum <= 0) {
      const response = await xvideosRequest("https://www.xvideos.com/");
      if (getStatusCode(response) !== 200) {
        consoleLog("error", `getHomePage returned status ${getStatusCode(response)}`);
        return [];
      }
      return parseVideosFromHtml(response.body);
    }

    // Fetch 2 /new/ pages per step (~54 items) so page size stays >= page 0 (48)
    // and Hedon Haven infinite scroll never stops prematurely after page 1.
    const p1 = pageNum * 2 - 1;
    const p2 = pageNum * 2;
    const [res1, res2] = await Promise.all([
      xvideosRequest(`https://www.xvideos.com/new/${p1}`),
      xvideosRequest(`https://www.xvideos.com/new/${p2}`),
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
    const query = String(request?.searchString || "").trim();
    if (!query) {
      return await getHomePage(pageNum);
    }

    // Fetch 2 search pages per step (~48-50 items) for reliable deep scrolling
    const safePage = Number.isNaN(pageNum) || pageNum < 0 ? 0 : pageNum;
    const p1 = safePage * 2;
    const p2 = safePage * 2 + 1;
    const [res1, res2] = await Promise.all([
      xvideosRequest(`https://www.xvideos.com/?k=${encodeURIComponent(query)}&p=${p1}`),
      xvideosRequest(`https://www.xvideos.com/?k=${encodeURIComponent(query)}&p=${p2}`),
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
        authorID = uploaderMatch[3].replace(/\\\//g, "/").replace(/^\/+|\/+$/g, "");
        authorName = cleanText(uploaderMatch[2]);
      } else if (uploaderMatch[1] && uploaderMatch[2]) {
        authorID = uploaderMatch[1].replace(/\\\//g, "/").replace(/^\/+|\/+$/g, "");
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

function normalizeXVideosAuthorId(authorID) {
  return String(authorID || "").replace(/\\\//g, "/").replace(/^\/+|\/+$/g, "").trim();
}

function getAuthorUriFromID(authorID) {
  const cleanId = normalizeXVideosAuthorId(authorID);
  if (!cleanId || cleanId === "xvideos") {
    return "https://www.xvideos.com/";
  }
  const encodedPath = cleanId.split("/").filter(Boolean).map(encodeURIComponent).join("/");
  return `https://www.xvideos.com/${encodedPath}`;
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
      consoleLog("error", `getAuthorPage returned status ${getStatusCode(response)} for ${cleanId}`);
      return null;
    }

    const html = response.body || "";

    let name = cleanId;
    let avatar = null;
    let banner = null;

    // 1. Check embedded user JSON
    const userJsonMatch = html.match(/"user":\s*(\{[^}]*?"id_user":[\s\S]*?"url":"[^"]*"\})/i);
    if (userJsonMatch) {
      try {
        const userData = JSON.parse(userJsonMatch[1]);
        name = userData.display || userData.username || name;
        avatar = normalizeImageUrl(userData.profile_picture || userData.profile_picture_small);
      } catch (_) {}
    }

    // 2. Profile picture & alt name fallback
    const picMatch = html.match(/class="profile-pic"[\s\S]*?<img[^>]*?\ssrc="([^"]+)"/i);
    if (!avatar && picMatch && picMatch[1]) {
      avatar = normalizeImageUrl(picMatch[1]);
    }
    const altMatch = html.match(/class="profile-pic"[\s\S]*?<img[^>]*?\salt="([^"]+)"/i);
    if (name === cleanId && altMatch && altMatch[1]) {
      name = cleanText(altMatch[1]);
    }

    // 3. <title> fallback for channel/model display name
    if (name === cleanId) {
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const cleaned = cleanText(titleMatch[1]).replace(/\s*-\s*(?:Channel page|Profile page|Pornstar page|Model page|XVIDEOS\.COM).*$/i, "").trim();
        if (cleaned) name = cleaned;
      }
    }

    // 4. Banner, subscribers, total views
    const bannerMatch = html.match(/class="img-responsive"[^>]*src="([^"]+)"/i);
    if (bannerMatch) {
      banner = normalizeImageUrl(bannerMatch[1]);
    }
    const subsMatch = html.match(/Subscribers:<\/strong>\s*<span>([^<]+)<\/span>/i);
    const subscribers = subsMatch ? parseCompactCount(subsMatch[1]) : null;
    const viewsMatch = html.match(/Total video views:<\/strong>\s*<span>([^<]+)<\/span>/i);
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
    consoleLog("error", `getAuthorPage error: ${err.message}`);
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

    // Try channels endpoint first, then profiles endpoint, then rawHtml fallback
    const candidates = [
      `https://www.xvideos.com/channels/${encodeURIComponent(slug)}/videos/best/${pageNum}`,
      `https://www.xvideos.com/profiles/${encodeURIComponent(slug)}/videos/best/${pageNum}`,
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
    consoleLog("error", `getAuthorVideos error: ${err.message}`);
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
