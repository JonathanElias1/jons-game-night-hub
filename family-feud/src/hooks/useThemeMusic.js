import { useEffect, useRef, useState } from "react";

export function useThemeMusic() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  
  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL || "/"}feud-theme.mp3`);
    audio.preload = "auto";
    audio.loop = true;
    ref.current = audio;
  }, []);
  
  const play = async () => {
    if (!ref.current) return;
    try {
      ref.current.currentTime = 0;
      await ref.current.play();
      setPlaying(true);
    } catch {}
  };
  
  const stop = () => {
    if (!ref.current) return;
    const a = ref.current;
    let vol = a.volume;
    const id = setInterval(() => {
      vol -= 0.06;
      if (vol <= 0) {
        a.pause();
        a.volume = 1;
        clearInterval(id);
        setPlaying(false);
      } else a.volume = vol;
    }, 60);
  };
  
  return { playing, play, stop };
}