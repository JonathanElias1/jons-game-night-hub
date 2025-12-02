import React from "react";
import { cls } from "../utils/helpers";

export function AnswersBoard({ answers, revealed, phase }) {
  return (
    <div className={cls("mt-4 grid gap-3", phase === "sudden" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
      {answers.map((a, i) => {
        const isBlank = !a.points;
        const shown = revealed[i];
        return (
          <div
            key={i}
            className={cls(
              "relative text-left rounded-2xl p-4 min-h-[64px] shadow",
              "bg-white text-black",
              isBlank && "opacity-40"
            )}
          >
            {!isBlank && <div className="absolute right-3 top-2 text-xs font-bold opacity-60">{i + 1}</div>}
            {isBlank ? (
              <div className="text-sm opacity-40">— Empty —</div>
            ) : shown ? (
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold">{a.text}</div>
                <div className="text-2xl font-black tabular-nums">{a.points}</div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="h-5 w-5 rounded-full bg-black/10" />
                <div className="text-lg font-semibold opacity-60">???</div>
                <div className="h-5 w-10 rounded bg-black/10" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}