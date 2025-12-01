import React from "react";

export function QuestionDisplay({ displayedQuestion, phase, faceoffBuzz, faceoffTurn }) {
  return (
    <div className="mt-2 min-h-[120px] md:min-h-[140px] flex flex-col justify-center items-center text-center">
      <div className="text-4xl md:text-5xl font-black leading-tight drop-shadow-lg">
        {displayedQuestion}
      </div>

      {(phase === "faceoff" || phase === "sudden") && (
        <div className="mt-2 text-sm md:text-base uppercase tracking-[0.18em] text-white/85">
          Buzz with <strong>Q</strong> (Team A) or <strong>P</strong> (Team B).
          {faceoffBuzz ? (
            <span className="ml-2 normal-case tracking-normal">
              <span className="opacity-85">Buzzed: </span>
              <span className="font-bold">Team {faceoffBuzz}</span> ·{" "}
              <span className="opacity-85">Awaiting answer:</span>{" "}
              <span className="font-bold">Team {faceoffTurn}</span>
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}