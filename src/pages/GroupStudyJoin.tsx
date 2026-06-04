import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users, Clock, Loader2, CheckCircle, XCircle,
    BookOpen, Zap, BarChart3, CalendarClock, ChevronRight,
    AlertCircle, Sparkles
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { getGroupInviteDetails, joinGroupStudy } from "@/services/ulearnService";
import { useAuth } from "@/App";

const GroupStudyJoin = () => {
    const { inviteToken } = useParams<{ inviteToken: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── countdown timer ──
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getGroupInviteDetails(inviteToken!);
                setGroup(res.group);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Invalid or expired invite link");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [inviteToken]);

    // ── Live countdown ──
    useEffect(() => {
        if (!group?.registrationDeadline) return;
        const tick = () => {
            const diff = new Date(group.registrationDeadline).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Expired"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [group]);

    const handleJoin = async () => {
        //   if (!isAuthenticated) {
        //     navigate("/Login", { state: { from: location.pathname } });
        //     return;
        //   }
        setJoining(true);
        try {
            const res = await joinGroupStudy(inviteToken!);
            toast.success("Joined successfully!");
            // ✅ Go straight to group dashboard where Pay button lives
            navigate(`/learn/group-study/${res.groupId}`, { replace: true });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to join group");
        } finally {
            setJoining(false);
        }
    };

    // ── Status config ──
    const groupStatusConfig: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
        open: { label: "Open", style: "text-green-700 bg-green-50 border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
        locked: { label: "Locked", style: "text-orange-700 bg-orange-50 border-orange-200", icon: <AlertCircle className="w-3.5 h-3.5" /> },
        active: { label: "Active", style: "text-[#8A63FF] bg-purple-50 border-purple-200", icon: <Sparkles className="w-3.5 h-3.5" /> },
        cancelled: { label: "Cancelled", style: "text-red-700 bg-red-50 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
    };

    const genStatusConfig: Record<string, { label: string; style: string }> = {
        pending: { label: "Queued", style: "text-yellow-700 bg-yellow-50 border-yellow-200" },
        generating_structure: { label: "Building…", style: "text-blue-700 bg-blue-50 border-blue-200" },
        payment_pending: { label: "Payment Required", style: "text-orange-700 bg-orange-50 border-orange-200" },
        generating_content: { label: "Writing…", style: "text-[#8A63FF] bg-purple-50 border-purple-200" },
        completed: { label: "Ready", style: "text-green-700 bg-green-50 border-green-200" },
        failed: { label: "Failed", style: "text-red-700 bg-red-50 border-red-200" },
    };

    const isExpired = group ? new Date() > new Date(group.registrationDeadline) : false;
    const isFull = group ? group.slotsLeft <= 0 : false;
    const canJoin = group?.status === "open" && !isExpired && !isFull;
    const statusConf = group ? (groupStatusConfig[group.status] || groupStatusConfig.open) : null;

    // ─────────────────────────────────────────────────────
    //  LOADING
    // ─────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-gray-100 font-mont">
            <Navbar />
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#8A63FF]" />
                <p className="text-gray-400 text-sm">Loading group details…</p>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────
    //  ERROR
    // ─────────────────────────────────────────────────────
    if (error || !group) return (
        <div className="min-h-screen bg-gray-100 font-mont">
            <Navbar />
            <div className="max-w-lg mx-auto px-4 py-20">
                <div className="bg-white rounded-[20px] shadow-md p-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite Link</h2>
                    <p className="text-gray-400 text-sm mb-6">{error || "This invite link doesn't exist or has expired."}</p>
                    <button
                        onClick={() => navigate("/course")}
                        className="bg-[#8A63FF] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#7A53EF] transition-colors"
                    >
                        Browse Courses
                    </button>
                </div>
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────
    //  MAIN
    // ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-100 font-mont">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-10">

                {/* ── Header Card ── */}
                <div className="bg-white rounded-[20px] shadow-md p-7 mb-5">

                    {/* Banner */}
                    <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-[#8A63FF]/15 to-purple-100 flex items-center justify-center mb-5">
                        <Users className="w-14 h-14 text-[#8A63FF]/60" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {statusConf && (
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${statusConf.style}`}>
                                {statusConf.icon} {statusConf.label}
                            </span>
                        )}
                        <span className="text-xs border border-gray-200 text-gray-500 px-3 py-1 rounded-full capitalize">
                            {group.skillLevel}
                        </span>
                        {group.generationStatus && (
                            <span className={`text-xs border px-3 py-1 rounded-full ${(genStatusConfig[group.generationStatus] || genStatusConfig.pending).style}`}>
                                {(genStatusConfig[group.generationStatus] || genStatusConfig.pending).label}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{group.title}</h1>
                    <p className="text-gray-400 text-sm mb-4">{group.topic}</p>

                    {/* Creator */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#8A63FF] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(group.creator?.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Created by</p>
                            <p className="text-sm font-semibold text-gray-900">{group.creator?.name || "Unknown"}</p>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-white rounded-[20px] shadow-md p-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-2">
                            <Users className="w-4 h-4 text-[#8A63FF]" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{group.membersCount}/{group.groupSize}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Members</p>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-md p-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-2">
                            <Zap className="w-4 h-4 text-[#8A63FF]" />
                        </div>
                        <p className="text-lg font-bold text-[#8A63FF]">
                            {group.pricePerPerson > 0 ? `₹${group.pricePerPerson}` : "TBD"}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Per Person</p>
                    </div>

                    <div className="bg-white rounded-[20px] shadow-md p-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-2">
                            <BarChart3 className="w-4 h-4 text-[#8A63FF]" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{group.slotsLeft}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Slots Left</p>
                    </div>

                    <div className={`rounded-[20px] shadow-md p-4 text-center ${isExpired ? "bg-red-50" : "bg-white"}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 ${isExpired ? "bg-red-100" : "bg-[#8A63FF]/10"}`}>
                            <Clock className={`w-4 h-4 ${isExpired ? "text-red-500" : "text-[#8A63FF]"}`} />
                        </div>
                        <p className={`text-sm font-bold ${isExpired ? "text-red-600" : "text-gray-900"}`}>
                            {isExpired ? "Expired" : timeLeft}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${isExpired ? "text-red-400" : "text-gray-400"}`}>
                            {isExpired ? "Closed" : "Remaining"}
                        </p>
                    </div>
                </div>

                {/* ── Deadline Info ── */}
                <div className={`rounded-[20px] shadow-md p-4 mb-5 flex items-center gap-3 ${isExpired ? "bg-red-50" : "bg-white"}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isExpired ? "bg-red-100" : "bg-orange-50"}`}>
                        <CalendarClock className={`w-4 h-4 ${isExpired ? "text-red-500" : "text-orange-500"}`} />
                    </div>
                    <div>
                        <p className={`text-sm font-semibold ${isExpired ? "text-red-700" : "text-gray-900"}`}>
                            {isExpired ? "Registration Closed" : "Registration Deadline"}
                        </p>
                        <p className={`text-xs mt-0.5 ${isExpired ? "text-red-500" : "text-gray-400"}`}>
                            {format(new Date(group.registrationDeadline), "dd MMM yyyy, hh:mm a")}
                            {!isExpired && ` · Closes ${formatDistanceToNow(new Date(group.registrationDeadline), { addSuffix: true })}`}
                        </p>
                    </div>
                </div>

                {/* ── Price Note (if TBD) ── */}
                {group.pricePerPerson === 0 && (
                    <div className="bg-purple-50 border border-purple-100 rounded-[20px] p-4 mb-5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4 text-[#8A63FF]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#8A63FF]">Price set by AI</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                The price will be determined once the AI finishes building the curriculum.
                                Your share will be split evenly across {group.groupSize} members.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Group Benefits ── */}
                <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#8A63FF]" /> What's included
                    </h3>
                    <div className="space-y-3">
                        {[
                            "AI-generated personalised curriculum",
                            "Full chapter content written by AI",
                            "AI Tutor — ask questions chapter by chapter",
                            "Quizzes with credit-based access",
                            "AI Podcast per chapter",
                            "Group leaderboard — compete with your study group",
                            "XP, levels and streak tracking",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-3 h-3 text-[#8A63FF]" />
                                </div>
                                <p className="text-sm text-gray-600">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA Card ── */}
                <div className="bg-white rounded-[20px] shadow-md p-6">
                    {joined ? (
                        /* ── Success State ── */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-[#8A63FF]/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-9 h-9 text-[#8A63FF]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">You're in! 🎉</h2>
                            <p className="text-gray-400 text-sm mb-2">
                                You've joined <span className="font-semibold text-gray-700">{group.title}</span>.
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                {group.pricePerPerson > 0
                                    ? `Once your payment of ₹${group.pricePerPerson} is confirmed by the admin, you'll get full access.`
                                    : "Once the AI sets the price and your payment is confirmed, you'll get full access."}
                            </p>
                            <button
                                onClick={() => navigate("/courses")}
                                className="flex items-center gap-2 mx-auto bg-[#8A63FF] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#7A53EF] transition-colors"
                            >
                                Browse More Courses <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                    ) : !canJoin ? (
                        /* ── Closed / Full State ── */
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-7 h-7 text-gray-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                {isExpired ? "Registration Closed" :
                                    isFull ? "Group is Full" :
                                        "Not Accepting Members"}
                            </h2>
                            <p className="text-gray-400 text-sm mb-5">
                                {isExpired ? "The registration deadline has passed." :
                                    isFull ? "All slots have been filled." :
                                        "This group is no longer accepting new members."}
                            </p>
                            <button
                                onClick={() => navigate("/courses")}
                                className="text-[#8A63FF] text-sm font-semibold hover:underline flex items-center gap-1 mx-auto"
                            >
                                Browse other courses <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                    ) : (
                        /* ── Join State ── */
                        <>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-sm text-gray-500">Your share</p>
                                    <p className="text-3xl font-bold text-[#8A63FF]">
                                        {group.pricePerPerson > 0 ? `₹${group.pricePerPerson}` : "Price TBD"}
                                    </p>
                                    {group.pricePerPerson > 0 && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            ₹{group.groupPrice} total ÷ {group.groupSize} people
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">{group.slotsLeft} slot{group.slotsLeft !== 1 ? "s" : ""} left</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {Array.from({ length: group.groupSize }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-2.5 h-2.5 rounded-full ${i < group.membersCount ? "bg-[#8A63FF]" : "bg-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{group.membersCount}/{group.groupSize} joined</p>
                                </div>
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="w-full bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-bold py-4 rounded-full disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-base"
                            >
                                {joining
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Joining…</>
                                    : <><Users className="w-5 h-5" /> Join Group Study</>}
                            </button>

                            {!isAuthenticated && (
                                <p className="text-xs text-gray-400 text-center mt-3">
                                    You'll be asked to sign in first
                                </p>
                            )}

                            <p className="text-xs text-gray-400 text-center mt-3">
                                By joining, you agree to pay once the admin confirms your slot.
                                If fewer than {group.groupSize} members join, the remaining cost is shared among those who paid.
                            </p>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GroupStudyJoin;
