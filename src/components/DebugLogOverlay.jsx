import { useState, useEffect } from "react";

// TEMPORARY — display-only reader for the debug log written by Login.jsx during the
// mobile Google redirect investigation. Reads sessionStorage, displays it, does
// nothing else. Safe to drop into Home.jsx temporarily and remove once done.
export default function DebugLogOverlay() {

  const [log, setLog] = useState([]);

  useEffect(() => {

    try {

      const raw = sessionStorage.getItem("zyvar-debug-log");

      if (raw) {

        setLog(JSON.parse(raw));
      }

    } catch (e) {}

  }, []);

  if (log.length === 0) return null;

  return (
    <div
      onClick={() => {
        setLog([]);
        sessionStorage.removeItem("zyvar-debug-log");
      }}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "45vh",
        overflowY: "auto",
        background: "rgba(0,0,0,0.97)",
        color: "#00ff66",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "10px",
        zIndex: 99999,
        borderTop: "2px solid #C6922B",
      }}
    >
      <div style={{ color: "#C6922B", marginBottom: "6px", fontWeight: "bold" }}>
        DEBUG (from Login page, tap to dismiss):
      </div>

      {log.map((line, i) => (
        <div key={i} style={{ marginBottom: "4px", wordBreak: "break-all" }}>
          {line}
        </div>
      ))}
    </div>
  );
}