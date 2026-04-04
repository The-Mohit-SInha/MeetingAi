import { useEffect, useRef, useState } from 'react';

interface AudioLevelIndicatorProps {
  stream: MediaStream | null;
  className?: string;
}

export function AudioLevelIndicator({ stream, className = '' }: AudioLevelIndicatorProps) {
  const [level, setLevel] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (!stream) {
      setLevel(0);
      setIsActive(false);
      return;
    }

    // Create audio context and analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let activeCount = 0;
    let totalCount = 0;

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 128) * 100);

      setLevel(normalizedLevel);

      totalCount++;
      if (normalizedLevel > 2) {
        activeCount++;
        setIsActive(true);
      }

      // Log warning if no audio detected after 2 seconds
      if (totalCount === 60 && activeCount === 0) {
        console.warn('⚠️ No audio detected after 2 seconds of monitoring!');
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => {
          const threshold = (i + 1) * 5;
          const isActive = level >= threshold;

          return (
            <div
              key={i}
              className={`w-1 transition-all duration-75 rounded-full ${
                isActive
                  ? i < 10
                    ? 'bg-green-500'
                    : i < 15
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  : 'bg-gray-700'
              }`}
              style={{
                height: `${8 + i * 1}px`,
              }}
            />
          );
        })}
      </div>
      <div className="text-xs text-gray-400 min-w-[80px]">
        {level > 5 ? (
          <span className="text-green-500">🔊 Active</span>
        ) : isActive ? (
          <span className="text-yellow-500">🔉 Low</span>
        ) : (
          <span className="text-red-500">🔇 Silent</span>
        )}
      </div>
    </div>
  );
}
