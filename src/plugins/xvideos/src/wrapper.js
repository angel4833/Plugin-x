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
