import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users, Trophy, Clock, CheckCircle, XCircle,
    AlertCircle, BookOpen, ChevronLeft, RefreshCw,
    CalendarClock, Zap, Crown, Sparkles, Link2, Copy, Check,
    CreditCard
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { getGroupDetails, type GroupStudyCourse, type GroupMember, payForGroupSlot } from "@/services/ulearnService";
import { useAuth } from "@/App";

const paymentStatusConfig: Record<string, { label: string; style: string }> = {
    paid: { label: "Paid ✅", style: "text-green-700 bg-green-50 border-green-200" },
    pending: { label: "Awaiting Payment", style: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    redistribution_pending: { label: "Extra Due", style: "text-orange-700 bg-orange-50 border-orange-200" },
    blocked: { label: "Blocked", style: "text-red-700 bg-red-50 border-red-200" },
};

const groupStatusConfig: Record<string, { label: string; style: string }> = {
    open: "text-green-700 bg-green-50 border-green-200",
    locked: "text-orange-700 bg-orange-50 border-orange-200",
    active: "text-[#8A63FF] bg-purple-50 border-purple-200",
    cancelled: "text-red-700 bg-red-50 border-red-200",
} as any;

const GroupStudyDashboard = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;

    const [group, setGroup] = useState<GroupStudyCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [paying, setPaying] = useState(false);


    const load = async () => {
        try {
            const res = await getGroupDetails(groupId!);
            setGroup(res.group);
        } catch {
            toast.error("Could not load group");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [groupId]);

    // ── Live countdown ──
    useEffect(() => {
        if (!group?.registrationDeadline) return;
        const tick = () => {
            const diff = new Date(group.registrationDeadline).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Closed"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [group]);

    const copyInviteLink = () => {
        if (!group?.inviteToken) return;
        const link = `${window.location.origin}/learn/group-study/join/${group.inviteToken}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success("Invite link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Helpers ──
    const getMyMember = () => {
        if (!group || !userId) return null;
        return group.members?.find(m => {
            const mId = (m.userId as any)?._id || m.userId;
            return mId?.toString() === userId?.toString();
        });
    };

    const isExpired = group ? new Date() > new Date(group.registrationDeadline) : false;
    const myMember = getMyMember();
    const paidCount = group?.members?.filter(m => m.paymentStatus === "paid").length || 0;
    const inviteLink = group ? `${window.location.origin}/learn/group-study/join/${group.inviteToken}` : "";
    const handlePay = async () => {
        if (!group?._id) return;
        setPaying(true);
        try {
            const res = await payForGroupSlot(group._id.toString());
            toast.success("Payment successful!");
            if (res.hasAccess && group.courseId) {
                navigate(`/learn/course/${group.courseId}`);
            } else {
                await load(); // refresh to show updated status
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Payment failed");
        } finally {
            setPaying(false);
        }
    };

    // ─────────────────────────────────────────────────────
    //  LOADING
    // ─────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-gray-100 font-mont">
            <Navbar />
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#8A63FF]" />
                <p className="text-gray-400 text-sm">Loading group…</p>
            </div>
        </div>
    );

    if (!group) return (
        <div className="min-h-screen bg-gray-100 font-mont">
            <Navbar />
            <div className="flex items-center justify-center py-32 text-gray-400">Group not found.</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-mont">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* ── Back ── */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-gray-400 hover:text-[#8A63FF] text-sm mb-5 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* ══════════════════════════════════════════
            HEADER CARD
        ══════════════════════════════════════════ */}
                <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-[#8A63FF]" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-gray-900 truncate">{group.title}</h1>
                                <p className="text-xs text-gray-400 mt-0.5 capitalize">{group.skillLevel} · {group.topic}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${(groupStatusConfig as any)[group.status] || ""}`}>
                                {group.status.toUpperCase()}
                            </span>
                            <button
                                onClick={load}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#8A63FF] hover:bg-purple-50 transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-base font-bold text-gray-900">{group.members?.length || 0}/{group.groupSize}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Members</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-base font-bold text-[#8A63FF]">
                                {group.pricePerPerson > 0 ? `$${group.pricePerPerson}` : "TBD"}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Per Person</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-base font-bold text-green-600">{paidCount}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Paid</p>
                        </div>
                        <div className={`rounded-xl p-3 text-center ${isExpired ? "bg-red-50" : "bg-gray-50"}`}>
                            <p className={`text-xs font-bold ${isExpired ? "text-red-600" : "text-gray-900"}`}>
                                {isExpired ? "Closed" : timeLeft}
                            </p>
                            <p className={`text-[11px] mt-0.5 ${isExpired ? "text-red-400" : "text-gray-400"}`}>
                                {isExpired ? "Expired" : "Left"}
                            </p>
                        </div>
                    </div>

                    {/* Deadline row */}
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                        <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                            Deadline: {format(new Date(group.registrationDeadline), "dd MMM yyyy, hh:mm a")}
                            {!isExpired && ` · closes ${formatDistanceToNow(new Date(group.registrationDeadline), { addSuffix: true })}`}
                        </span>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            MY STATUS CARD
        ══════════════════════════════════════════ */}
                {/* ✅ Replace the existing status card content bottom section */}
                {myMember && (
                    <div className={`rounded-[20px] shadow-md p-5 mb-5 border ${paymentStatusConfig[myMember.paymentStatus || 'pending']?.style || ''}`}>
                {/* ...existing icon + text content stays... */}

                {/* ✅ NEW — Pay Now CTA */}
                {myMember.paymentStatus === "pending" && myMember.amountDue > 0 && !myMember.hasAccess && (
                    <button
                        onClick={handlePay}
                        disabled={paying}
                        className="mt-4 w-full bg-[#8A63FF] text-white font-semibold py-2.5 rounded-full text-sm hover:bg-[#7A53EF] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {paying ? (
                            <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                        ) : (
                            <><CreditCard className="w-4 h-4" /> Pay ${myMember.amountDue} Now</>
                        )}
                    </button>
                )}

                {/* Redistribution extra pay */}
                {myMember.paymentStatus === "redistribution_pending" && (
                    <button
                        onClick={handlePay}
                        disabled={paying}
                        className="mt-4 w-full bg-orange-500 text-white font-semibold py-2.5 rounded-full text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {paying ? (
                            <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                        ) : (
                            <><AlertCircle className="w-4 h-4" /> Pay Extra ${(myMember.amountDue - myMember.amountPaid).toFixed(0)}</>
                        )}
                    </button>
                )}

                {/* Go to course */}
                {myMember.hasAccess && group.courseId && (
                    <button
                        onClick={() => navigate(`/learn/course/${group.courseId}`)}
                        className="mt-4 w-full bg-[#8A63FF] text-white font-semibold py-2.5 rounded-full text-sm hover:bg-[#7A53EF] transition-colors flex items-center justify-center gap-2"
                    >
                        <BookOpen className="w-4 h-4" /> Go to Course
                    </button>
                )}
            </div>
)}


            {/* ══════════════════════════════════════════
            REDISTRIBUTION NOTICE
        ══════════════════════════════════════════ */}
            {group.redistributionTriggered && group.redistributionAmount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-[20px] p-4 mb-5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-orange-700">Redistribution Applied</p>
                        <p className="text-xs text-orange-600 mt-0.5">
                            {group.groupSize - (group.members?.length || 0)} slot(s) went unfilled after the deadline.
                            Each paid member owes an additional ${group.redistributionAmount.toFixed(0)}.
                            Contact admin to complete the extra payment.
                        </p>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
            MEMBERS LIST
        ══════════════════════════════════════════ */}
            <div className="bg-white rounded-[20px] shadow-md p-6 mb-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#8A63FF]" />
                        Members ({group.members?.length || 0}/{group.groupSize})
                    </h2>
                </div>

                {/* Filled slots */}
                <div className="space-y-2.5">
                    {group.members?.map((member: any, idx: number) => {
                        const memberUser = member.userId as any;
                        const name = memberUser?.name || member.name || "Unknown";
                        const isMe = (memberUser?._id || member.userId)?.toString() === userId?.toString();
                        const isCreator = (memberUser?._id || member.userId)?.toString() === (group.creatorId as any)?._id?.toString()
                            || (memberUser?._id || member.userId)?.toString() === group.creatorId?.toString();
                        const pConf = paymentStatusConfig[member.paymentStatus] || paymentStatusConfig.pending;

                        return (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-[#8A63FF] flex items-center justify-center text-white font-bold text-sm">
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    {isCreator && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                                            <Crown className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Name + amount */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                                        {isMe && (
                                            <span className="text-[10px] text-[#8A63FF] bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full shrink-0">You</span>
                                        )}
                                        {isCreator && (
                                            <span className="text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded-full shrink-0">Creator</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        ${member.amountPaid} paid
                                        {member.amountDue > 0 && ` / $${member.amountDue} due`}
                                    </p>
                                </div>

                                {/* Payment status badge */}
                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${pConf.style}`}>
                                    {pConf.label}
                                </span>
                            </div>
                        );
                    })}

                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, group.groupSize - (group.members?.length || 0)) }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 opacity-40">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                <span className="text-gray-400 text-sm font-bold">?</span>
                            </div>
                            <p className="text-sm text-gray-400">Empty slot</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════
            INVITE LINK (only if group still open)
        ══════════════════════════════════════════ */}
            {group.status === "open" && !isExpired && (
                <div className="bg-white rounded-[20px] shadow-md p-5 mb-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
                            <Link2 className="w-4 h-4 text-[#8A63FF]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Invite More Members</p>
                            <p className="text-xs text-gray-400">{group.groupSize - (group.members?.length || 0)} slot(s) remaining</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                        <p className="flex-1 text-xs text-gray-500 truncate">{inviteLink}</p>
                        <button
                            onClick={copyInviteLink}
                            className="shrink-0 w-8 h-8 rounded-full bg-[#8A63FF]/10 flex items-center justify-center text-[#8A63FF] hover:bg-[#8A63FF]/20 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
            ACTION CARDS
        ══════════════════════════════════════════ */}
            <div className={`grid gap-4 ${group.status === "active" && group.courseId ? "grid-cols-2" : "grid-cols-1"}`}>

                {/* Go to Course */}
                {group.status === "active" && group.courseId && myMember?.hasAccess && (
                    <button
                        onClick={() => navigate(`/learn/course/${group.courseId}`)}
                        className="bg-[#8A63FF] rounded-[20px] shadow-md p-5 flex items-center justify-between hover:shadow-lg hover:bg-[#7A53EF] transition-all text-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-sm">Go to Course</p>
                                <p className="text-xs text-white/70 mt-0.5">Start learning</p>
                            </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                )}

                {/* Leaderboard */}
                {group.status === "active" && group.courseId && (
                    <button
                        onClick={() => navigate(`/learn/group-study/${groupId}/leaderboard`)}
                        className="bg-white rounded-[20px] shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#8A63FF]/10 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-[#8A63FF]" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900 text-sm">Leaderboard</p>
                                <p className="text-xs text-gray-400 mt-0.5">See group rankings</p>
                            </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </button>
                )}

                {/* Course still generating */}
                {group.courseId && group.generationStatus !== "completed" && group.generationStatus !== "failed" && (
                    <button
                        onClick={() => navigate(`/learn/generating/${group.courseId}`, {
                            state: { topic: group.topic, isGroupStudy: true, inviteToken: group.inviteToken, groupId: group._id, groupSize: group.groupSize }
                        })}
                        className="bg-white rounded-[20px] shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-shadow col-span-full"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#8A63FF]/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-[#8A63FF]" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900 text-sm">View Generation Progress</p>
                                <p className="text-xs text-gray-400 mt-0.5 capitalize">Status: {group.generationStatus?.replace(/_/g, " ")}</p>
                            </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </button>
                )}
            </div>

        </div>
        </div >
    );
};

export default GroupStudyDashboard;
