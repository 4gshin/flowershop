// Yukleme sirasinda gosterilen zarif spinner
function Spinner({ boyut = 'md', metin = null }) {
  const boyutClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]'
  }[boyut];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${boyutClass} border-rose/20 border-t-rose rounded-full animate-spin`} />
      {metin && <p className="text-sm text-charcoal/50">{metin}</p>}
    </div>
  );
}

export default Spinner;
