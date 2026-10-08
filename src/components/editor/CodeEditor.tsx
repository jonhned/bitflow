"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react";

// Configure Monaco loader to use local monaco-editor
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
  },
});

interface CodeEditorProps {
  initialCode: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  html: "html",
  css: "css",
  javascript: "javascript",
  php: "php",
  python: "python",
};

export function CodeEditor({
  initialCode,
  language,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(initialCode);
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    setEditorValue(initialCode);
  }

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    // Timeout to detect loading issues
    const timer = setTimeout(() => {
      if (!containerRef.current?.querySelector(".monaco-editor")) {
        setLoadError(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      const newValue = value || "";
      setEditorValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // Fallback textarea editor if Monaco fails
  if (!mounted || loadError) {
    return (
      <div ref={containerRef} className="w-full h-full flex flex-col" style={{ background: "#1e1e1e" }}>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-gray-400 text-xs font-mono">
            {language}.{language === "javascript" ? "js" : language === "python" ? "py" : language === "php" ? "php" : language}
          </span>
          {loadError && (
            <span className="ml-auto text-yellow-500 text-xs">Modo básico</span>
          )}
        </div>
        <textarea
          value={editorValue}
          onChange={(e) => handleChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 w-full p-4 resize-none outline-none"
          style={{
            background: "#1e1e1e",
            color: "#d4d4d4",
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: "14px",
            lineHeight: "1.6",
            tabSize: 2,
          }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: "400px" }}>
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language] || "html"}
        value={editorValue}
        onChange={handleChange}
        theme="vs-dark"
        loading={
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "#1e1e1e", minHeight: "400px" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-full animate-spin"
                style={{
                  border: "3px solid #00ff88",
                  borderTopColor: "transparent",
                }}
              />
              <span style={{ color: "#888", fontSize: "14px" }}>
                Inicializando editor...
              </span>
            </div>
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          roundedSelection: true,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "all",
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          readOnly,
          wordWrap: "on",
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabSize: 2,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          contextmenu: true,
          fixedOverflowWidgets: true,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}