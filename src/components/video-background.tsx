
'use client';

export function VideoBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2 opacity-50"
      >
        <source src="/background.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
