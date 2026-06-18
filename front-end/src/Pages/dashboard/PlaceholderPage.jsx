import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
        <Construction size={28} className="text-blue-500" />
      </div>
      <h2
        className="text-xl font-bold text-slate-800 mb-2"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {title}
      </h2>
      <p
        className="text-sm text-slate-400 max-w-xs"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        This section is coming soon. Check back as we build it out layer by layer.
      </p>
    </div>
  );
}