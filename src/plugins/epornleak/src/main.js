// ePornLeak Provider Plugin for Hedon Haven.
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
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImageUrl(value) {
  if (!value) return "";
  let url = String(value).trim();
  if (url.startsWith("//")) url = `https:${url}`;
  else if (url.startsWith("/")) url = `${EPORNLEAK_BASE_URL}${url}`;
  // Note: ePornLeak serves valid .webp avatars & .jpg thumbnails directly; do not rewrite .webp -> .jpg.
  return url;
}

function parseDuration(value) {
  const str = String(value || "").trim();
  if (!str) return 0;

  // ISO-8601 duration (e.g. PT18M47S)
  const iso = str.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (iso) {
    return Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0);
  }

  // Digital format like "18:47" or "1:02:34"
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

function parseDateSafe(rawDate) {
  if (!rawDate) return null;
  const cleaned = String(rawDate).trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/, "$1T$2Z");
  const d = new Date(cleaned);
  return Number.isNaN(d.getTime()) ? null : d;
}

function extractVideoSlugFromUrl(url) {
  if (!url) return "";
  const match = String(url).match(/\/video\/([^\/?#]+)/i);
  return match ? match[1] : "";
}

function decodePlayerDataSource(encodedSource, htmlBody) {
  if (!encodedSource) return "";
  const raw = String(encodedSource).trim();

  // Primary: execute the page's own obfuscated f() decoder if present, using QuickJS-safe atob polyfill
  if (htmlBody) {
    const fnMatch = htmlBody.match(/(\(function\s*\(_0x[\s\S]*?function\s+f\(_0x[a-f0-9]+\)\s*\{[\s\S]*?\}\s*)var\s+playerWrap/);
    if (fnMatch) {
      try {
        const atobPolyfill = (b64) => epornleakDecodeBase64Utf8(b64);
        const runner = new Function("atob", "src", `${fnMatch[1]}\nreturn f(src);`);
        const decoded = runner(atobPolyfill, raw);
        if (typeof decoded === "string" && /^https?:\/\//i.test(decoded.trim())) {
          return decoded.trim();
        }
      } catch (err) {
        consoleLog("warning", `Dynamic player decoder fallback triggered: ${err.message}`);
      }
    }
  }

  // Secondary: deterministic 16-char salt strip + reverse + Base64 decode
  if (raw.length > 32) {
    try {
      const inner = raw.slice(16, -16).split("").reverse().join("");
      const candidate = epornleakDecodeBase64Utf8(inner);
      if (/^https?:\/\//i.test(candidate.trim())) {
        return candidate.trim();
      }
    } catch (_) {}
  }

  // Tertiary: scan reversed string for reversed Base64 "https://" ("L6MHc0RHa") or "http://"
  try {
    const reversed = raw.split("").reverse().join("");
    for (const marker of ["aHR0cHM6Ly8", "aHR0cDovLw"]) {
      const idx = reversed.indexOf(marker);
      if (idx >= 0) {
        const candidate = epornleakDecodeBase64Utf8(reversed.slice(idx));
        const urlMatch = candidate.match(/https?:\/\/[^\s"'<>]+/i);
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

  // ePornLeak renders cards inside <div class="ui-card-root ui-card-video">
  const parts = text.split(/<div\s+class="ui-card-root\s+ui-card-video">/i);

  for (let i = 1; i < parts.length; i++) {
    // Stop cleanly before sections/pagination/footer so trailing links don't bleed into the last card
    const chunk = parts[i].split(/<\/section>|<nav\s|<footer/i)[0];

    const linkMatch = chunk.match(/<a\s+class="ui-card-link"\s+href="([^"]+)"(?:\s+title="([^"]*)")?/i);
    if (!linkMatch) continue;

    const id = extractVideoSlugFromUrl(linkMatch[1]);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const titleFromAttr = linkMatch[2] ? cleanText(linkMatch[2]) : "";
    const titleFromTag = chunk.match(/<h3[^>]*class="[^"]*ui-card-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)
      || chunk.match(/class="[^"]*ui-card-title[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const title = titleFromTag ? cleanText(titleFromTag[1]) : (titleFromAttr || `Video ${id}`);

    const thumbMatch =
      chunk.match(/<img\s+class="ui-card-thumbnail"\s+[^>]*?src="([^"]+)"/i) ||
      chunk.match(/<img\s+[^>]*?src="([^"]+\/(?:player|thumbnail)\.(?:jpg|webp)[^"]*)"/i) ||
      chunk.match(/<img\s+[^>]*?src="([^"]+)"/i);
    const thumbnail = thumbMatch ? normalizeImageUrl(thumbMatch[1]) : EPORNLEAK_DEFAULT_ICON;

    const durMatch = chunk.match(/class="ui-card-duration[^"]*"[^>]*>([^<]+)<\/div>/i);
    const duration = durMatch ? parseDuration(durMatch[1]) : null;

    const posterMatch = chunk.match(/<a\s+class="ui-card-poster"\s+href="[^"]*\/model\/([^"\/?#]+)"(?:\s+title="([^"]*)")?/i);
    const posterNameMatch = chunk.match(/class="ui-card-poster-name"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i);
    const authorID = posterMatch ? posterMatch[1] : null;
    const authorName = posterNameMatch
      ? cleanText(posterNameMatch[1])
      : (posterMatch && posterMatch[2] ? cleanText(posterMatch[2]) : null);

    const viewsMatch = chunk.match(/<div\s+class="ui-card-views"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
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
    const homeResponse = await epornleakRequest(`${EPORNLEAK_BASE_URL}/`);
    const homeStatus = getStatusCode(homeResponse);
    if (homeStatus !== 200) {
      consoleLog("error", `ePornLeak home returned status ${homeStatus}`);
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
      consoleLog("error", `Failed to decode stream URL for ${sample.iD}`);
      return false;
    }

    consoleLog("info", `ePornLeak functionality test passed! Stream keys: ${Object.keys(metadata.m3u8Uris).join(", ")}`);
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

    const videoMatch = str.match(/\/video\/([^/?#]+)/i);
    if (videoMatch) {
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: videoMatch[1],
      });
    }

    const modelMatch = str.match(/\/model\/([^/?#]+)/i);
    if (modelMatch) {
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: modelMatch[1],
      });
    }

    const searchMatch = str.match(/[?&]s=([^&#]+)/i);
    if (searchMatch) {
      const pageMatch = str.match(/[?&]page=(\d+)/i);
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: new UniversalSearchRequest({
          searchString: decodeURIComponent(searchMatch[1].replace(/\+/g, " ")),
        }),
        pageCount: pageMatch ? Number.parseInt(pageMatch[1], 10) : 1,
      });
    }

    const catTagMatch = str.match(/\/(?:categories|tags)\/([^/?#]+)/i);
    if (catTagMatch) {
      const pageMatch = str.match(/[?&]page=(\d+)/i);
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
    consoleLog("error", `parseExternalLink error: ${err.message}`);
    return new ExternalLinkParsed({ type: "unknown" });
  }
}

async function getHomePage(page) {
  try {
    const pageNum = Number.parseInt(page || 1, 10);
    const url = pageNum <= 1 ? `${EPORNLEAK_BASE_URL}/` : `${EPORNLEAK_BASE_URL}/?page=${pageNum}`;
    const response = await epornleakRequest(url);
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
    if (!q) return [];
    const response = await epornleakRequest(`${EPORNLEAK_BASE_URL}/suggest?s=${encodeURIComponent(q)}`, {
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
      ? `${EPORNLEAK_BASE_URL}/search?s=${encodeURIComponent(query)}&type=video&page=${pageNum}`
      : `${EPORNLEAK_BASE_URL}/popular?page=${pageNum}`;

    const response = await epornleakRequest(url);
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
  return `${EPORNLEAK_BASE_URL}/video/${cleanId}`;
}

async function getVideoMetadata(videoId, uvp) {
  try {
    const url = getVideoUriFromID(videoId);
    const response = await epornleakRequest(url);
    if (getStatusCode(response) !== 200) {
      consoleLog("error", `getVideoMetadata returned status ${getStatusCode(response)} for ${videoId}`);
      return null;
    }

    const html = response.body;

    // 1. Title
    const titleMatch =
      html.match(/<h1[^>]*class="[^"]*pages-view-video-video-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const title = titleMatch ? cleanText(titleMatch[1]) : (uvp?.title || `Video ${videoId}`);

    // 2. Decode encrypted JWPlayer HLS (.m3u8) stream from #player-wrap[data-source]
    const m3u8Uris = {};
    const dataSourceMatch = html.match(/id="player-wrap"[^>]*?data-source="([^"]+)"/i)
      || html.match(/data-source="([^"]+)"/i);
    if (dataSourceMatch && dataSourceMatch[1]) {
      const decodedUrl = decodePlayerDataSource(dataSourceMatch[1], html);
      if (decodedUrl) {
        m3u8Uris["1080"] = decodedUrl;
      }
    }

    // Fallback for direct <source> or multi-server <iframe> embeds if ever present
    if (Object.keys(m3u8Uris).length === 0) {
      const sourceMatch = html.match(/<source\s+[^>]*?src="([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
      if (sourceMatch && sourceMatch[1]) {
        m3u8Uris["1080"] = sourceMatch[1];
      }
    }

    if (Object.keys(m3u8Uris).length === 0) {
      const iframeRegex = /<iframe\s+[^>]*?src="([^"]+)"[^>]*>/gi;
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
      consoleLog("warning", `No playable stream extracted for ePornLeak video ${videoId}`);
    }

    // 3. Thumbnail
    const thumbMatch =
      html.match(/class="video-poster"\s+[^>]*?src="([^"]+)"/i) ||
      html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const thumbnail = normalizeImageUrl(thumbMatch ? thumbMatch[1] : (uvp?.thumbnail || "")) || EPORNLEAK_DEFAULT_ICON;

    // 4. Author / Creator sheet (.pv-sheet-creator)
    const creatorMatch = html.match(/<a\s+class="pv-sheet-creator"\s+href="[^"]*\/model\/([^"\/?#]+)"/i);
    const creatorNameMatch = html.match(/id="pv-sheet-name"[^>]*>([\s\S]*?)<\/span>/i);
    const creatorAvatarMatch = html.match(/class="pv-sheet-avatar"[^>]*>[\s\S]*?<img\s+[^>]*?src="([^"]+)"/i);

    const safeAuthorID = (creatorMatch ? creatorMatch[1] : null) || uvp?.authorID || "epornleak";
    const safeAuthorName = (creatorNameMatch ? cleanText(creatorNameMatch[1]) : null) || uvp?.authorName || "ePornLeak";
    const authorAvatar = normalizeImageUrl(creatorAvatarMatch ? creatorAvatarMatch[1] : "") || thumbnail || EPORNLEAK_DEFAULT_ICON;

    // 5. Description, Views, Duration, Upload Date
    const descMatch = html.match(/<p\s+id="post-description"[^>]*>([\s\S]*?)<\/p>/i);
    const description = descMatch ? cleanText(descMatch[1]) : null;

    const viewsMatch = html.match(/class="pages-view-video-views"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
    const viewsTotal = viewsMatch ? parseCompactCount(viewsMatch[1]) : (uvp?.viewsTotal ?? null);

    const durationMatch = html.match(/class="pages-view-video-length"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
    const duration = durationMatch ? parseDuration(durationMatch[1]) : (uvp?.duration ?? null);

    const timeMatch = html.match(/<time\s+datetime="([^"]+)"/i);
    const uploadDate = parseDateSafe(timeMatch ? timeMatch[1] : null);

    // 6. Categories & Tags
    const categories = [];
    const catRegex = /<li\s+class="is-category">\s*<a[^>]*><span>([^<]+)<\/span>/gi;
    let catM;
    while ((catM = catRegex.exec(html)) !== null) {
      const val = cleanText(catM[1]);
      if (val && !categories.includes(val)) categories.push(val);
    }

    const tags = [];
    const tagRegex = /<li>\s*<a\s+href="[^"]*\/tags\/[^"]+"\s+rel="tag"><span>([^<]+)<\/span>/gi;
    let tagM;
    while ((tagM = tagRegex.exec(html)) !== null) {
      const val = cleanText(tagM[1]);
      if (val && !tags.includes(val)) tags.push(val);
    }

    return new UniversalVideoMetadata({
      iD: videoId,
      m3u8Uris,
      playbackHttpHeaders: {
        "Referer": `${EPORNLEAK_BASE_URL}/`,
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
    consoleLog("error", `getVideoMetadata error: ${err.message}`);
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
    consoleLog("warning", `getVideoSuggestions error: ${err.message}`);
    return [];
  }
}

function getAuthorUriFromID(authorID) {
  const cleanId = String(authorID || "").trim().replace(/^\/+|\/+$/g, "");
  if (!cleanId || cleanId === "epornleak") {
    return `${EPORNLEAK_BASE_URL}/`;
  }
  return `${EPORNLEAK_BASE_URL}/model/${encodeURIComponent(cleanId)}`;
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
      consoleLog("error", `getAuthorPage returned status ${getStatusCode(response)} for ${cleanId}`);
      return null;
    }

    const html = response.body || "";
    const nameMatch = html.match(/class="[^"]*blocks-model-view-name[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const name = nameMatch ? cleanText(nameMatch[1]) : cleanId;

    const avatarMatch =
      html.match(/blocks-model-view-neighbor-current[\s\S]*?<img\s+src="([^"]+)"/i) ||
      html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const avatar = normalizeImageUrl(avatarMatch ? avatarMatch[1] : "") || EPORNLEAK_DEFAULT_ICON;

    const statsMatch = html.match(/blocks-model-view-stats-value">([\d,]+)<\/div>\s*<div[^>]*>Videos<\/div>/i);
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

    const cleanId = String(authorID || "").trim() || "epornleak";
    const base = getAuthorUriFromID(cleanId);
    const url = pageNum <= 1 ? base : `${base}?page=${pageNum}`;

    const response = await epornleakRequest(url);
    if (getStatusCode(response) !== 200) return [];
    return parseVideosFromHtml(response.body);
  } catch (err) {
    consoleLog("error", `getAuthorVideos error: ${err.message}`);
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
