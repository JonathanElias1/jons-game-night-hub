import React, { useEffect, useRef } from "react";

export function ActionHistory({ history }) {
  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="mt-4 bg-white/5 rounded-xl p-4 max-h-[200px] overflow-y-auto" ref={historyRef}>
      <div className="text-sm font-bold uppercase tracking-wider opacity-80 mb-2">Action History</div>
      {history.length === 0 ? (
        <div className="text-sm opacity-60 italic">No actions yet...</div>
      ) : (
        <div className="space-y-1">
          {history.map((action, i) => (
            <div key={i} className="text-xs py-1 border-b border-white/10 last:border-0">
              <span className="opacity-60">{action.time}</span> · {action.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}