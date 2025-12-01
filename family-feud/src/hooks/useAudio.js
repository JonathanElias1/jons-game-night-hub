import { useEffect, useRef, useState } from "react";

export function useAudio() {
  const store = useRef({});
  const [volume, setVolume] = useState(0.9);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";
    const files = {
      ding: `${base}feud-ding.mp3`,
      buzz: `${base}feud-buzzer.mp3`,
      blip: `${base}feud-reveal.mp3`,
      buzzA: `${base}feud-buzz-a.mp3`,
      buzzB: `${base}feud-buzz-b.mp3`,
    };
    for (const [k, src] of Object.entries(files)) {
      const a = new Audio(src);
      a.preload = "auto";
      a.volume = volume;
      a.crossOrigin = "anonymous";
      store.current[k] = a;
    }
  }, []);

  useEffect(() => {
    Object.values(store.current).forEach((a) => {
      if (a && "volume" in a) a.volume = volume;
    });
  }, [volume]);

  function fb(chain = []) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = store.current.ctx || new Ctx();
    store.current.ctx = ctx;
    let t = ctx.currentTime;
    chain.forEach(([f, ms]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.25 * volume, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + ms / 1000 + 0.02);
      t += ms / 1000 + 0.04;
    });
  }
  const play = (k, chain) => store.current[k]?.play().catch(() => fb(chain));

  return {
    volume,
    setVolume,
    ding: () => play("ding", [[880, 140], [1320, 140]]),
    buzz: () => play("buzz", [[140, 260]]),
    blip: () => play("blip", [[520, 120]]),
    buzzA: () => play("buzzA", [[820, 160], [600, 160]]),
    buzzB: () => play("buzzB", [[300, 200], [220, 220]]),
  };
}