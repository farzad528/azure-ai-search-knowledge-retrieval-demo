"use client";
import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Dismiss20Regular } from '@fluentui/react-icons';

interface DocumentViewerModalProps {
  url: string | null;
  onClose: () => void;
}

// Naive file type inference for display hints
function inferType(url: string): string {
  const lower = url.split('?')[0].toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (/(png|jpg|jpeg|gif|webp|svg)$/.test(lower)) return 'image';
  if (/(txt|md|log)$/.test(lower)) return 'text';
  return 'generic';
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ url, onClose }) => {
  const escHandler = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (url) {
      document.addEventListener('keydown', escHandler);
      return () => document.removeEventListener('keydown', escHandler);
    }
  }, [url, escHandler]);

  if (!url) return null;
  const type = inferType(url);

  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-bg-card border border-stroke-divider rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-divider bg-bg-subtle">
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[420px]" title={url}>{decodeURIComponent(url.split('/').pop() || url)}</span>
                <span className="text-[10px] uppercase tracking-wide text-fg-muted">{type === 'pdf' ? 'PDF Document' : type === 'image' ? 'Image' : type === 'text' ? 'Text / Raw' : 'Document'}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-accent hover:text-accent/80"
                >Open in new tab</a>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close viewer">
                  <Dismiss20Regular className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-bg-default overflow-auto">
              {type === 'pdf' && (
                <object data={url} type="application/pdf" className="w-full h-full min-h-[70vh]" aria-label="PDF document">
                  <iframe src={url} className="w-full h-full" title="PDF" />
                </object>
              )}
              {type === 'image' && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img src={url} alt="Document" className="max-h-[70vh] max-w-full object-contain rounded" />
                </div>
              )}
              {type === 'text' && (
                <iframe src={url} title="Text document" className="w-full h-full min-h-[70vh]" />
              )}
              {type === 'generic' && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-sm text-fg-muted gap-4">
                  <p>Preview not available for this file type.</p>
                  <div className="flex gap-3">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs underline text-accent">Open</a>
                    <a href={url} download className="text-xs underline text-accent">Download</a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
