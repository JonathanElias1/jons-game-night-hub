import React, { useState, useRef } from "react";
import { findMatchingAnswer } from "../utils/answerMatching";

export function AnswerInput({
  answers,
  revealed,
  onReveal,
  onWrongAnswer,
  disabled,
  placeholder = "Type an answer..."
}) {
  const [inputValue, setInputValue] = useState("");
  const [pendingMatch, setPendingMatch] = useState(null); // For host approval of close matches
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled) return;

    // Create answers array with revealed status
    const answersWithStatus = answers.map((a, i) => ({
      ...a,
      revealed: revealed[i]
    }));

    const result = findMatchingAnswer(inputValue, answersWithStatus);

    if (result.matched) {
      if (result.confidence === 'close') {
        // Close match - ask host for approval
        setPendingMatch({
          userAnswer: inputValue,
          answerIndex: result.answerIndex,
          correctAnswer: answers[result.answerIndex].text
        });
      } else {
        // Exact or partial match - auto reveal
        onReveal(result.answerIndex);
        setInputValue("");
      }
    } else {
      // No match - wrong answer
      onWrongAnswer(inputValue);
      setInputValue("");
    }

    // Keep focus on input
    inputRef.current?.focus();
  };

  const handleApprove = () => {
    if (pendingMatch) {
      onReveal(pendingMatch.answerIndex);
      setPendingMatch(null);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleReject = () => {
    if (pendingMatch) {
      onWrongAnswer(pendingMatch.userAnswer);
      setPendingMatch(null);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Submit
        </button>
      </form>

      {/* Host approval modal for close matches */}
      {pendingMatch && (
        <div className="mt-3 p-4 bg-yellow-500/20 border border-yellow-400/50 rounded-xl">
          <div className="text-sm font-semibold text-yellow-300 mb-2">
            ⚠️ Close Match - Host Approval Needed
          </div>
          <div className="text-white mb-3">
            <span className="opacity-70">Player said:</span>{" "}
            <span className="font-bold">"{pendingMatch.userAnswer}"</span>
            <br />
            <span className="opacity-70">Check Answer Key:</span>{" "}
            <span className="font-bold text-yellow-300">Answer #{pendingMatch.answerIndex + 1}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-400 transition"
            >
              ✓ Accept
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-400 transition"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
