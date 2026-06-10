import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CheckCircle, Clock, BookOpen, Loader2, CreditCard,
  Sparkles, AlertCircle, Users, Copy, Check, Link2
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  getCourse, payForCourse,
  getGroupByCourse,
  type ULearnCourse, type ULearnModule,
  payForGroupSlot,
} from "@/services/ulearnService";

const CourseGenerating = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  const topic = state?.topic || "your course";
  const isGroupStudy = state?.isGroupStudy === true;

  const [course, setCourse] = useState<ULearnCourse | null>(null);
  const [phase, setPhase] = useState<"structure" | "payment" | "content" | "done">("structure");
  const [paying, setPaying] = useState(false);

  // ── Group study state ──
  const [groupData, setGroupData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const inviteLink = groupData?.inviteToken
    ? `${window.location.origin}/learn/group-study/join/${groupData.inviteToken}`
    : state?.inviteToken
      ? `${window.location.origin}/learn/group-study/join/${state.inviteToken}`
      : null;

  // ── Poll course status ──
  useEffect(() => {
    if (!courseId) return;
    if (phase === "payment") return;

    const poll = async () => {
      try {
        const c = await getCourse(courseId);
        setCourse(c);

        if (c.generationStatus === "payment_pending") {
          setPhase("payment");
          // ✅ Fetch group data once we hit payment phase
          if (isGroupStudy) {
            try {
              const gRes = await getGroupByCourse(courseId);
              if (gRes.group) setGroupData(gRes.group);
            } catch { /* silent */ }
          }
        } else if (c.generationStatus === "generating_content") {
          setPhase("content");
        } else if (c.generationStatus === "completed") {
          setPhase("done");
          setTimeout(() => navigate(`/learn/course/${courseId}`), 1200);
        }
      } catch { /* retry */ }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [courseId, phase, navigate, isGroupStudy]);

  const handlePayment = async () => {
    if (!courseId) return;
    setPaying(true);
    try {
      if (isGroupStudy && groupData?._id) {
        // ✅ Group study — pay per slot
        await payForGroupSlot(groupData._id.toString());
        toast.success("Payment successful! Waiting for content generation.");
        setPhase("content");
      } else {
        // ✅ Solo course — pay for full course
        await payForCourse(courseId);
        toast.success("Payment successful! Resuming generation.");
        setPhase("content");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const copyInviteLink = (linkToCopy: string) => {
    if (!linkToCopy) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(linkToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = linkToCopy;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedLink(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const totalChapterCount = course?.modules?.reduce((a, m) => a + m.chapters.length, 0) || 0;
  const generatedCount = course?.modules?.reduce(
    (a, m) => a + m.chapters.filter((c) => c.contentGenerated).length, 0
  ) || 0;

  // ── Group price split (set by AI) ──
  const aiPrice = course?.price || 0;
  const groupPrice = groupData ? groupData.groupPrice : Math.ceil(aiPrice * 1.3);
  const groupSize = groupData?.groupSize || state?.groupSize || 5;
  const pricePerPerson = groupData?.pricePerPerson || (groupSize > 0 ? Math.ceil(groupPrice / groupSize) : 0);
  const membersJoined = groupData?.members?.length || 1;
  const paidCount = groupData?.members?.filter((m: any) => m.paymentStatus === "paid").length || 0;

  const phases = ["Structure", "Payment", "Content", "Complete"] as const;
  const phaseKeys = ["structure", "payment", "content", "done"] as const;

  return (
    <div className="min-h-screen bg-gray-100 font-mont">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Status Card */}
        {phase !== "payment" && (
          <div className="bg-white rounded-[20px] shadow-md p-8 mb-6 text-center">
            {phase === "done" ? (
              <CheckCircle className="w-14 h-14 text-[#8A63FF] mx-auto mb-4" />
            ) : (
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#8A63FF] mx-auto mb-4" />
            )}
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {phase === "structure" && "Building your curriculum…"}
              {phase === "content" && "Writing chapter content…"}
              {phase === "done" && "Your course is ready! 🎉"}
            </h1>
            <p className="text-gray-500 text-sm">
              {phase === "structure" && `Designing a personalised course for "${topic}"`}
              {phase === "content" && `${generatedCount} of ${totalChapterCount} chapters written`}
              {phase === "done" && "Redirecting you now…"}
            </p>
          </div>
        )}

        {/* Phase Bar */}
        <div className="bg-white rounded-[20px] shadow-md p-5 mb-6">
          <div className="flex gap-3">
            {phases.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={`h-2 rounded-full transition-all duration-700 ${phaseKeys[i] === phase ? "bg-[#8A63FF] animate-pulse" :
                  i < phaseKeys.indexOf(phase) ? "bg-[#8A63FF]" : "bg-gray-200"
                  }`} />
                <p className={`text-xs mt-1.5 text-center font-mont ${phaseKeys[i] === phase ? "text-[#8A63FF] font-semibold" :
                  i < phaseKeys.indexOf(phase) ? "text-gray-500" : "text-gray-300"
                  }`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Curriculum Outline */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-bold text-gray-900 mb-4 px-1">Curriculum Outline</h2>
            {course?.modules && course.modules.length > 0 ? (
              course.modules.map((mod: ULearnModule, mIdx) => (
                <div key={mod._id || mIdx} className="bg-white rounded-[20px] shadow-md p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[#8A63FF]" />
                    <h3 className="font-semibold text-gray-800 text-sm">{mod.title}</h3>
                    <span className="text-gray-400 text-xs ml-auto">{mod.chapters.length} chapters</span>
                  </div>
                  <div className="space-y-1.5">
                    {mod.chapters.map((ch, cIdx) => (
                      <div key={ch._id || cIdx} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50">
                        {ch.contentGenerated ? (
                          <CheckCircle className="w-4 h-4 text-[#8A63FF] shrink-0" />
                        ) : phase === "content" || phase === "done" ? (
                          <Loader2 className="w-4 h-4 text-[#8A63FF] animate-spin shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className={`text-sm font-mont ${ch.contentGenerated || phase === "payment" ? "text-gray-800" : "text-gray-400"}`}>
                          {ch.title}
                        </span>
                        <span className="ml-auto text-xs text-[#8A63FF] font-semibold">+{ch.xpReward} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white rounded-[20px] shadow-md animate-pulse" />
              ))
            )}
          </div>

          {/* Right: Payment / Info Panel */}
          <div className="space-y-4">
            {phase === "payment" && course ? (
              <>
                {/* ── Payment Card ── */}
                <div className="bg-white rounded-[20px] border-2 border-[#8A63FF] shadow-lg p-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <CreditCard className="w-6 h-6 text-[#8A63FF]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 font-mont">
                    {isGroupStudy ? "Group Course Ready!" : "Ready to Build!"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 font-mont">
                    {isGroupStudy
                      ? "AI has set the price. Your cost is split across the group."
                      : "Your AI curriculum outline is ready. Pay to generate full content."}
                  </p>

                  <div className="space-y-3 mb-5">
                    {isGroupStudy ? (
                      /* ── Group Price Breakdown ── */
                      <>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm font-mont">
                          <div className="flex justify-between text-gray-500">
                            <span>AI Course Price</span>
                            <span className="font-medium text-gray-700">${aiPrice}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Group Price (×1.3)</span>
                            <span className="font-medium text-gray-700">${groupPrice}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Group Size</span>
                            <span className="font-medium text-gray-700">{groupSize} people</span>
                          </div>
                          <div className="flex justify-between text-[#8A63FF] font-bold border-t border-gray-200 pt-2.5 text-base">
                            <span>Your Share</span>
                            <span>${pricePerPerson}</span>
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-3 space-y-1.5 border border-purple-100 text-xs font-mont">
                          <p className="font-semibold text-[#8A63FF] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Included per member:
                          </p>
                          <div className="flex justify-between text-gray-500">
                            <span>Quiz Credits</span>
                            <span className="font-semibold text-gray-700">{course.includedQuizCredits}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>AI Tutor Queries</span>
                            <span className="font-semibold text-gray-700">{course.includedQuestionTokens}</span>
                          </div>
                        </div>

                        {/* Member join status */}
                        <div className="flex items-center justify-between text-xs font-mont bg-gray-50 rounded-xl px-4 py-2.5">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            <span>{membersJoined}/{groupSize} joined</span>
                          </div>
                          <div className="text-green-600 font-semibold">
                            {paidCount} paid
                          </div>
                        </div>
                      </>
                    ) : (
                      /* ── Solo Price Breakdown ── */
                      <>
                        <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                          <span className="text-gray-600">Chapters ({totalChapterCount})</span>
                          <span className="font-semibold text-gray-900">${course.price}</span>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 space-y-2 border border-purple-100">
                          <p className="text-xs font-semibold text-[#8A63FF] flex items-center gap-1 font-mont">
                            <Sparkles className="w-3 h-3" /> Included for Free:
                          </p>
                          <div className="flex justify-between items-center text-xs font-mont">
                            <span className="text-gray-600">Quiz Credits</span>
                            <span className="font-semibold text-gray-900">{course.includedQuizCredits}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mont">
                            <span className="text-gray-600">AI Tutor Queries</span>
                            <span className="font-semibold text-gray-900">{course.includedQuestionTokens}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-bold text-gray-900 font-mont">Total Price</span>
                          <span className="text-xl font-bold text-[#8A63FF] font-mont">${course.price}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full bg-[#8A63FF] hover:bg-[#7A53EF] text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 font-mont"
                  >
                    {paying
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <CreditCard className="w-5 h-5" />}
                    {paying ? "Processing…" : isGroupStudy ? `Pay $${pricePerPerson}` : `Pay $${course.price}`}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1 font-mont">
                    <AlertCircle className="w-3 h-3" /> Test mode: No real charge
                  </p>
                </div>

                {/* ── Group Invite Card (only for group study) ── */}
                {isGroupStudy && (
                  <div className="bg-white rounded-[20px] shadow-md p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-[#8A63FF]/10 flex items-center justify-center shrink-0">
                        <Link2 className="w-4 h-4 text-[#8A63FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 font-mont">Invite Your Group</p>
                        <p className="text-xs text-gray-400 font-mont">
                          Share this link — they pay ${pricePerPerson} each
                        </p>
                      </div>
                    </div>

                    {/* Invite Link Box */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2 mb-3">
                      <p className="flex-1 text-xs text-gray-600 font-mont truncate">
                        {inviteLink || "Generating link…"}
                      </p>
                      <button
                        onClick={() => copyInviteLink(inviteLink || "")}
                        disabled={!inviteLink}
                        className="shrink-0 w-8 h-8 rounded-full bg-[#8A63FF]/10 flex items-center justify-center text-[#8A63FF] hover:bg-[#8A63FF]/20 transition-colors disabled:opacity-40"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Members */}
                    <div className="space-y-2">
                      {groupData?.members?.map((member: any, idx: number) => {
                        const statusStyle: Record<string, string> = {
                          paid: "text-green-700 bg-green-50 border-green-200",
                          pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
                          redistribution_pending: "text-orange-700 bg-orange-50 border-orange-200",
                          blocked: "text-red-700 bg-red-50 border-red-200",
                        };
                        return (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#8A63FF] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {(member.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-gray-700 font-mont truncate max-w-[100px]">
                                {member.name || "Member"}
                              </span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mont ${statusStyle[member.paymentStatus] || ""}`}>
                              {member.paymentStatus === "paid" ? "Paid ✅" :
                                member.paymentStatus === "pending" ? "Awaiting" : member.paymentStatus}
                            </span>
                          </div>
                        );
                      })}

                      {/* Empty slots */}
                      {Array.from({ length: Math.max(0, groupSize - (groupData?.members?.length || 0)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 opacity-40">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-[10px] shrink-0">?</div>
                          <span className="text-xs text-gray-400 font-mont">Empty slot</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-gray-400 font-mont mt-3 text-center">
                      If not all {groupSize} join, cost is redistributed among those who paid.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Standard Info Box while generating */
              <div className="bg-white rounded-[20px] shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3 font-mont">What happens next?</h3>
                <ul className="text-sm text-gray-500 space-y-3 font-mont">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-[#8A63FF] shrink-0 mt-0.5" />
                    <span>The AI analyzes your diagnostic test</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    <span>A curriculum skeleton is generated</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    <span>
                      {isGroupStudy
                        ? "AI sets the price — split across your group"
                        : "You review and approve the cost"}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    <span>Full text and podcasts are written</span>
                  </li>
                </ul>

                {/* Show invite link in structure phase too for group */}
                {isGroupStudy && state?.inviteToken && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 font-mont mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#8A63FF]" /> Share invite link
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                      <p className="flex-1 text-xs text-gray-500 font-mont truncate">
                        {`${window.location.origin}/learn/group-study/join/${state.inviteToken}`}
                      </p>
                      <button
                        onClick={() => copyInviteLink(`${window.location.origin}/learn/group-study/join/${state.inviteToken}`)}
                        className="shrink-0 w-8 h-8 rounded-full bg-[#8A63FF]/10 flex items-center justify-center text-[#8A63FF] hover:bg-[#8A63FF]/20 transition-colors"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mont mt-1.5">
                      Price will be shown once AI finishes the curriculum
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseGenerating;
