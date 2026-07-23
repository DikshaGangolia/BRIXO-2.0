import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Sparkles, X, Copy, Download, Share2, RefreshCw, EyeOff, Check } from 'lucide-react';

interface PublishSuccessScreenProps {
  url: string;
  projectName: string;
  slug?: string;
  qrCodeDataUrl?: string;
  qrCodeSvg?: string;
  projectId?: string;
  onClose: () => void;
  onRepublish?: () => void;
  onUnpublish?: () => void;
  onOpenDeveloperPanel?: () => void;
}

export const PublishSuccessScreen: React.FC<PublishSuccessScreenProps> = ({
  url,
  projectName,
  slug = 'site',
  qrCodeDataUrl,
  qrCodeSvg,
  onClose,
  onRepublish,
  onUnpublish,
  onOpenDeveloperPanel,
}) => {

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectName,
          text: `Check out my published website: ${projectName}`,
          url: url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (_err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadPNG = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `qrcode_${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSVG = () => {
    if (!qrCodeSvg) return;
    const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `qrcode_${slug}.svg`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-xl shadow-2xl relative space-y-6 text-slate-100 overflow-hidden my-8"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-3xs font-extrabold text-emerald-400 uppercase tracking-widest block">✅ Website Published</span>
            <h2 className="text-xl font-black text-slate-100 flex items-center justify-center gap-1.5 mt-1">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Published & QR Code Generated
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-slate-200 font-bold">{projectName}</span> is live and accessible globally via link or QR code.
            </p>
          </div>
        </div>

        {/* Content Grid: URL & QR Code Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 border border-slate-850 p-4 rounded-2xl">
          {/* Left: QR Code Preview */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High-Res Printable QR Code</span>
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Website QR Code" className="w-36 h-36 object-contain" />
              ) : (
                <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  QR Preview
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 font-medium">Scan with mobile camera to test</span>
          </div>

          {/* Right: URL & Quick Actions */}
          <div className="flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Public Website URL</span>
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
                <span className="font-mono text-blue-400 truncate text-[11px]">{url}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-3xs uppercase tracking-wider transition-all shadow text-center"
              >
                Open Website <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={handleCopyLink}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 text-3xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-400" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button
                onClick={handleDownloadPNG}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 text-3xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                Download QR PNG
              </button>

              <button
                onClick={handleDownloadSVG}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 text-3xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-teal-400" />
                Download QR SVG
              </button>

              {onOpenDeveloperPanel && (
                <button
                  onClick={onOpenDeveloperPanel}
                  className="col-span-2 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-3xs uppercase tracking-wider transition-all shadow cursor-pointer"
                >
                  Developer Panel
                </button>
              )}
            </div>

            <button
              onClick={handleShare}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-1.5 text-3xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              {shared ? 'Link Shared!' : 'Share Website'}
            </button>

          </div>
        </div>

        {/* Footer Lifecycle Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pt-2 border-t border-slate-850">
          {onUnpublish && (
            <button
              onClick={onUnpublish}
              className="py-2 px-3 text-red-400 hover:bg-red-950/40 border border-red-900/60 rounded-xl font-bold text-3xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Unpublish Site
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            {onRepublish && (
              <button
                onClick={onRepublish}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-3xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                Publish Again
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-3xs uppercase tracking-wider rounded-xl transition-all shadow"
            >
              Back to Builder
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
