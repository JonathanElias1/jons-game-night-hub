import React from "react";
import { cls } from "../utils/helpers";

export function FaceoffControls({ 
  phase, 
  faceoffBuzz, 
  faceoffTurn, 
  beginRound, 
  passFaceoff, 
  startFaceoff, 
  startSudden 
}) {
  return (
    <div className="mt-4 bg-white/5 rounded-xl p-3 flex flex-wrap items-center gap-2">
      <div className="text-sm">
        Faceoff: <strong>Q</strong> (Team A) • <strong>P</strong> (Team B) ·{" "}
        <span className="opacity-85">Buzz: </span>
        <span className="font-bold">{faceoffBuzz ?? "—"}</span>
      </div>

      {phase === "faceoff" ? (
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => beginRound("A")}
            disabled={!faceoffBuzz}
            className={cls(
              "px-3 py-2 rounded-xl font-semibold transition",
              faceoffTurn === "A"
                ? "bg-yellow-300 text-black hover:opacity-90"
                : "bg-white/10 hover:bg-white/20",
              !faceoffBuzz ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            Control → Team A
          </button>
          <button
            onClick={() => beginRound("B")}
            disabled={!faceoffBuzz}
            className={cls(
              "px-3 py-2 rounded-xl font-semibold transition",
              faceoffTurn === "B"
                ? "bg-yellow-300 text-black hover:opacity-90"
                : "bg-white/10 hover:bg-white/20",
              !faceoffBuzz ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            Control → Team B
          </button>
          <button
            onClick={passFaceoff}
            disabled={!faceoffBuzz}
            className={cls(
              "px-3 py-2 rounded-xl font-semibold transition",
              "bg-red-400 text-black hover:opacity-90",
              !faceoffBuzz ? "opacity-50 cursor-not-allowed" : ""
            )}
            title="Wrong → pass turn (or press X)"
          >
            Pass to Team {faceoffTurn === "A" ? "B" : "A"}
          </button>
          <button
            onClick={startFaceoff}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Reset Faceoff
          </button>
        </div>
      ) : (
        <div className="ml-auto flex gap-2">
          <button
            onClick={passFaceoff}
            disabled={!faceoffBuzz}
            className={cls(
              "px-3 py-2 rounded-xl font-semibold transition",
              "bg-red-400 text-black hover:opacity-90",
              !faceoffBuzz ? "opacity-50 cursor-not-allowed" : ""
            )}
            title="Wrong → pass turn (or press X)"
          >
            Pass to Team {faceoffTurn === "A" ? "B" : "A"}
          </button>
          <button
            onClick={startSudden}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Reset Sudden
          </button>
        </div>
      )}
    </div>
  );
}