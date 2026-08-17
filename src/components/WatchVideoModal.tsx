import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { X, Play, Pause, Volume2, VolumeX, RotateCcw, ShieldCheck, Zap, Gift, Users, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Data ----------
const chapters = [
  {
    id: 1,
    title: "Money Pools & Weekly Rotations",
    timestamp: "0:00",
    timeSec: 0,
    icon: Users,
    color: "text-[#005FB8]",
    bgColor: "bg-blue-50",
    description: "Pool weekly deposits with verified workers. One member gets the full pot each week.",
    highlight: "$20/wk × 20 members = $400 payout rotation",
  },
  {
    id: 2,
    title: "FDIC Security & Stripe Treasury",
    timestamp: "0:20",
    timeSec: 20,
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    description: "Your money is held in individual Stripe Treasury accounts, FDIC‑insured up to $250k.",
    highlight: "Zero interest • No credit checks • Bank grade",
  },
  {
    id: 3,
    title: "Emergency Payout Swaps",
    timestamp: "0:40",
    timeSec: 40,
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    description: "Unexpected repair or emergency? Request an early payout swap through peer community voting.",
    highlight: "Instant community hardship assistance",
  },
  {
    id: 4,
    title: "Partner Perks & Benefits",
    timestamp: "1:00",
    timeSec: 60,
    icon: Gift,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Access 15‑20% discounts on tire maintenance, oil changes, gas, and tax preparation tools.",
    highlight: "Instant member discounts from verified partners",
  },
];

const TOTAL_DURATION = 80;

// ---------- Custom Hook: video logic ----------
function useVideoPlayer(initialPlay, duration) {
  const [playing, setPlaying] = useState(initialPlay);
  const [time, setTime] = useState(0);
  const interval = useRef(null);

  const toggle = useCallback(() => setPlaying(p => !p), []);
  const seek = useCallback((t) => {
    const clamped = Math.min(Math.max(t, 0), duration);
    setTime(clamped);
    setPlaying(true);
  }, [duration]);
  const restart = useCallback(() => { setTime(0); setPlaying(true); }, []);

  useEffect(() => {
    if (playing) {
      interval.current = setInterval(() => {
        setTime(prev => {
          if (prev >= duration) {
            setPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    return () => clearInterval(interval.current);
  }, [playing, duration]);

  return { playing, time, toggle, seek, restart };
}

// ---------- Hook: modal control (focus, scroll lock) ----------
function useModalControl(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      ref.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return ref;
}

// ---------- Memoised pieces ----------
const ScreenMock = memo(({ chapter }) => {
  const Icon = chapter.icon;
  // I decided to keep the content switch inline – it's only 4 cases and clean enough.
  const content = (() => {
    switch (chapter.id) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Active Pod</span>
                <p className="text-sm font-bold text-white">Bay Area Uber Drivers Pod</p>
                <span className="text-xs text-emerald-400 font-bold">$20 / week</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Rotation Payout</span>
                <p className="text-sm font-bold text-emerald-400">$400 Lump Sum</p>
                <span className="text-xs text-slate-300">20 Verified Members</span>
              </div>
            </div>
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Weekly Auto‑Deposit Schedule</span>
              </div>
              <span className="font-mono text-blue-300 font-bold">Rotates Every Monday</span>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Stripe Treasury Member Account
                </span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  FDIC Insured $250k
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All deposits are processed through bank‑level encryption. Money is strictly separated in individual member treasury vaults.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/10 text-slate-300">0% Interest</div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/10 text-slate-300">No Hidden Fees</div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/10 text-slate-300">0 Impact Credit Score</div>
            </div>
          </>
        );
      case 3:
        return (
          <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Emergency Swap Request
              </span>
              <span className="text-amber-400 text-[10px] bg-amber-900/60 px-2 py-0.5 rounded">Active Community Vote</span>
            </div>
            <p className="text-xs text-slate-200">
              Need funds sooner for vehicle alternator replacement? Member submits hardship swap request to pod peers.
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-4/5 transition-all duration-500" />
            </div>
            <div className="flex justify-between text-[10px] text-amber-200 font-mono">
              <span>16 Approved</span>
              <span>80% Community Supermajority Met</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="bg-purple-950/40 p-4 rounded-xl border border-purple-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-bold flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-purple-400" />
                Partner Perks Marketplace
              </span>
              <span className="text-purple-300 text-[10px] bg-purple-900/60 px-2 py-0.5 rounded">15‑20% Off</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10">
                <span className="font-bold text-white block">Tire Kingdom</span>
                <span className="text-[10px] text-purple-300">15% Off Tires & Alignment</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10">
                <span className="font-bold text-white block">Jiffy Lube</span>
                <span className="text-[10px] text-purple-300">$20 Off Synthetic Oil Change</span>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  })();

  return (
    <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 transition-all duration-500">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${chapter.bgColor} ${chapter.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-blue-300 font-bold block uppercase tracking-wider">
              Module {chapter.id} of 4
            </span>
            <h4 className="text-base font-extrabold text-white">{chapter.title}</h4>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Preview</span>
        </div>
      </div>
      <div className="space-y-3 py-2">{content}</div>
      <div className="bg-black/60 border border-white/10 rounded-lg p-2.5 text-center text-xs text-blue-100 italic">
        “{chapter.description}”
      </div>
    </div>
  );
});

const ChapterJumps = memo(({ chapters, activeIdx, onSeek }) => (
  <div className="hidden sm:flex items-center gap-1.5 text-xs">
    {chapters.map((c, i) => (
      <button
        key={c.id}
        onClick={() => onSeek(c.timeSec)}
        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
          activeIdx === i
            ? "bg-[#005FB8] text-white font-bold shadow-xs"
            : "bg-white/5 text-slate-400 hover:bg-white/10"
        }`}
        aria-label={`Jump to ${c.title}`}
      >
        {c.id}. {c.title.split(" ")[0]}
      </button>
    ))}
  </div>
));

const ChapterCardsGrid = memo(({ chapters, activeIdx, onSeek }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
    {chapters.map((c, i) => {
      const Icon = c.icon;
      const active = activeIdx === i;
      return (
        <button
          key={c.id}
          onClick={() => onSeek(c.timeSec)}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
            active
              ? "bg-white border-[#005FB8] shadow-md ring-2 ring-[#005FB8]/20"
              : "bg-white border-[#E2E8F0] hover:border-slate-300 hover:bg-gray-50/80"
          }`}
          aria-current={active ? "true" : undefined}
        >
          <div className="flex items-center justify-between">
            <div className={`p-1.5 rounded-lg ${c.bgColor} ${c.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {c.timestamp}
            </span>
          </div>
          <div>
            <h5 className="font-bold text-[#111827] line-clamp-1">{c.title}</h5>
            <p className="text-[10px] text-[#6B7280] line-clamp-2 leading-relaxed mt-0.5">{c.description}</p>
          </div>
          <span className="text-[10px] font-semibold text-[#005FB8]">{c.highlight}</span>
        </button>
      );
    })}
  </div>
));

// ---------- Main Component ----------
export const WatchVideoModal = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenHowItWorks,
}) => {
  const { playing, time, toggle, seek, restart } = useVideoPlayer(true, TOTAL_DURATION);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(true);
  const modalRef = useModalControl(isOpen, onClose);

  const activeIdx = useMemo(() => {
    if (time >= 60) return 3;
    if (time >= 40) return 2;
    if (time >= 20) return 1;
    return 0;
  }, [time]);

  const currentChapter = chapters[activeIdx];

  const fmt = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSeek = (t) => seek(t);
  const handleRange = (e) => seek(Number(e.target.value));

  // Keyboard shortcuts for video
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === " " || e.key === "Space") { e.preventDefault(); toggle(); }
      if (e.key === "ArrowRight") { e.preventDefault(); seek(Math.min(time + 5, TOTAL_DURATION)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); seek(Math.max(time - 5, 0)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, toggle, seek, time]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) seek(0);
  }, [isOpen, seek]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        className="bg-white border border-[#DDE1E6] rounded-2xl max-w-4xl w-full shadow-2xl relative text-[#111827] my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DDE1E6] flex items-center justify-between gap-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#005FB8] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                  Platform Demo
                </span>
                <span className="text-xs text-[#6B7280]">1 Min Walkthrough</span>
              </div>
              <h3 id="modal-title" className="text-lg font-extrabold text-[#111827]">
                How MutualPool Services Work
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-colors"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video area */}
        <div className="bg-slate-950 text-white relative flex-1 min-h-[280px] sm:min-h-[360px] flex flex-col justify-between overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-slate-950 to-emerald-950/40 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            <ScreenMock chapter={currentChapter} />
          </div>

          {!playing && (
            <button
              onClick={toggle}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors"
              aria-label="Play"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-[#005FB8] text-white flex items-center justify-center shadow-2xl"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </motion.div>
            </button>
          )}

          {/* Controls */}
          <div className="relative z-30 bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 border-t border-white/10 space-y-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-300 w-9 text-right">{fmt(time)}</span>
              <input
                type="range"
                min={0}
                max={TOTAL_DURATION}
                value={time}
                onChange={handleRange}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#005FB8]"
                aria-label="Video progress"
              />
              <span className="text-[11px] font-mono text-slate-400 w-9">{fmt(TOTAL_DURATION)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggle}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={restart}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  aria-label="Restart video"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMuted(m => !m)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setCaptions(c => !c)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    captions ? "bg-blue-600 text-white border-blue-500" : "bg-white/10 text-slate-400 border-white/10"
                  }`}
                  aria-label="Toggle captions"
                >
                  CC
                </button>
              </div>
              <ChapterJumps chapters={chapters} activeIdx={activeIdx} onSeek={handleSeek} />
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-t border-[#DDE1E6] shrink-0 space-y-4">
          <ChapterCardsGrid chapters={chapters} activeIdx={activeIdx} onSeek={handleSeek} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-xs text-[#4B5563]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free to join • Zero interest • Stripe Treasury bank protection</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenHowItWorks && (
                <button
                  onClick={() => { onClose(); onOpenHowItWorks(); }}
                  className="px-4 py-2.5 rounded-xl border border-[#DDE1E6] bg-white hover:bg-gray-50 text-[#111827] font-semibold text-xs transition-colors"
                >
                  Read Full Rules & FAQ
                </button>
              )}
              <button
                onClick={() => { onClose(); onOpenRegister(); }}
                className="px-5 py-2.5 rounded-xl bg-[#005FB8] hover:bg-[#004C93] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Join a Pod Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
