import React from 'react';
import { X, GitFork, Send, GraduationCap, Code2, Sparkles, ExternalLink } from 'lucide-react';

interface DeveloperCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const links = [
    {
      label: 'GitHub',
      handle: '@MousaAlawad1',
      href: 'https://github.com/MousaAl-awad',
      icon: <GitFork className="w-4 h-4" />,
      color: 'from-slate-700 to-slate-800 border-slate-600 hover:border-slate-400',
      textColor: 'text-slate-200',
    },
    {
      label: 'Instagram',
      handle: '@1mousa_alawad',
      href: 'https://instagram.com/mousa._.alawad',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4.5"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
      color: 'from-pink-900/60 to-purple-900/60 border-pink-700/50 hover:border-pink-400/70',
      textColor: 'text-pink-300',
    },
    {
      label: 'Telegram',
      handle: '@Mousa_Alawad',
      href: 'https://t.me/Mousa_Alawad',
      icon: <Send className="w-4 h-4" />,
      color: 'from-sky-900/60 to-cyan-900/60 border-sky-700/50 hover:border-sky-400/70',
      textColor: 'text-sky-300',
    },
  ];

  const skills = ['React', 'TypeScript', 'Algorithms', 'Data Structures', 'SVG Rendering', 'Next.js'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-cyan-500/5 overflow-hidden animate-slideUp">
        
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />

        {/* Background glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 space-y-6 relative">

          {/* Avatar + Identity */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-cyan-500/20">
                M
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>

            {/* Name + role */}
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Mousa Alawad</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-slate-400">Information Engineering · Year 3</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs text-violet-300 font-medium">Full-Stack Developer</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-cyan-500/40 pl-4">
            Building projects that bridge <span className="text-cyan-300 font-medium">education</span> and modern software engineering. Passionate about algorithms, data structures, and interactive visual experiences.
          </p>

          {/* Project context */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200 mb-1">About This Project</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                B-Tree Lab is a university showcase & portfolio project demonstrating algorithm visualisation, SVG rendering, and React architecture — making B-Trees accessible to every student.
              </p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[10px] font-mono rounded-lg"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Connect</p>
            <div className="flex flex-col gap-2.5">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${link.color} border rounded-xl transition-all group`}
                >
                  <div className="flex items-center gap-3">
                    <span className={link.textColor}>{link.icon}</span>
                    <div>
                      <p className={`text-xs font-semibold ${link.textColor}`}>{link.label}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{link.handle}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <p className="text-center text-[10px] text-slate-600 italic font-mono pt-1">
            "Making algorithms visible, one node at a time."
          </p>
        </div>
      </div>
    </div>
  );
};
