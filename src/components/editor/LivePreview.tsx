"use client";

import { useEffect, useRef, useState } from "react";

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    setIsLoading(true);

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #1a1a2e;
            line-height: 1.6;
          }
          h1, h2, h3, h4, h5, h6 { margin: 0.5em 0; line-height: 1.3; }
          p { margin: 0.5em 0; }
          a { color: #0066cc; }
          img { max-width: 100%; height: auto; }
          button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          }
          input, textarea, select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          }
          table { border-collapse: collapse; width: 100%; }
          th, td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
          th { background: #f5f5f5; }
          ul, ol { padding-left: 24px; }
          code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
          }
          pre {
            background: #f4f4f4;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
          }
          pre code { background: none; padding: 0; }
          .card {
            background: #f9f9f9;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        ${code}
        <script>
          // Intercept console.log for display
          (function() {
            const originalLog = console.log;
            const logs = [];
            console.log = function(...args) {
              logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
              originalLog.apply(console, args);
            };
            window.getLogs = () => logs;
          })();
        </script>
      </body>
      </html>
    `);
    doc.close();

    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-gray-100 rounded-md px-3 py-1 text-xs text-gray-500 font-mono">
            preview.html
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-gray-400 text-sm animate-pulse">
              Renderizando...
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          title="Vista previa"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}