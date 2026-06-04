
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
    ArrowLeft,
    ArrowRight,
    BookMarked,
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    RefreshCcw,
    Sparkles,
    AlertTriangle,
    Eye,
    Copy,
} from "lucide-react";
import authService from "@/services/authService";
import {
    useBookCourses,
    useGenerateBook,
    useBookStatus,
    type CourseForBookGeneration,
    type BookGenerationStatus,
} from "@/hooks/useBooks";

interface AdminBookCourseCardProps {
    course: CourseForBookGeneration;
    tempBookId?: string | null;
    onGenerate: (courseId: string) => Promise<void>;
    isGeneratingThisCourse: boolean;
    onViewBook?: (bookId: string) => void;
}

const statusConfig: Record<
    BookGenerationStatus,
    {
        label: string;
        badgeClass: string;
        icon: React.ComponentType<{ className?: string }>;
    }
> = {
    pending: {
        label: "Pending",
        badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Clock3,
    },
    generating: {
        label: "Generating",
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Loader2,
    },
    completed: {
        label: "Completed",
        badgeClass: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
    },
    failed: {
        label: "Failed",
        badgeClass: "bg-red-100 text-red-700 border-red-200",
        icon: AlertTriangle,
    },
};

const AdminBookCourseCard: React.FC<AdminBookCourseCardProps> = ({
    course,
    tempBookId,
    onGenerate,
    isGeneratingThisCourse,
    onViewBook,
}) => {
    const effectiveBookId = course.bookId || tempBookId || undefined;

    const { data: statusResponse, isFetching: isFetchingStatus } = useBookStatus(
        effectiveBookId,
        {
            enabled: !!effectiveBookId,
            refetchInterval: 5000,
        }
    );

    const status = statusResponse?.data?.status
        ? statusResponse.data.status
        : course.bookGenerated
            ? "completed"
            : "pending";

    const progress = statusResponse?.data?.progress;
    const chapterStatuses = statusResponse?.data?.chapterStatuses || [];
    const error = statusResponse?.data?.error;

    const statusMeta = statusConfig[status];
    const StatusIcon = statusMeta.icon;

    const canGenerate = !effectiveBookId && !isGeneratingThisCourse;
    const isGenerated = status === "completed";
    const isGenerating = status === "generating" || isGeneratingThisCourse;

    const handleCopyBookId = async () => {
        if (!effectiveBookId) return;
        try {
            await navigator.clipboard.writeText(effectiveBookId);
            toast.success("Book ID copied");
        } catch {
            toast.error("Failed to copy Book ID");
        }
    };

    return (
        <Card className="group border-2 border-transparent hover:border-[#8A63FF] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="bg-purple-50 p-4 rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <BookMarked className="h-8 w-8 text-[#8A63FF]" />
                    </div>

                    <Badge className={`${statusMeta.badgeClass} border`}>
                        <StatusIcon
                            className={`h-3.5 w-3.5 mr-1 ${status === "generating" ? "animate-spin" : ""}`}
                        />
                        {statusMeta.label}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <CardTitle className="text-xl text-gray-800 group-hover:text-[#8A63FF] transition-colors">
                        {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {course.topic}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-purple-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">Skill Level</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize">
                            {course.skillLevel}
                        </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">Chapters</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {course.chapters}
                        </p>
                    </div>
                </div>

                {effectiveBookId && (
                    <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/60 p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 mb-1">Book ID</p>
                                <p className="text-xs font-mono text-gray-700 truncate">
                                    {effectiveBookId}
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-[#8A63FF] hover:text-[#7047e0]"
                                onClick={handleCopyBookId}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {progress && (
                    <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">
                                Generation Progress
                            </span>
                            <span className="text-[#8A63FF] font-semibold">
                                {progress.percentage}%
                            </span>
                        </div>

                        <Progress value={progress.percentage} className="h-2" />

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                                {progress.completedChapters} / {progress.totalChapters} chapters
                            </span>
                            {isFetchingStatus && (
                                <span className="flex items-center gap-1 text-blue-600">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Updating
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {chapterStatuses.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800">
                            Chapter Status
                        </p>

                        <div className="space-y-2 max-h-44 overflow-auto pr-1">
                            {chapterStatuses.map((chapter) => {
                                const chapterMeta =
                                    statusConfig[chapter.status as BookGenerationStatus];
                                return (
                                    <div
                                        key={chapter.title}
                                        className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-white p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {chapter.title}
                                            </p>
                                            {chapter.error && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {chapter.error}
                                                </p>
                                            )}
                                        </div>

                                        <Badge className={`${chapterMeta.badgeClass} border shrink-0`}>
                                            {chapterMeta.label}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-700">
                            Generation Error
                        </p>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                    <Button
                        onClick={() => onGenerate(course._id)}
                        disabled={!canGenerate}
                        className="bg-[#8A63FF] hover:bg-[#7047e0]"
                    >
                        {isGeneratingThisCourse ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Starting...
                            </>
                        ) : isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating
                            </>
                        ) : isGenerated ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Book Created
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Book
                            </>
                        )}
                    </Button>

                    {effectiveBookId && (
                        <Button
                            variant="outline"
                            className="border-[#8A63FF] text-[#8A63FF] hover:bg-purple-50"
                            onClick={() => onViewBook?.(effectiveBookId)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const AdminULBooksPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [startingCourseId, setStartingCourseId] = useState<string | null>(null);
    const [tempBookIds, setTempBookIds] = useState<Record<string, string>>({});

    const {
        data: coursesResponse,
        isLoading: isCoursesLoading,
        isFetching: isCoursesFetching,
        refetch,
    } = useBookCourses();

    const generateBookMutation = useGenerateBook();

    const courses = coursesResponse?.data || [];

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const userData = await authService.getCurrentUser();

                if (userData.data.role === "admin") {
                    setIsAdmin(true);
                    setAdminName(userData.data.name || "Admin");
                } else {
                    toast.error("You do not have permission to access this page");
                    navigate("/");
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
                toast.error("Authentication error");
                navigate("/LoginPage");
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [navigate]);

    const stats = useMemo(() => {
        const generatingCount = courses.filter((course) => {
            const possibleTemp = tempBookIds[course._id];
            return !!possibleTemp || !!course.bookId;
        }).length;

        const createdCount = courses.filter((course) => course.bookGenerated).length;

        return {
            totalCourses: courses.length,
            createdBooks: createdCount,
            notGenerated: Math.max(courses.length - createdCount, 0),
            processing: Math.max(generatingCount - createdCount, 0),
        };
    }, [courses, tempBookIds]);

    const handleGenerateBook = async (courseId: string) => {
        try {
            setStartingCourseId(courseId);
            const response = await generateBookMutation.mutateAsync(courseId);

            if (response?.bookId) {
                setTempBookIds((prev) => ({
                    ...prev,
                    [courseId]: response.bookId,
                }));
            }

            refetch();
        } catch (error) {
            console.error("Generate book failed:", error);
        } finally {
            setStartingCourseId(null);
        }
    };

    const handleViewBook = (bookId: string) => {
        navigate(`/admin/unsupervised-books/${bookId}`);
    };

    if (loading || isCoursesLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <Spinner className="h-12 w-12 text-[#8A63FF]" />
                    <span className="ml-2 text-gray-600">Loading Book Management...</span>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Access Denied
                        </h1>
                        <p className="text-gray-600 mb-4">
                            You do not have permission to access this page.
                        </p>
                        <Button onClick={() => navigate("/")}>Return to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
            <Navbar />

            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        className="mb-4 text-[#8A63FF] hover:text-[#7047e0] hover:bg-purple-50"
                        onClick={() => navigate("/admin")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Admin Dashboard
                    </Button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                Unsupervised Book Management
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Welcome back, {adminName}. Generate and track AI books for
                                unsupervised learning courses.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            className="border-[#8A63FF] text-[#8A63FF] hover:bg-purple-50"
                        >
                            <RefreshCcw
                                className={`h-4 w-4 mr-2 ${isCoursesFetching ? "animate-spin" : ""}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <BookOpen className="h-6 w-6 text-[#8A63FF]" />
                                </div>
                            </div>
                            <p className="text-sm text-[#8A63FF] opacity-90 mb-1">
                                Total Courses
                            </p>
                            <p className="text-3xl font-bold text-[#8A63FF]">
                                {stats.totalCourses}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-green-600 opacity-90 mb-1">
                                Books Created
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {stats.createdBooks}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Loader2 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-sm text-blue-600 opacity-90 mb-1">
                                In Progress
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {stats.processing}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Sparkles className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-sm text-orange-600 opacity-90 mb-1">
                                Not Generated
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {stats.notGenerated}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-lg mb-8">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">Books Overview</CardTitle>
                                <CardDescription>
                                    Generate books once per course and track chapter-level progress.
                                </CardDescription>
                            </div>

                            <Badge className="bg-purple-100 text-[#8A63FF] border-purple-200">
                                Admin Only
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {courses.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                                    <BookMarked className="h-8 w-8 text-[#8A63FF]" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No Courses Found
                                </h3>
                                <p className="text-gray-600">
                                    Once unsupervised courses are available, they will appear here
                                    for book generation.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {courses.map((course) => (
                                    <AdminBookCourseCard
                                        key={course._id}
                                        course={course}
                                        tempBookId={tempBookIds[course._id]}
                                        onGenerate={handleGenerateBook}
                                        isGeneratingThisCourse={startingCourseId === course._id}
                                        onViewBook={handleViewBook}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">How This Works</CardTitle>
                        <CardDescription>
                            Quick reference for the book generation workflow
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="rounded-xl bg-purple-50 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-[#8A63FF] font-bold">
                                        1
                                    </div>
                                    <p className="font-semibold text-gray-800">Select Course</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Pick any unsupervised course that does not have a generated
                                    book yet.
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        2
                                    </div>
                                    <p className="font-semibold text-gray-800">Generate Book</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    The system starts background generation and updates chapter
                                    progress automatically.
                                </p>
                            </div>

                            <div className="rounded-xl bg-green-50 p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                        3
                                    </div>
                                    <p className="font-semibold text-gray-800">Track Status</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Watch live progress, inspect failures, and open the created
                                    book once generation completes.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                variant="ghost"
                                className="text-[#8A63FF] hover:text-[#7047e0]"
                                onClick={() => navigate("/admin")}
                            >
                                Back to Dashboard
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminULBooksPage;
