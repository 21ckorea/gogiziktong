'use client';

import { useEffect, useRef } from 'react';

type AutoVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  forcePlay?: boolean;
};

export function AutoVideo({
  forcePlay = true,
  muted = true,
  playsInline = true,
  autoPlay = true,
  ...props
}: AutoVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!forcePlay) return;
    const video = ref.current;
    if (!video) return;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // autoplay might be blocked; ensure muted and retry once interactively if needed
        });
      }
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      const onLoaded = () => {
        attemptPlay();
        video.removeEventListener('loadeddata', onLoaded);
      };
      video.addEventListener('loadeddata', onLoaded);
    }

    return () => {
      video?.pause();
    };
  }, [forcePlay]);

  return <video ref={ref} muted={muted} playsInline={playsInline} autoPlay={autoPlay} {...props} />;
}
