import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Download,
  Terminal,
  Code2,
  Search,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Folder,
  Plus,
  Copy,
  Eye,
  Clock,
  ShieldCheck,
  Film,
  User,
  Layers,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Check,
  Trash2,
  Tv,
  ArrowUpRight,
  Settings,
  Flame,
} from 'lucide-react';
import {
  PluginDefinition,
  createPluginZipBlob,
  downloadBlob,
  generateBundleJs,
} from './utils/pluginBundler';
import {
  HedonSimulator,
  LogEntry,
  VideoPreviewData,
  VideoMetadataData,
  AuthorPageData,
  ExternalLinkResult,
} from './utils/hedonRunner';
import { xvideosPluginDef, epornleakPluginDef, createNewPluginTemplate } from './data/pluginsData';

type ActiveView = 'simulator' | 'code' | 'new-plugin' | 'docs';
type SimTab = 'home' | 'search' | 'player' | 'author' | 'link';

export default function App() {
  // Plugin State
  const [plugins, setPlugins] = useState<PluginDefinition[]>([xvideosPluginDef, epornleakPluginDef]);
  const [activePluginId, setActivePluginId] = useState<string>('xvideos');
  const activePlugin = plugins.find((p) => p.id === activePluginId) || plugins[0];

  // Navigation
  const [activeView, setActiveView] = useState<ActiveView>('simulator');
  const [simTab, setSimTab] = useState<SimTab>('home');
  const [selectedFile, setSelectedFile] = useState<string>('src/main.js');

  // Logs & Simulator
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [isSimLoading, setIsSimLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Simulator Results
  const [homeVideos, setHomeVideos] = useState<VideoPreviewData[]>([]);
  const [homePage, setHomePage] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState<string>('anime');
  const [searchPage, setSearchPage] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<VideoPreviewData[]>([]);

  const [inspectVideoId, setInspectVideoId] = useState<string>('olotaoae447');
  const [inspectMetadata, setInspectMetadata] = useState<VideoMetadataData | null>(null);
  const [suggestedVideos, setSuggestedVideos] = useState<VideoPreviewData[]>([]);
  const [activeStreamQuality, setActiveStreamQuality] = useState<string>('');

  const [authorInput, setAuthorInput] = useState<string>('welcomix');
  const [authorPageData, setAuthorPageData] = useState<AuthorPageData | null>(null);
  const [authorVideos, setAuthorVideos] = useState<VideoPreviewData[]>([]);

  const [linkInput, setLinkInput] = useState<string>(
    'https://www.xvideos.com/video.olotaoae447/fucking_her_big_ass_in_the_kitchen'
  );
  const [linkResult, setLinkResult] = useState<ExternalLinkResult | null>(null);

  // New Plugin Modal
  const [newPluginName, setNewPluginName] = useState<string>('');
  const [newPluginDomain, setNewPluginDomain] = useState<string>('');
  const [newPluginCodeName, setNewPluginCodeName] = useState<string>('');

  // Runner Reference
  const simulatorRef = useRef<HedonSimulator | null>(null);

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [log, ...prev.slice(0, 150)]);
  };

  // Initialize Simulator when plugin or view changes
  useEffect(() => {
    const sim = new HedonSimulator(addLog);
    simulatorRef.current = sim;
    const bundle = generateBundleJs(activePlugin);
    sim.loadBundle(bundle).then((success) => {
      if (success) {
        setStatusMessage(`Plugin ${activePlugin.name} listo en QuickJS`);
      }
    });
  }, [activePlugin]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Compile and Download Zip
  const handleDownloadZip = async () => {
    try {
      setStatusMessage('Empaquetando plugin.zip para Hedon Haven...');
      const blob = await createPluginZipBlob(activePlugin);
      downloadBlob(blob, `${activePlugin.id}-plugin.zip`);
      setStatusMessage(`¡Descargado ${activePlugin.id}-plugin.zip exitosamente!`);
    } catch (err: any) {
      alert(`Error al generar ZIP: ${err.message}`);
    }
  };

  const handleDownloadBundle = () => {
    const bundle = generateBundleJs(activePlugin);
    const blob = new Blob([bundle], { type: 'application/javascript;charset=utf-8' });
    downloadBlob(blob, 'bundle.js');
  };

  // Simulator actions
  const handleRunHealthCheck = async () => {
    if (!simulatorRef.current) return;
    setIsSimLoading(true);
    setStatusMessage('Ejecutando runFunctionalityTest()...');
    try {
      const ok = await simulatorRef.current.runFunctionalityTest();
      if (ok) {
        setStatusMessage('✅ Test de salud superado con éxito');
      } else {
        setStatusMessage('⚠️ El test de salud falló o fue bloqueado');
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleFetchHome = async (pageToFetch: number = homePage) => {
    if (!simulatorRef.current) return;
    setIsSimLoading(true);
    try {
      const videos = await simulatorRef.current.getHomePage(pageToFetch);
      setHomeVideos(videos);
      setHomePage(pageToFetch);
      setStatusMessage(`Se cargaron ${videos.length} videos de la página principal (pág ${pageToFetch})`);
    } catch (err: any) {
      setStatusMessage(`Error cargando feed: ${err.message}`);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleSearch = async (pageToFetch: number = 0) => {
    if (!simulatorRef.current || !searchQuery.trim()) return;
    setIsSimLoading(true);
    try {
      const results = await simulatorRef.current.getSearchResults(searchQuery.trim(), pageToFetch);
      setSearchResults(results);
      setSearchPage(pageToFetch);
      setStatusMessage(`Búsqueda "${searchQuery}": ${results.length} resultados`);
    } catch (err: any) {
      setStatusMessage(`Error en búsqueda: ${err.message}`);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleInspectVideo = async (videoIdToInspect: string = inspectVideoId) => {
    if (!simulatorRef.current || !videoIdToInspect.trim()) return;
    setIsSimLoading(true);
    setSimTab('player');
    setInspectVideoId(videoIdToInspect);
    try {
      const meta = await simulatorRef.current.getVideoMetadata(videoIdToInspect);
      setInspectMetadata(meta);

      if (meta?.m3u8Uris) {
        const qualities = Object.keys(meta.m3u8Uris);
        if (qualities.length > 0) {
          setActiveStreamQuality(qualities[0]);
        }
      }

      // Also fetch related
      const suggestions = await simulatorRef.current.getVideoSuggestions(videoIdToInspect);
      setSuggestedVideos(suggestions);

      setStatusMessage(`Metadatos extraídos para ${videoIdToInspect}`);
    } catch (err: any) {
      setStatusMessage(`Error al inspeccionar video: ${err.message}`);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleFetchAuthor = async (author: string = authorInput) => {
    if (!simulatorRef.current || !author.trim()) return;
    setIsSimLoading(true);
    try {
      const pageInfo = await simulatorRef.current.getAuthorPage(author);
      setAuthorPageData(pageInfo);

      const vids = await simulatorRef.current.getAuthorVideos(author, 0);
      setAuthorVideos(vids);
      setStatusMessage(`Canal ${author}: ${vids.length} videos cargados`);
    } catch (err: any) {
      setStatusMessage(`Error cargando canal: ${err.message}`);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleTestLink = async () => {
    if (!simulatorRef.current || !linkInput.trim()) return;
    setIsSimLoading(true);
    try {
      const res = await simulatorRef.current.parseExternalLink(linkInput.trim());
      setLinkResult(res);
      setStatusMessage(`Enlace clasificado como tipo: ${res.type}`);
    } catch (err: any) {
      setStatusMessage(`Error clasificando enlace: ${err.message}`);
    } finally {
      setIsSimLoading(false);
    }
  };

  const handleCreateNewPlugin = () => {
    if (!newPluginName.trim() || !newPluginDomain.trim()) {
      alert('Por favor ingresa el nombre y el dominio del sitio');
      return;
    }
    const created = createNewPluginTemplate(newPluginName, newPluginDomain, newPluginCodeName);
    setPlugins((prev) => [...prev, created]);
    setActivePluginId(created.id);
    setActiveView('simulator');
    setNewPluginName('');
    setNewPluginDomain('');
    setNewPluginCodeName('');
    setStatusMessage(`¡Plugin para ${created.name} creado exitosamente!`);
  };

  // Helper to get selected code file content
  const getSelectedFileContent = (): string => {
    switch (selectedFile) {
      case 'plugin.yaml':
        return activePlugin.yamlContent;
      case 'src/bridge_functions.js':
        return activePlugin.sourceFiles.bridge;
      case 'src/universal_formats.js':
        return activePlugin.sourceFiles.universal;
      case 'src/session.js':
        return activePlugin.sourceFiles.session;
      case 'src/main.js':
        return activePlugin.sourceFiles.main;
      case 'src/wrapper.js':
        return activePlugin.sourceFiles.wrapper;
      case 'update.yaml':
        return activePlugin.updateYamlContent;
      case 'bundle.js':
        return generateBundleJs(activePlugin);
      default:
        return activePlugin.sourceFiles.main;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100 antialiased selection:bg-rose-500/30 selection:text-rose-200">
      {/* Sidebar Navigation */}
      <aside className="flex w-64 flex-col border-r border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800/80 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-lg shadow-rose-950/50">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white">Hedon Studio</span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                v1.0
              </span>
            </div>
            <p className="text-xs text-neutral-400">Plugin Builder & Runner</p>
          </div>
        </div>

        {/* Plugin Selector Dropdown */}
        <div className="p-3">
          <label className="mb-1.5 block text-[11px] font-medium tracking-wide text-neutral-400 uppercase">
            Plugin Activo
          </label>
          <div className="relative">
            <select
              value={activePluginId}
              onChange={(e) => setActivePluginId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-neutral-700/60 bg-neutral-800/90 py-2 pr-8 pl-3 text-sm font-medium text-white shadow-sm transition hover:border-neutral-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {plugins.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.codeName})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-3 right-2.5 h-4 w-4 text-neutral-400" />
          </div>
          <p className="mt-1.5 text-[11px] text-neutral-500 truncate" title={activePlugin.serviceUrl}>
            Host: <span className="text-neutral-400 font-mono">{activePlugin.serviceUrl}</span>
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <nav className="flex-1 space-y-1 p-3">
          <button
            onClick={() => setActiveView('simulator')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeView === 'simulator'
                ? 'bg-rose-500/15 text-rose-400 shadow-sm'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Simulador y Pruebas</span>
          </button>

          <button
            onClick={() => setActiveView('code')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeView === 'code'
                ? 'bg-rose-500/15 text-rose-400 shadow-sm'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Código & bundle.js</span>
          </button>

          <button
            onClick={() => setActiveView('new-plugin')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeView === 'new-plugin'
                ? 'bg-rose-500/15 text-rose-400 shadow-sm'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Crear Otro Plugin</span>
          </button>

          <button
            onClick={() => setActiveView('docs')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeView === 'docs'
                ? 'bg-rose-500/15 text-rose-400 shadow-sm'
                : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Guía QuickJS & API</span>
          </button>
        </nav>

        {/* Quick Actions at Bottom of Sidebar */}
        <div className="border-t border-neutral-800/80 p-3 space-y-2">
          <button
            onClick={handleDownloadZip}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 py-2.5 px-3 text-xs font-semibold text-white shadow-md shadow-rose-950/40 transition hover:from-rose-500 hover:to-rose-400 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Descargar plugin.zip</span>
          </button>

          <button
            onClick={handleDownloadBundle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700/80 bg-neutral-800/80 py-2 px-3 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700/80 hover:text-white active:scale-[0.98]"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Exportar bundle.js</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-neutral-800/80 bg-neutral-900/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-medium text-neutral-300">
              {statusMessage || `QuickJS Bridge Activo • ${activePlugin.name}`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunHealthCheck}
              disabled={isSimLoading}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700/70 bg-neutral-800/70 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSimLoading ? 'animate-spin' : ''}`} />
              <span>Test de Salud (runFunctionalityTest)</span>
            </button>

            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                isConsoleOpen
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  : 'border-neutral-700/70 bg-neutral-800/70 text-neutral-400 hover:text-white'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Consola QuickJS ({logs.length})</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-950 p-6">
          {/* VIEW: SIMULATOR & TEST RUNNER */}
          {activeView === 'simulator' && (
            <div className="space-y-6">
              {/* Simulator Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div className="flex gap-2 rounded-xl bg-neutral-900 p-1 border border-neutral-800/70">
                  <button
                    onClick={() => setSimTab('home')}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      simTab === 'home'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Tv className="h-3.5 w-3.5" />
                    <span>Página Principal</span>
                  </button>

                  <button
                    onClick={() => setSimTab('search')}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      simTab === 'search'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Búsqueda</span>
                  </button>

                  <button
                    onClick={() => setSimTab('player')}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      simTab === 'player'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Reproductor & Streams</span>
                  </button>

                  <button
                    onClick={() => setSimTab('author')}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      simTab === 'author'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Creadores / Canales</span>
                  </button>

                  <button
                    onClick={() => setSimTab('link')}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                      simTab === 'link'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Parser de Enlaces</span>
                  </button>
                </div>
              </div>

              {/* SIM TAB 1: HOME FEED */}
              {simTab === 'home' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Explorador de Portada (getHomePage)
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Prueba la extracción del catálogo principal y la paginación de videos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs">
                        <span className="text-neutral-400 mr-2">Página:</span>
                        <input
                          type="number"
                          min="0"
                          value={homePage}
                          onChange={(e) => setHomePage(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-bold text-white focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleFetchHome(homePage)}
                        disabled={isSimLoading}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isSimLoading ? 'animate-spin' : ''}`} />
                        <span>Cargar Portada</span>
                      </button>
                    </div>
                  </div>

                  {homeVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 py-16 text-center">
                      <Tv className="h-10 w-10 text-neutral-600 mb-3" />
                      <p className="text-sm font-medium text-neutral-400">
                        Haz clic en "Cargar Portada" para ejecutar <code className="text-rose-400">getHomePage({homePage})</code>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        La petición se procesa en tiempo real simulando el entorno QuickJS de Hedon Haven.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {homeVideos.map((video) => (
                        <div
                          key={video.iD}
                          onClick={() => handleInspectVideo(video.iD)}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition hover:border-neutral-700 hover:shadow-xl hover:shadow-neutral-950/50 cursor-pointer"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                            {video.thumbnail ? (
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-600">
                                Sin Miniatura
                              </div>
                            )}

                            {/* Badges */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                              {video.maxQuality && (
                                <span className="rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
                                  {video.maxQuality}p
                                </span>
                              )}
                              {video.duration ? (
                                <span className="rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                  {Math.floor(video.duration / 60)}:
                                  {String(video.duration % 60).padStart(2, '0')}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col p-3">
                            <h4
                              className="line-clamp-2 text-xs font-medium text-neutral-200 group-hover:text-rose-300"
                              title={video.title}
                            >
                              {video.title}
                            </h4>

                            <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-neutral-500">
                              <span className="truncate text-neutral-400 font-medium">
                                {video.authorName || 'Desconocido'}
                              </span>
                              {video.viewsTotal ? (
                                <span>{video.viewsTotal.toLocaleString()} vistas</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SIM TAB 2: SEARCH */}
              {simTab === 'search' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch(0)}
                          placeholder="Buscar videos en el proveedor..."
                          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2 pr-4 pl-9 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs">
                        <span className="text-neutral-400 mr-2">Página:</span>
                        <input
                          type="number"
                          min="0"
                          value={searchPage}
                          onChange={(e) => setSearchPage(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 bg-transparent text-center font-bold text-white focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleSearch(searchPage)}
                        disabled={isSimLoading}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Ejecutar Búsqueda</span>
                      </button>
                    </div>

                    {/* Quick Query Pills */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <span>Sugerencias rápidas:</span>
                      {['anime', 'milf', 'latina', 'hentai', 'cosplay', 'massage'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearchQuery(tag);
                            // Run search immediately
                            if (simulatorRef.current) {
                              simulatorRef.current.getSearchResults(tag, 0).then((res) => {
                                setSearchResults(res);
                                setSearchPage(0);
                              });
                            }
                          }}
                          className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300 transition hover:border-rose-500 hover:text-white"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {searchResults.map((video) => (
                        <div
                          key={video.iD}
                          onClick={() => handleInspectVideo(video.iD)}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition hover:border-neutral-700 hover:shadow-xl cursor-pointer"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                            {video.thumbnail && (
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                              {video.maxQuality && (
                                <span className="rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                                  {video.maxQuality}p
                                </span>
                              )}
                              {video.duration ? (
                                <span className="rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                  {Math.floor(video.duration / 60)}:
                                  {String(video.duration % 60).padStart(2, '0')}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="line-clamp-2 text-xs font-medium text-neutral-200 group-hover:text-rose-300">
                              {video.title}
                            </h4>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                              <span className="truncate text-neutral-400">{video.authorName}</span>
                              {video.viewsTotal ? <span>{video.viewsTotal.toLocaleString()} vistas</span> : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SIM TAB 3: PLAYER & STREAM EXTRACTOR */}
              {simTab === 'player' && (
                <div className="space-y-6">
                  {/* Video ID Input Bar */}
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <div className="flex-1 min-w-[260px]">
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                        ID o URL del video a inspeccionar
                      </label>
                      <input
                        type="text"
                        value={inspectVideoId}
                        onChange={(e) => setInspectVideoId(e.target.value)}
                        placeholder="Ej: olotaoae447 o 92605018"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleInspectVideo(inspectVideoId)}
                      disabled={isSimLoading}
                      className="mt-5 flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                    >
                      <Film className="h-3.5 w-3.5" />
                      <span>Extraer Streams & Metadatos</span>
                    </button>
                  </div>

                  {inspectMetadata ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      {/* Player & Stream Details */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Video Player Box */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-2xl">
                          {activeStreamQuality && inspectMetadata.m3u8Uris[activeStreamQuality] ? (
                            <video
                              key={inspectMetadata.m3u8Uris[activeStreamQuality]}
                              controls
                              className="h-full w-full"
                              poster={inspectMetadata.universalVideoPreview?.thumbnail || undefined}
                              src={inspectMetadata.m3u8Uris[activeStreamQuality]}
                            >
                              Tu navegador no soporta la reproducción directa de este stream.
                            </video>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-500 text-xs">
                              Selecciona una calidad de stream a continuación
                            </div>
                          )}
                        </div>

                        {/* Title and stats */}
                        <div>
                          <h2 className="text-base font-bold text-white">
                            {inspectMetadata.title}
                          </h2>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                            {inspectMetadata.authorName && (
                              <button
                                onClick={() => {
                                  if (inspectMetadata.authorID) {
                                    setAuthorInput(inspectMetadata.authorID);
                                    setSimTab('author');
                                    handleFetchAuthor(inspectMetadata.authorID);
                                  }
                                }}
                                className="flex items-center gap-1.5 font-semibold text-rose-400 hover:underline"
                              >
                                <User className="h-3.5 w-3.5" />
                                <span>{inspectMetadata.authorName}</span>
                                {inspectMetadata.authorSubscriberCount && (
                                  <span className="text-neutral-500">
                                    ({inspectMetadata.authorSubscriberCount.toLocaleString()} subs)
                                  </span>
                                )}
                              </button>
                            )}
                            {inspectMetadata.viewsTotal && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {inspectMetadata.viewsTotal.toLocaleString()} vistas
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Extracted Stream List */}
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
                          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                            Streams Extraídos para Hedon Haven (m3u8Uris)
                          </h4>

                          <div className="space-y-2">
                            {Object.entries(inspectMetadata.m3u8Uris).map(([quality, streamUrl]) => (
                              <div
                                key={quality}
                                className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 transition ${
                                  activeStreamQuality === quality
                                    ? 'border-rose-500/60 bg-rose-500/10'
                                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setActiveStreamQuality(quality)}
                                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                                      activeStreamQuality === quality
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                    }`}
                                  >
                                    {quality}
                                  </button>
                                  <span className="font-mono text-[11px] text-neutral-400 truncate max-w-xs md:max-w-md">
                                    {streamUrl}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => copyToClipboard(streamUrl, quality)}
                                    className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                    title="Copiar URL directa"
                                  >
                                    {copiedText === quality ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <a
                                    href={streamUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                    title="Abrir en pestaña nueva"
                                  >
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        {inspectMetadata.tags && inspectMetadata.tags.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs text-neutral-400 font-medium">Etiquetas:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {inspectMetadata.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-300"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Suggestions / Related */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                          <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                            Sugerencias de Video (getVideoSuggestions)
                          </h4>

                          {suggestedVideos.length === 0 ? (
                            <p className="text-xs text-neutral-500">Sin sugerencias adicionales.</p>
                          ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                              {suggestedVideos.map((sug) => (
                                <div
                                  key={sug.iD}
                                  onClick={() => handleInspectVideo(sug.iD)}
                                  className="group flex gap-2.5 rounded-lg border border-neutral-800/80 bg-neutral-900/70 p-2 transition hover:border-neutral-700 cursor-pointer"
                                >
                                  <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded bg-neutral-950">
                                    {sug.thumbnail && (
                                      <img
                                        src={sug.thumbnail}
                                        alt={sug.title}
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                    {sug.duration ? (
                                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[9px] text-white">
                                        {Math.floor(sug.duration / 60)}:
                                        {String(sug.duration % 60).padStart(2, '0')}
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <h5 className="line-clamp-2 text-xs font-medium text-neutral-200 group-hover:text-rose-300">
                                      {sug.title}
                                    </h5>
                                    <p className="mt-1 text-[10px] text-neutral-500 truncate">
                                      {sug.authorName} • {sug.viewsTotal?.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 py-16 text-center">
                      <Film className="h-10 w-10 text-neutral-600 mb-3" />
                      <p className="text-sm font-medium text-neutral-400">
                        Ingresa un ID de video y pulsa "Extraer Streams" para probar la reproducción.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SIM TAB 4: AUTHOR / CHANNELS */}
              {simTab === 'author' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <div className="flex-1 min-w-[240px]">
                      <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                        Slug o Nombre del Creador / Canal
                      </label>
                      <input
                        type="text"
                        value={authorInput}
                        onChange={(e) => setAuthorInput(e.target.value)}
                        placeholder="Ej: welcomix, hotbhabhi18, tufosbr"
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleFetchAuthor(authorInput)}
                      disabled={isSimLoading}
                      className="mt-5 flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Cargar Perfil y Catálogo</span>
                    </button>
                  </div>

                  {authorPageData && (
                    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50">
                      {authorPageData.banner && (
                        <div className="h-32 w-full overflow-hidden bg-neutral-950">
                          <img
                            src={authorPageData.banner}
                            alt="Banner"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          {authorPageData.avatar ? (
                            <img
                              src={authorPageData.avatar}
                              alt={authorPageData.name}
                              className="h-16 w-16 rounded-full border-2 border-rose-500 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-lg font-bold text-white">
                              {authorPageData.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              {authorPageData.name}
                              {authorPageData.verified && (
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                              )}
                            </h3>
                            <p className="text-xs text-neutral-400">
                              ID de Canal: <span className="font-mono text-neutral-300">{authorPageData.authorID}</span>
                            </p>
                          </div>
                        </div>

                        {/* Videos */}
                        <div className="mt-6 border-t border-neutral-800 pt-6">
                          <h4 className="text-sm font-semibold text-white mb-4">
                            Videos del Creador ({authorVideos.length})
                          </h4>

                          {authorVideos.length === 0 ? (
                            <p className="text-xs text-neutral-500">Sin videos en esta página.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                              {authorVideos.map((v) => (
                                <div
                                  key={v.iD}
                                  onClick={() => handleInspectVideo(v.iD)}
                                  className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-700 cursor-pointer"
                                >
                                  <div className="relative aspect-video w-full bg-black">
                                    {v.thumbnail && (
                                      <img
                                        src={v.thumbnail}
                                        alt={v.title}
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                    {v.duration ? (
                                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] text-white">
                                        {Math.floor(v.duration / 60)}:
                                        {String(v.duration % 60).padStart(2, '0')}
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="p-2.5">
                                    <h5 className="line-clamp-2 text-xs font-medium text-neutral-200 group-hover:text-rose-300">
                                      {v.title}
                                    </h5>
                                    <p className="mt-1 text-[10px] text-neutral-500">
                                      {v.viewsTotal?.toLocaleString()} vistas
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SIM TAB 5: LINK PARSER */}
              {simTab === 'link' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
                    <label className="block text-xs font-semibold text-neutral-300">
                      Pegar URL externa para probar parseExternalLink(url)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="https://www.xvideos.com/video.olotaoae447/..."
                        className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
                      />
                      <button
                        onClick={handleTestLink}
                        disabled={isSimLoading}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Clasificar URL</span>
                      </button>
                    </div>

                    {/* Preset URLs */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
                      <span>Probar presets:</span>
                      {[
                        { label: 'Video Page', url: 'https://www.xvideos.com/video.olotaoae447/fucking_her_big_ass' },
                        { label: 'Search Page', url: 'https://www.xvideos.com/?k=anime&p=2' },
                        { label: 'Author Page', url: 'https://www.xvideos.com/channels/welcomix' },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => {
                            setLinkInput(p.url);
                          }}
                          className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300 transition hover:border-rose-500 hover:text-white"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {linkResult && (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        Resultado devuelto por parseExternalLink
                      </h4>
                      <div className="rounded-lg bg-neutral-950 p-4 font-mono text-xs text-emerald-400">
                        <pre>{JSON.stringify(linkResult, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SOURCE CODE EXPLORER */}
          {activeView === 'code' && (
            <div className="flex h-full gap-6">
              {/* File Selector */}
              <div className="w-56 shrink-0 space-y-1">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Archivos del Plugin
                </span>

                {[
                  { id: 'plugin.yaml', label: 'plugin.yaml (Manifiesto)', icon: FileText },
                  { id: 'src/main.js', label: 'src/main.js (Scraper Core)', icon: Code2 },
                  { id: 'src/session.js', label: 'src/session.js (Cookies/HTTP)', icon: Code2 },
                  { id: 'src/universal_formats.js', label: 'src/universal_formats.js (Tipos)', icon: Code2 },
                  { id: 'src/bridge_functions.js', label: 'src/bridge_functions.js (Host)', icon: Code2 },
                  { id: 'src/wrapper.js', label: 'src/wrapper.js (QuickJS)', icon: Code2 },
                  { id: 'update.yaml', label: 'update.yaml (Release)', icon: FileText },
                  { id: 'bundle.js', label: 'bundle.js (Compilado)', icon: Layers },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedFile(item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                        selectedFile === item.id
                          ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30'
                          : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Code Viewer */}
              <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60">
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-2.5">
                  <span className="font-mono text-xs font-medium text-neutral-300">{selectedFile}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(getSelectedFileContent(), selectedFile)}
                      className="flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
                    >
                      {copiedText === selectedFile ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar Archivo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-neutral-950 p-4">
                  <pre className="font-mono text-xs leading-relaxed text-neutral-300 selection:bg-rose-500/40">
                    {getSelectedFileContent()}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: NEW PLUGIN GENERATOR */}
          {activeView === 'new-plugin' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Generar Plugin para Otro Sitio</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Como mencionaste que harás plugins de varios sitios, utiliza esta herramienta para crear automáticamente la estructura base con el contrato oficial de Hedon Haven.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nombre del Sitio / Servicio
                  </label>
                  <input
                    type="text"
                    value={newPluginName}
                    onChange={(e) => {
                      setNewPluginName(e.target.value);
                      if (!newPluginCodeName) {
                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setNewPluginCodeName(`com.hedonhaven.${slug}`);
                      }
                    }}
                    placeholder="Ej: SpankBang, Pornhub, Eporner, YouPorn..."
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Dominio Web Principal
                  </label>
                  <input
                    type="text"
                    value={newPluginDomain}
                    onChange={(e) => setNewPluginDomain(e.target.value)}
                    placeholder="Ej: spankbang.com o www.pornhub.com"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Identificador de Paquete (CodeName)
                  </label>
                  <input
                    type="text"
                    value={newPluginCodeName}
                    onChange={(e) => setNewPluginCodeName(e.target.value)}
                    placeholder="Ej: com.hedonhaven.spankbang"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCreateNewPlugin}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-500 active:scale-[0.99]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Crear Esqueleto del Plugin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: DOCS & SPECIFICATION */}
          {activeView === 'docs' && (
            <div className="max-w-3xl space-y-6 text-neutral-300 text-xs leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-white">
                  Especificación de Plugins para Hedon Haven
                </h2>
                <p className="text-neutral-400 mt-1">
                  Hedon Haven es un agregador multiplataforma en Flutter que ejecuta plugins mediante QuickJS.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">📦 Requisitos del Paquete ZIP</h3>
                <p>
                  Para instalar un plugin en la aplicación Hedon Haven, el archivo <code className="text-rose-400">plugin.zip</code> debe contener en su raíz:
                </p>
                <div className="rounded-lg bg-neutral-950 p-3 font-mono text-[11px] text-neutral-300">
                  plugin.zip<br />
                  ├── plugin.yaml &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Manifiesto del plugin<br />
                  └── bundle.js &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Archivo JS concatenado único<br />
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">🔌 Puente Dart/Flutter (Host Bridge)</h3>
                <p>
                  Debido a que QuickJS no dispone de la API de red estándar del navegador, las funciones host son:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <strong className="text-neutral-200">httpRequest(url, headers):</strong> Hace peticiones HTTP con la red nativa del dispositivo (sin problemas de CORS).
                  </li>
                  <li>
                    <strong className="text-neutral-200">consoleLog(level, message):</strong> Emite mensajes hacia el visor de logs de Hedon Haven.
                  </li>
                  <li>
                    <strong className="text-neutral-200">readCacheFile / writeCacheFile:</strong> Lee y guarda archivos de caché locales (imágenes, sesiones).
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white">📱 ¿Cómo instalar el .zip en Hedon Haven?</h3>
                <ol className="list-decimal pl-5 space-y-2 text-neutral-400">
                  <li>Haz clic en el botón <strong className="text-rose-400">Descargar plugin.zip</strong> en esta barra lateral.</li>
                  <li>Transfiere el archivo <code className="text-neutral-200">.zip</code> a tu dispositivo móvil o computadora.</li>
                  <li>Abre la aplicación <strong>Hedon Haven</strong>.</li>
                  <li>Ve a <strong>Settings (Ajustes) $\rightarrow$ Plugins $\rightarrow$ Install external plugin (.zip)</strong>.</li>
                  <li>Selecciona el archivo ZIP descargado. ¡El plugin aparecerá listo y activo de inmediato!</li>
                </ol>
              </div>
            </div>
          )}
        </main>

        {/* Collapsible Console Drawer */}
        {isConsoleOpen && (
          <div className="flex h-52 flex-col border-t border-neutral-800 bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-850 bg-neutral-900/80 px-4 py-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-neutral-400" />
                <span className="font-semibold text-neutral-300">QuickJS Debug Console</span>
                <span className="rounded bg-neutral-800 px-1.5 text-[10px] text-neutral-400">
                  {logs.length} logs
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Limpiar</span>
                </button>
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="rounded px-1.5 py-0.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1">
              {logs.length === 0 ? (
                <div className="text-neutral-600 italic">No hay logs en el búfer. Ejecuta una acción en el simulador.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-neutral-600 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`font-semibold shrink-0 uppercase text-[10px] px-1 rounded ${
                        log.level === 'error'
                          ? 'bg-rose-950 text-rose-400'
                          : log.level === 'warning'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-neutral-850 text-neutral-400'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span
                      className={`break-all ${
                        log.level === 'error'
                          ? 'text-rose-300'
                          : log.level === 'warning'
                          ? 'text-amber-300'
                          : 'text-neutral-300'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
