import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy, Crown, Medal, ChevronLeft, RefreshCw,
  Flame, Zap, BookOpen, Target, Star, Users, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/App";
import { getGroupLeaderboard } from "@/services/ulearnService";

interface LeaderboardEntry {
  userId:           string;
  name:             string;
  avatar?:          string;
  chaptersCompleted: number;
  quizzesCompleted: number;
  xpEarned:         number;
  streakDays:       number;
  rank:             number;
  isMe?:            boolean;
}

const rankConfig: Record<number, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  1: {
    bg:    "bg-gradient-to-br from-yellow-400 to-yellow-500",
    text:  "text-yellow-700",
    icon:  <Crown className="w-5 h-5 text-yellow-500" />,
    label: "🥇",
  },
  2: {
    bg:    "bg-gradient-to-br from-gray-300 to-gray-400",
    text:  "text-gray-600",
    icon:  <Medal className="w-5 h-5 text-gray-400" />,
    label: "🥈",
  },
  3: {
    bg:    "bg-gradient-to-br from-orange-300 to-orange-400",
    text:  "text-orange-700",
    icon:  <Medal className="w-5 h-5 text-orange-400" />,
    label: "🥉",
  },
};

const GroupStudyLeaderboard = () => {
  const { groupId }           = useParams<{ groupId: string }>();
  const navigate              = useNavigate();
  const { user }              = useAuth();
  const userId                = user?.id;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    try {
      const res = await getGroupLeaderboard(groupId!);
      const withMe = (res.leaderboard || []).map((e: LeaderboardEntry) => ({
        ...e,
        isMe: e.userId?.toString() === userId?.toString(),
      }));
      setEntries(withMe);
      setGroupTitle(res.groupTitle || "");
      setTotalMembers(res.totalMembers || withMe.length);
      setLastUpdated(new Date());
    } catch {
      toast.error("Could not load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [groupId]);

  const myEntry = entries.find(e => e.isMe);
  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3);

  // ─────────────────────────────────────────────────────
  //  LOADING
  // ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#8A63FF]" />
        <p className="text-gray-400 text-sm">Loading leaderboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-400 hover:text-[#8A63FF] text-sm mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Group
        </button>

        {/* ══════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════ */}
        <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#8A63FF]/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#8A63FF]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Leaderboard</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {groupTitle && <span className="font-medium text-gray-600">{groupTitle} · </span>}
                  {totalMembers} members competing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <p className="text-[10px] text-gray-300 hidden sm:block">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
              <button
                onClick={() => { setLoading(true); load(); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#8A63FF] hover:bg-purple-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            EMPTY STATE
        ══════════════════════════════════════════ */}
        {entries.length === 0 ? (
          <div className="bg-white rounded-[20px] shadow-md p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-[#8A63FF]/40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No activity yet</h3>
            <p className="text-sm text-gray-400">
              Leaderboard updates as members complete chapters and quizzes.
            </p>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════
                TOP 3 PODIUM
            ══════════════════════════════════════════ */}
            {top3.length >= 2 && (
              <div className="mb-5">
                <div className="flex items-end justify-center gap-3 px-4 pb-2">

                  {/* ── 2nd Place ── */}
                  {top3[1] && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative mb-2">
                        <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {top3[1].name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs">
                          🥈
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[80px] text-center">
                        {top3[1].isMe ? "You" : top3[1].name}
                      </p>
                      <p className="text-xs text-gray-400">{top3[1].xpEarned} XP</p>
                      <div className="w-full bg-gray-200 rounded-t-xl mt-2 h-16 flex items-center justify-center">
                        <span className="text-2xl font-black text-gray-400">2</span>
                      </div>
                    </div>
                  )}

                  {/* ── 1st Place ── */}
                  {top3[0] && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative mb-2">
                        <Crown className="w-6 h-6 text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2" />
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-yellow-200 mt-3">
                          {top3[0].name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs">
                          🥇
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[80px] text-center mt-1">
                        {top3[0].isMe ? "You" : top3[0].name}
                      </p>
                      <p className="text-xs text-[#8A63FF] font-semibold">{top3[0].xpEarned} XP</p>
                      <div className="w-full bg-[#8A63FF] rounded-t-xl mt-2 h-24 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">1</span>
                      </div>
                    </div>
                  )}

                  {/* ── 3rd Place ── */}
                  {top3[2] && (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative mb-2">
                        <div className="w-14 h-14 rounded-full bg-orange-300 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {top3[2].name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-xs">
                          🥉
                        </div>
                      </div>
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[80px] text-center">
                        {top3[2].isMe ? "You" : top3[2].name}
                      </p>
                      <p className="text-xs text-gray-400">{top3[2].xpEarned} XP</p>
                      <div className="w-full bg-orange-300 rounded-t-xl mt-2 h-10 flex items-center justify-center">
                        <span className="text-2xl font-black text-white">3</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                MY RANK CARD (if not in top 3)
            ══════════════════════════════════════════ */}
            {myEntry && myEntry.rank > 3 && (
              <div className="bg-[#8A63FF] rounded-[20px] shadow-md p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base shrink-0">
                    {myEntry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">Your Rank</p>
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">#{myEntry.rank}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-white/70 flex items-center gap-1">
                        <Zap className="w-3 h-3" />{myEntry.xpEarned} XP
                      </span>
                      <span className="text-xs text-white/70 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />{myEntry.chaptersCompleted} chapters
                      </span>
                      <span className="text-xs text-white/70 flex items-center gap-1">
                        <Flame className="w-3 h-3" />{myEntry.streakDays}d streak
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-white">#{myEntry.rank}</p>
                    <p className="text-[10px] text-white/60">of {totalMembers}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                FULL LIST
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-[20px] shadow-md overflow-hidden">
              {/* Column headers */}
              <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Member</div>
                <div className="col-span-2 text-center">XP</div>
                <div className="col-span-2 text-center hidden sm:block">Chapters</div>
                <div className="col-span-2 text-center hidden sm:block">Streak</div>
              </div>

              {entries.map((entry, idx) => {
                const rConf     = rankConfig[entry.rank];
                const isTopRank = entry.rank <= 3;

                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 px-5 py-4 items-center border-b border-gray-50 last:border-none transition-colors ${
                      entry.isMe
                        ? "bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {isTopRank ? (
                        <span className="text-base">{rConf.label}</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                        isTopRank
                          ? rConf.bg
                          : entry.isMe
                          ? "bg-[#8A63FF]"
                          : "bg-gray-300"
                      }`}>
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-sm font-semibold truncate ${entry.isMe ? "text-[#8A63FF]" : "text-gray-900"}`}>
                            {entry.isMe ? "You" : entry.name}
                          </p>
                          {entry.isMe && (
                            <span className="text-[10px] bg-[#8A63FF] text-white px-1.5 py-0.5 rounded-full shrink-0 hidden sm:inline">me</span>
                          )}
                          {entry.rank === 1 && (
                            <Crown className="w-3 h-3 text-yellow-500 shrink-0 hidden sm:block" />
                          )}
                        </div>
                        {/* Mobile sub-stats */}
                        <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <BookOpen className="w-2.5 h-2.5" />{entry.chaptersCompleted}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />{entry.streakDays}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="col-span-2 text-center">
                      <p className={`text-sm font-bold ${entry.isMe ? "text-[#8A63FF]" : "text-gray-900"}`}>
                        {entry.xpEarned}
                      </p>
                      <p className="text-[10px] text-gray-400">XP</p>
                    </div>

                    {/* Chapters — desktop */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">{entry.chaptersCompleted}</p>
                      <p className="text-[10px] text-gray-400">done</p>
                    </div>

                    {/* Streak — desktop */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className={`w-3.5 h-3.5 ${entry.streakDays > 0 ? "text-orange-400" : "text-gray-300"}`} />
                        <p className={`text-sm font-semibold ${entry.streakDays > 0 ? "text-gray-900" : "text-gray-400"}`}>
                          {entry.streakDays}d
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════
                XP LEGEND
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-[20px] shadow-md p-5 mt-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">How XP is earned</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <BookOpen className="w-3.5 h-3.5 text-[#8A63FF]" />, label: "Complete a chapter",  xp: "+10 XP" },
                  { icon: <Target   className="w-3.5 h-3.5 text-green-500" />, label: "Pass a quiz",         xp: "+20 XP" },
                  { icon: <Flame    className="w-3.5 h-3.5 text-orange-400" />, label: "Daily streak bonus", xp: "+5 XP"  },
                  { icon: <Star     className="w-3.5 h-3.5 text-yellow-400" />, label: "Perfect quiz score", xp: "+15 XP" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 truncate">{item.label}</p>
                      <p className="text-xs font-bold text-[#8A63FF]">{item.xp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupStudyLeaderboard;
