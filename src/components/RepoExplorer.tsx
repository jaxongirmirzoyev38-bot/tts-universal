import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileCode,
  FileText,
  Copy,
  Check,
  Download,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import JSZip from 'jszip';

interface RepoExplorerProps {
  onFileSelect?: (path: string) => void;
}

interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: FileTreeItem[];
}

export const RepoExplorer: React.FC<RepoExplorerProps> = () => {
  const [tree, setTree] = useState<FileTreeItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('README.md');
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    'configs': true,
    'src': true,
    'src/tokenizer': true,
    'src/models': true,
    'src/inference': true,
    'src/api': true,
    'docs': true,
  });
  const [isZipping, setIsZipping] = useState<boolean>(false);

  useEffect(() => {
    fetchTree();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      loadFile(selectedPath);
    }
  }, [selectedPath]);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/repo-tree');
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        setTree(data.files);
      }
    } catch (err) {
      console.error('Failed to load repo tree', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (path: string) => {
    try {
      const res = await fetch(`/api/repo-file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFileContent(data.content);
      }
    } catch (err) {
      console.error('Failed to load file content', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDir = (dirPath: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dirPath]: !prev[dirPath] }));
  };

  const downloadAllAsZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const folder = zip.folder('universal-tts');

      const addFilesRecursively = async (items: FileTreeItem[]) => {
        for (const item of items) {
          if (item.type === 'file') {
            const res = await fetch(`/api/repo-file?path=${encodeURIComponent(item.path)}`);
            const data = await res.json();
            if (folder && data.content !== undefined) {
              folder.file(item.path, data.content);
            }
          } else if (item.children) {
            await addFilesRecursively(item.children);
          }
        }
      };

      await addFilesRecursively(tree);
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'universal-tts-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  const renderTree = (items: FileTreeItem[], level = 0) => {
    return items.map((item) => {
      const isDir = item.type === 'dir';
      const isExpanded = !!expandedDirs[item.path];
      const isSelected = selectedPath === item.path;

      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !isDir
      ) {
        return null;
      }

      return (
        <div key={item.path} className="select-none">
          <div
            onClick={() => {
              if (isDir) {
                toggleDir(item.path);
              } else {
                setSelectedPath(item.path);
              }
            }}
            style={{ paddingLeft: `${level * 16 + 10}px` }}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
              isSelected
                ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {isDir ? (
              <>
                <span className="text-slate-500">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </span>
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
              </>
            ) : (
              <>
                <span className="w-3.5" />
                {item.name.endsWith('.py') ? (
                  <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
              </>
            )}
          </div>
          {isDir && isExpanded && item.children && renderTree(item.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              universal-tts / repository
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                BOSQICH 1-6 TAYYOR
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Ochiq kodli Python & PyTorch kod bazasi — diskda mavjud va GitHub uchun to'liq shay
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadAllAsZip}
            disabled={isZipping}
            aria-label="ZIP yuklab olish"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isZipping ? 'Arxivlanmoqda...' : 'Repozitoriyani Yuklab Olish (ZIP)'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Sidebar File Tree */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-800 bg-slate-950/40 p-3 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Fayllarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Fayllarni qidirish"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-y-auto max-h-[500px] pr-1 space-y-0.5 font-mono">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500">Yuklanmoqda...</div>
            ) : (
              renderTree(tree)
            )}
          </div>
        </div>

        {/* Code Content Panel */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-slate-900">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs">
            <span className="font-mono text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">universal-tts /</span>
              <strong className="text-sky-400">{selectedPath}</strong>
            </span>

            <button
              type="button"
              onClick={copyToClipboard}
              aria-label="Kodni nusxalash"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Nusxalandi!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kodni nusxalash</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 flex-1 overflow-auto max-h-[520px] bg-slate-950 font-mono text-xs leading-relaxed text-slate-200">
            <pre className="whitespace-pre-wrap">{fileContent || '// Fayl tanlanmadi yoki bo‘sh'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
