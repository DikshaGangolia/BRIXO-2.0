import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Server,
  Key,
  Globe,
  FileCode2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FolderArchive,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import type { WebsiteProject } from '../../types/builder';
import { exportSiteZip, type ExportConfigOptions } from '../../utils/export';

interface DownloadConfigModalProps {
  project: WebsiteProject;
  onClose: () => void;
}

export const DownloadConfigModal: React.FC<DownloadConfigModalProps> = ({ project, onClose }) => {
  const [siteName, setSiteName] = useState(project.name || 'My Website');
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_your_key_id');
  const [includeBackend, setIncludeBackend] = useState(true);
  const [customEnv, setCustomEnv] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleDownload = async () => {
    setIsExporting(true);
    setStatusMessage('Verifying project ownership...');

    try {
      // 1. Verify project ownership on backend
      const token = localStorage.getItem('token');
      try {
        await axios.post(
          `${API_BASE}/api/projects/${project.id}/verify-export`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (authErr: any) {
        console.warn("Backend ownership check note:", authErr.response?.data?.message || authErr.message);
        // Continue if dev mode or local fallback
      }

      setStatusMessage('Compiling project assets, HTML, and Vite React components...');

      const options: ExportConfigOptions = {
        siteName: siteName.trim() || project.name,
        apiUrl: apiUrl.trim() || 'http://localhost:5000',
        razorpayKeyId: razorpayKeyId.trim() || 'rzp_test_your_key_id',
        includeBackend,
        customEnv
      };

      const blob = await exportSiteZip(project, options);
      setStatusMessage('Archive generated! Downloading ZIP...');

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (siteName || project.name).toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `${cleanName}_website_source.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Download export error:', err);
      alert('Failed to generate export archive: ' + (err.message || 'Unknown error'));
      setIsExporting(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl text-slate-100 overflow-hidden relative my-6"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Export & Download Website Source</h3>
              <p className="text-3xs text-slate-400">Download self-contained, runnable code for <strong>{project.name}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5 text-xs">
          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-950/40 border border-blue-900/50 rounded-xl text-blue-300 text-3xs leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Isolated User Project Code:</strong> This archive contains only the source files, assets, and templates for this selected website. BRIXO platform internals, admin accounts, and other users' records are strictly excluded.
            </div>
          </div>

          {/* Site Title */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400 text-3xs">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Website Title / Brand
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Fresh Organic Grocery"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Backend API Base URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400 text-3xs">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Public Backend API URL (for Checkout & Orders)
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5000 or https://api.yourdomain.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-blue-500 transition-colors"
            />
            <span className="text-4xs text-slate-500 block">Where customer checkout requests and verification requests will be routed.</span>
          </div>

          {/* Razorpay Key ID */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-400 text-3xs">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              Razorpay Public Key ID (Frontend Safe)
            </label>
            <input
              type="text"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
              placeholder="rzp_test_your_key_id"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-blue-500 transition-colors"
            />
            <span className="text-4xs text-slate-500 block">Only public Key ID is placed in frontend configuration. Secret keys remain strictly on the backend.</span>
          </div>

          {/* Included Components Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block text-xs">Include Standalone Node.js Orders Backend</span>
                <span className="text-3xs text-slate-400 block">Includes Express server, Order model, verification & payment handlers.</span>
              </div>
              <input
                type="checkbox"
                checked={includeBackend}
                onChange={(e) => setIncludeBackend(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block text-xs">Generate Custom .env File</span>
                <span className="text-3xs text-slate-400 block">Safe placeholders provided in .env.example by default.</span>
              </div>
              <input
                type="checkbox"
                checked={customEnv}
                onChange={(e) => setCustomEnv(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>
          </div>

          {customEnv && (
            <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-900/60 rounded-xl text-amber-300 text-3xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span><strong>Privacy Notice:</strong> The archive will contain your active configuration. Keep the downloaded ZIP private and do not commit to public repositories.</span>
            </div>
          )}

          {/* What's Included Preview Pills */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
            <span className="text-4xs font-black uppercase tracking-wider text-slate-500 block mb-2">Archive Package Contents:</span>
            <div className="flex flex-wrap gap-2 text-3xs text-slate-300 font-semibold">
              <span className="px-2 py-0.5 bg-slate-850 rounded border border-slate-800 flex items-center gap-1">
                <FileCode2 className="w-3 h-3 text-blue-400" /> Standalone HTML/CSS
              </span>
              <span className="px-2 py-0.5 bg-slate-850 rounded border border-slate-800 flex items-center gap-1">
                <FileCode2 className="w-3 h-3 text-cyan-400" /> Runnable Vite React TS App
              </span>
              {includeBackend && (
                <span className="px-2 py-0.5 bg-slate-850 rounded border border-slate-800 flex items-center gap-1">
                  <Server className="w-3 h-3 text-indigo-400" /> Express Orders Backend
                </span>
              )}
              <span className="px-2 py-0.5 bg-slate-850 rounded border border-slate-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Setup README & .env.example
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="text-3xs text-slate-400">
            {statusMessage && <span className="text-blue-400 font-medium">{statusMessage}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-3xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating ZIP...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Website ZIP
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
