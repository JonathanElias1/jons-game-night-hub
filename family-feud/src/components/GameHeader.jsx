import React from "react";
import { cls } from "../utils/helpers";

export function GameHeader({ loaded, volume, setVolume, theme, toggleFullscreen, startTimer }) {
  const h1Size = "text-2xl sm:text-3xl md:text-4xl";

  return (
    <header className="flex items-center justify-between gap-3 flex-wrap">
      <h1 className={cls(h1Size, "font-extrabold tracking-tight drop-shadow")}>
        JON FEUD {loaded ? "" : "· loading…"}
      </h1>
      <div className="flex items-end gap-3 md:gap-4 flex-wrap">
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider opacity-90">Volume</div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(parseInt(e.target.value, 10) / 100)}
            className="w-28 accent-white"
          />
        </div>
        <button
          onClick={theme.playing ? theme.stop : theme.play}
          className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition"
        >
          {theme.playing ? "Stop Music" : "Play Music"}
        </button>
        {startTimer && (
          <button
            onClick={startTimer}
            className="px-3 py-2 rounded-xl bg-purple-500/50 hover:bg-purple-500/70 text-white text-sm font-semibold transition"
            title="Start Timer (T)"
          >
            ⏱️ Timer
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition"
        >
          Fullscreen
        </button>
      </div>
    </header>
  );
}