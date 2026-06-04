import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, BookOpen, Hash, ArrowLeft,
    ArrowRight, AlertCircle, Loader2,
} from "lucide-react";
import { useBook, useBookByCourse, useBookChapter } from "@/hooks/useBooks";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";


// ─────────────────────────────────────────────────────────
// SECTION READER
// ─────────────────────────────────────────────────────────
const SectionReader = ({ bookId, chapterId }: { bookId: string; chapterId: string }) => {
    const { data, isLoading, isError, refetch } = useBookChapter(bookId, chapterId, true);
    const chapter = data?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#8A63FF] animate-spin" />
            </div>
        );
    }

    if (isError || !chapter) {
        return (
            <div className="flex flex-col items-center py-16 gap-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-gray-400 text-sm">Could not load chapter content.</p>
                <button onClick={() => refetch()} className="text-[#8A63FF] text-sm hover:underline">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Chapter header */}
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                <p className="text-xs text-[#8A63FF] font-semibold uppercase tracking-wider mb-1">
                    Book Chapter
                </p>
                <h2 className="text-lg font-bold text-gray-900">{chapter.title}</h2>
                {chapter.summary && (
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{chapter.summary}</p>
                )}
                <div className="flex gap-3 mt-3 text-xs text-gray-400">
                    <span>{chapter.sections?.length ?? 0} sections</span>
                    <span>·</span>
                    <span>{chapter.totalWordCount?.toLocaleString()} words</span>
                </div>
            </div>

            {/* Sections */}
            {chapter.sections?.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">No sections yet.</p>
            ) : (
                chapter.sections?.map((section: any) => (
                    <div key={section._id} className="border border-gray-100 rounded-2xl overflow-hidden">
                        {/* Section header */}
                        <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-100">
                            <Hash className="w-3.5 h-3.5 text-[#8A63FF] shrink-0" />
                            <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                            <span className="ml-auto text-xs text-gray-400 shrink-0">
                                {section.wordCount?.toLocaleString()} words
                            </span>
                        </div>

                        {/* ✅ Markdown rendered content */}
                        <div className="px-6 py-6">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // ## → bold + purple
                                    h2: ({ children }) => (
                                        <h2 className="text-lg font-bold text-[#8A63FF] mt-6 mb-3 leading-snug">
                                            {children}
                                        </h2>
                                    ),
                                    // ### → bold + dark gray
                                    h3: ({ children }) => (
                                        <h3 className="text-base font-bold text-gray-700 mt-5 mb-2 leading-snug">
                                            {children}
                                        </h3>
                                    ),
                                    // #### → smaller subheading
                                    h4: ({ children }) => (
                                        <h4 className="text-sm font-bold text-gray-600 mt-4 mb-1.5">
                                            {children}
                                        </h4>
                                    ),
                                    // *text* → bold (single star = bold in this content)
                                    em: ({ children }) => (
                                        <strong className="font-semibold text-gray-900">{children}</strong>
                                    ),
                                    // **text** → bold + italic
                                    strong: ({ children }) => (
                                        <strong className="font-bold italic text-gray-900">{children}</strong>
                                    ),
                                    // Paragraphs
                                    p: ({ children }) => (
                                        <p className="text-sm text-gray-700 leading-[1.85] mb-4">{children}</p>
                                    ),
                                    // Unordered list
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-outside pl-5 mb-4 space-y-1.5 text-sm text-gray-700">
                                            {children}
                                        </ul>
                                    ),
                                    // Ordered list
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-outside pl-5 mb-4 space-y-1.5 text-sm text-gray-700">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="leading-relaxed">{children}</li>
                                    ),
                                    // Inline code `text`
                                    code: ({ node, className, children, ...props }: any) => {
                                        const isBlock = !!className; // fenced block has language class
                                        const language = className?.replace("language-", "") || "text";

                                        if (isBlock) {
                                            return (
                                                <SyntaxHighlighter
                                                    language={language}
                                                    style={oneDark}
                                                    customStyle={{
                                                        borderRadius: "12px",
                                                        fontSize: "13px",
                                                        marginTop: "12px",
                                                        marginBottom: "16px",
                                                        padding: "20px",
                                                    }}
                                                    showLineNumbers={true}
                                                    wrapLongLines={true}
                                                >
                                                    {String(children).replace(/\n$/, "")}
                                                </SyntaxHighlighter>
                                            );
                                        }

                                        // Inline code
                                        return (
                                            <code
                                                className="bg-purple-50 text-[#8A63FF] text-xs font-mono px-1.5 py-0.5 rounded-md border border-purple-100"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                    // Block quotes
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-[#8A63FF]/30 pl-4 py-1 my-4 bg-purple-50/50 rounded-r-xl italic text-gray-500 text-sm">
                                            {children}
                                        </blockquote>
                                    ),
                                    // Horizontal rule
                                    hr: () => (
                                        <hr className="border-gray-100 my-6" />
                                    ),
                                    // Tables
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-4 rounded-xl border border-gray-100">
                                            <table className="w-full text-sm">{children}</table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="bg-purple-50 text-[#8A63FF] font-semibold">{children}</thead>
                                    ),
                                    th: ({ children }) => (
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold border-b border-gray-100">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="px-4 py-2.5 text-xs text-gray-700 border-b border-gray-50">
                                            {children}
                                        </td>
                                    ),
                                }}
                            >
                                {section.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// BOOK READER PAGE
// ─────────────────────────────────────────────────────────
const BookReaderPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [activeChapterIdx, setActiveChapterIdx] = useState(0);

    // Get bookId from main server
    const { data: bookMeta, isLoading: metaLoading } = useBookByCourse(courseId);
    const bookId = bookMeta?.bookId ?? null;
    const bookGenerated = bookMeta?.bookGenerated ?? false;

    // Fetch full TOC
    const { data: bookData, isLoading: bookLoading } = useBook(
        bookId ?? undefined,
        !!bookId && bookGenerated
    );

    const book = bookData?.data;
    const activeChapter = book?.chapters?.[activeChapterIdx];
    const totalChapters = book?.chapters?.length ?? 0;

    // ── Loading ──────────────────────────────────────────
    if (metaLoading || bookLoading) {
        return (
            <div className="min-h-screen bg-gray-50 font-mont flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8A63FF]" />
                    <p className="text-gray-400 text-sm">Loading your book…</p>
                </div>
            </div>
        );
    }

    // ── Not ready ────────────────────────────────────────
    if (!bookId || !bookGenerated || !book) {
        return (
            <div className="min-h-screen bg-gray-50 font-mont flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">Book not available yet</p>
                    <p className="text-gray-400 text-sm mt-1">Come back once generation is complete.</p>
                    <button
                        onClick={() => window.close()}
                        className="mt-5 text-[#8A63FF] text-sm hover:underline"
                    >
                        Close tab
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-mont">

            {/* ── Top bar ──────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => window.close()}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-[#8A63FF] text-sm transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4" /> Close
                    </button>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#8A63FF] font-semibold truncate">{book.courseTitle}</p>
                        <h1 className="text-sm font-bold text-gray-900 truncate">{book.title}</h1>
                    </div>

                    {/* Chapter progress pill */}
                    <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                        Ch {activeChapterIdx + 1} / {totalChapters}
                    </span>
                </div>

                {/* Chapter tab strip */}
                <div className="max-w-5xl mx-auto px-4 pb-3">
                    <div className="flex gap-2 overflow-x-auto pb-0.5">
                        {book.chapters.map((ch: any, i: number) => (
                            <button
                                key={ch._id}
                                onClick={() => setActiveChapterIdx(i)}
                                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeChapterIdx === i
                                    ? "bg-[#8A63FF] text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-[#8A63FF]"
                                    }`}
                            >
                                Ch {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main content ─────────────────────────────── */}
            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* Book meta banner — only on first chapter */}
                {activeChapterIdx === 0 && (
                    <div className="bg-gradient-to-r from-[#8A63FF]/10 to-purple-50 border border-purple-100 rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#8A63FF]/20 flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6 text-[#8A63FF]" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-base">{book.title}</h2>
                                {book.description && (
                                    <p className="text-sm text-gray-500 mt-1">{book.description}</p>
                                )}
                                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                                    <span>{book.totalChapters} chapters</span>
                                    <span>·</span>
                                    <span>{(book.totalWordCount / 1000).toFixed(1)}k words</span>
                                    <span>·</span>
                                    <span className="capitalize">{book.skillLevel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chapter content */}
                {activeChapter && bookId && (
                    <SectionReader bookId={bookId} chapterId={activeChapter._id} />
                )}

                {/* ── Prev / Next ─────────────────────────── */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <button
                        disabled={activeChapterIdx === 0}
                        onClick={() => {
                            setActiveChapterIdx((i) => i - 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#8A63FF] disabled:opacity-30 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Previous Chapter
                    </button>

                    <span className="text-xs text-gray-300">
                        {activeChapterIdx + 1} of {totalChapters}
                    </span>

                    <button
                        disabled={activeChapterIdx === totalChapters - 1}
                        onClick={() => {
                            setActiveChapterIdx((i) => i + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center gap-2 bg-[#8A63FF] hover:bg-[#7A53EF] text-white text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-30 transition-colors"
                    >
                        Next Chapter <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookReaderPage;
