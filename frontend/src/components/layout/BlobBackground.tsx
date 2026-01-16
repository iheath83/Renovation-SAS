export function BlobBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient base */}
      <div 
        className="absolute inset-0 transition-colors duration-500"
        style={{ 
          background: 'var(--bg-base)'
        }}
      />

      {/* Blob 1 - Primary */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full animate-blob opacity-30 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, var(--blob-primary) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Blob 2 - Accent */}
      <div
        className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full animate-blob animation-delay-2000 opacity-20 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, var(--blob-accent) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Blob 3 - Secondary */}
      <div
        className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full animate-blob animation-delay-4000 opacity-25 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, var(--blob-primary) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: 'var(--grid-opacity, 0.02)',
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

