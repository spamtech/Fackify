import React from 'react';

export default function Equalizer({ isPlaying = true, size = 'sm' }) {
  const isSmall = size === 'sm';
  return (
    <div className={`flex items-end gap-[3px] ${isSmall ? 'h-4' : 'h-5'}`}>
      <span
        className={`w-1 bg-emerald-400 rounded-full ${
          isPlaying ? 'animate-bar-1' : 'h-1'
        } transition-all duration-300`}
      />
      <span
        className={`w-1 bg-emerald-400 rounded-full ${
          isPlaying ? 'animate-bar-2' : 'h-2'
        } transition-all duration-300`}
      />
      <span
        className={`w-1 bg-emerald-400 rounded-full ${
          isPlaying ? 'animate-bar-3' : 'h-1'
        } transition-all duration-300`}
      />
    </div>
  );
}