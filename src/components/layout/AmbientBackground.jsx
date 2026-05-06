export const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-background">
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75 saturate-100"
        src="https://cdn.pixabay.com/video/2022/06/21/121261-724696832_large.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(5,8,16,0.5)_50%,_rgba(5,8,16,0.95)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,8,16,0.3)] via-[rgba(5,8,16,0.1)] to-[rgba(5,8,16,1)]" />
    </div>
  );
};
