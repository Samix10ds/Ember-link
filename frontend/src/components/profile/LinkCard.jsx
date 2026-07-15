export default function LinkCard({ link, accentColor, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur hover:bg-white/20 transition border border-white/10 text-left">
      {link.og_image && <img src={link.og_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
      <div className="min-w-0">
        <p className="font-medium truncate">{link.title}</p>
        {link.og_description && <p className="text-xs text-zinc-300 truncate">{link.og_description}</p>}
      </div>
    </button>
  );
}
