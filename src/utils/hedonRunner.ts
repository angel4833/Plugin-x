// Hedon Haven QuickJS Environment Simulator for Browser Testing.
// Emulates the Dart/Flutter host bridge with real network requests via /api/proxy.

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface VideoPreviewData {
  iD: string;
  title: string;
  thumbnail: string | null;
  previewVideo?: string | null;
  duration?: number | null;
  viewsTotal?: number | null;
  ratingsPositivePercent?: number | null;
  maxQuality?: number | null;
  authorName?: string | null;
  authorID?: string | null;
  verifiedAuthor?: boolean;
}

export interface VideoMetadataData {
  iD: string;
  title: string;
  m3u8Uris: Record<string, string>;
  playbackHttpHeaders?: Record<string, string> | null;
  authorID?: string | null;
  authorName?: string | null;
  authorSubscriberCount?: number | null;
  authorAvatar?: string | null;
  description?: string | null;
  viewsTotal?: number | null;
  tags?: string[];
  categories?: string[];
  universalVideoPreview?: VideoPreviewData | null;
  rawHtml?: string;
}

export interface AuthorPageData {
  authorID: string;
  name: string;
  avatar?: string | null;
  banner?: string | null;
  subscriberCount?: number | null;
  videoCount?: number | null;
  biography?: string | null;
  verified?: boolean;
}

export interface ExternalLinkResult {
  type: 'videoPage' | 'authorPage' | 'searchResultsPage' | 'unknown';
  iD?: string | null;
  searchRequest?: {
    searchString: string;
  } | null;
  pageCount?: number | null;
}

export class HedonSimulator {
  private logs: LogEntry[] = [];
  private onLogCallback?: (log: LogEntry) => void;
  private cache: Map<string, string> = new Map();
  private runnerEnv: any = null;

  constructor(onLog?: (log: LogEntry) => void) {
    this.onLogCallback = onLog;
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  private addLog(level: 'info' | 'warning' | 'error', message: string) {
    const entry: LogEntry = {
      id: Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message: String(message),
    };
    this.logs.push(entry);
    if (this.onLogCallback) {
      this.onLogCallback(entry);
    }
  }

  /**
   * Emulates Flutter host's native sendMessage handler
   */
  private async handleHostMessage(channel: string, payloadStr: string): Promise<string> {
    try {
      const payload = JSON.parse(payloadStr);

      if (channel === 'consoleLog') {
        const level = payload.level || 'info';
        const msg = payload.message || '';
        this.addLog(level, msg);
        return JSON.stringify({ success: true });
      }

      if (channel === 'httpRequest') {
        const url = payload.url;
        const headers = payload.headers || {};
        this.addLog('info', `[HTTP Request] ${url}`);

        try {
          const res = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, headers }),
          });

          if (!res.ok) {
            const errText = await res.text();
            this.addLog('error', `Proxy error ${res.status}: ${errText}`);
            return JSON.stringify({
              statusCode: res.status,
              status: res.status,
              headers: {},
              body: '',
              bodyBytes: [],
            });
          }

          const data = await res.json();
          this.addLog('info', `[HTTP Response] ${data.statusCode} (${(data.body || '').length} bytes)`);
          return JSON.stringify(data);
        } catch (fetchErr: any) {
          this.addLog('error', `Network fetch failed: ${fetchErr.message}`);
          return JSON.stringify({
            statusCode: 500,
            status: 500,
            headers: {},
            body: '',
            bodyBytes: [],
          });
        }
      }

      if (channel === 'readCacheFile') {
        const content = this.cache.get(payload.filePath) || '';
        return JSON.stringify({
          status: 'success',
          message: content,
        });
      }

      if (channel === 'writeCacheFile') {
        this.cache.set(payload.filePath, payload.contentAsBytes || '');
        return JSON.stringify({
          status: 'success',
          message: `Saved to ${payload.filePath}`,
        });
      }

      return JSON.stringify({ status: 'unknown_channel' });
    } catch (e: any) {
      this.addLog('error', `Host bridge error: ${e.message}`);
      return JSON.stringify({ error: e.message });
    }
  }

  /**
   * Initializes the QuickJS simulated environment by evaluating bundle.js
   */
  public async loadBundle(bundleJs: string): Promise<boolean> {
    this.addLog('info', 'Compiling bundle into simulated QuickJS runtime...');

    try {
      // Sandbox scope with bridge function
      const sendMessage = async (channel: string, payloadStr: string) => {
        return await this.handleHostMessage(channel, payloadStr);
      };

      // Create evaluation function
      const createScope = new Function(
        'sendMessage',
        `
        const scope = {};
        const globalThis = scope;
        ${bundleJs}
        return scope;
        `
      );

      this.runnerEnv = createScope(sendMessage);

      // Call init if present
      if (typeof this.runnerEnv.init === 'function') {
        await this.runnerEnv.init();
      }

      this.addLog('info', 'Bundle compiled & initialized successfully.');
      return true;
    } catch (err: any) {
      this.addLog('error', `Failed to load bundle: ${err.message}`);
      return false;
    }
  }

  public async runFunctionalityTest(): Promise<boolean> {
    if (!this.runnerEnv?.runFunctionalityTest) {
      throw new Error('Plugin does not export runFunctionalityTest');
    }
    return await this.runnerEnv.runFunctionalityTest();
  }

  public async getHomePage(page: number = 0): Promise<VideoPreviewData[]> {
    if (!this.runnerEnv?.getHomePage) {
      throw new Error('Plugin does not export getHomePage');
    }
    return await this.runnerEnv.getHomePage(page);
  }

  public async getSearchResults(query: string, page: number = 0): Promise<VideoPreviewData[]> {
    if (!this.runnerEnv?.getSearchResults) {
      throw new Error('Plugin does not export getSearchResults');
    }
    return await this.runnerEnv.getSearchResults({ searchString: query }, page);
  }

  public async getVideoMetadata(videoId: string): Promise<VideoMetadataData | null> {
    if (!this.runnerEnv?.getVideoMetadata) {
      throw new Error('Plugin does not export getVideoMetadata');
    }
    return await this.runnerEnv.getVideoMetadata(videoId, null);
  }

  public async getVideoSuggestions(videoId: string): Promise<VideoPreviewData[]> {
    if (!this.runnerEnv?.getVideoSuggestions) {
      throw new Error('Plugin does not export getVideoSuggestions');
    }
    return await this.runnerEnv.getVideoSuggestions(videoId, null, 0);
  }

  public async getAuthorPage(authorId: string): Promise<AuthorPageData | null> {
    if (!this.runnerEnv?.getAuthorPage) {
      throw new Error('Plugin does not export getAuthorPage');
    }
    return await this.runnerEnv.getAuthorPage(authorId);
  }

  public async getAuthorVideos(authorId: string, page: number = 0): Promise<VideoPreviewData[]> {
    if (!this.runnerEnv?.getAuthorVideos) {
      throw new Error('Plugin does not export getAuthorVideos');
    }
    return await this.runnerEnv.getAuthorVideos(authorId, null, page);
  }

  public async parseExternalLink(url: string): Promise<ExternalLinkResult> {
    if (!this.runnerEnv?.parseExternalLink) {
      throw new Error('Plugin does not export parseExternalLink');
    }
    return await this.runnerEnv.parseExternalLink(url);
  }
}
