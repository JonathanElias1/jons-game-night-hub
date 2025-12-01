import { useEffect, useState } from "react";
import { FALLBACK } from "../utils/constants";

export function useGameData() {
  const [data, setData] = useState(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL || "/"}rounds.json`, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!cancelled) {
          setData({
            rounds: json.rounds?.length ? json.rounds : FALLBACK.rounds,
            fastMoneyPrompts: json.fastMoneyPrompts?.length ? json.fastMoneyPrompts : FALLBACK.fastMoneyPrompts,
            suddenDeath: json.suddenDeath?.length ? json.suddenDeath : FALLBACK.suddenDeath,
          });
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loaded };
}