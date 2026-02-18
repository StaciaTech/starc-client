import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpen,
  FileQuestion,
  Trash2,
  Sparkles,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import courseStructureService, {
  CourseStructure,
  Chapter,
  Subchapter,
  Section,
} from "@/services/courseStructureService";
import quizService, { IQuiz } from "@/services/quizService";
import { Badge } from "@/components/ui/badge";
import SectionContentModal from "@/components/admin/SectionContentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Interface definitions (Fixed)
interface ExtendedChapter extends Omit<Chapter, "_id" | "id"> {
  id?: string;
  _id?: string;
}

interface ExtendedSection extends Omit<Section, "_id" | "id"> {
  id?: string;
  _id?: string;
  generatedContent?: string;
  videoUrl?: string;
}

interface CourseStructureEditorProps {
  courseId: string;
  courseStructure: CourseStructure | null;
  onUpdate: (updatedStructure: CourseStructure) => void;
}

const CourseStructureEditor: React.FC<CourseStructureEditorProps> = ({
  courseId,
  courseStructure,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [expandedSubchapters, setExpandedSubchapters] = useState<{ [key: string]: boolean }>({});
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  
  // Modals state
  const [isAIChapterModalOpen, setIsAIChapterModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedSectionTitle, setSelectedSectionTitle] = useState("");
  const [selectedSectionContent, setSelectedSectionContent] = useState<string | undefined>("");
  const [selectedSectionVideoUrl, setSelectedSectionVideoUrl] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);

  // AI Generation State
  const [aiChapterTitle, setAIChapterTitle] = useState("");
  const [aiChapterDescription, setAIChapterDescription] = useState("");
  const [aiSubchapters, setAISubchapters] = useState<{ title: string; description: string }[]>([{ title: "", description: "" }]);
  const [aiGenerating, setAIGenerating] = useState(false);

  // --- Edit & Add State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItemType, setEditingItemType] = useState<"chapter" | "subchapter" | "new-subchapter" | "new-chapter" | null>(null);
  const [editingItemId, setEditingItemId] = useState<{ chapterId: string; subchapterId?: string } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  // Initial expansion state
  useEffect(() => {
    if (courseStructure?.chapters) {
      const chaptersState = courseStructure.chapters.reduce((acc, chapter, idx) => {
        const id = chapter.id || chapter._id || `idx-${idx}`;
        if (id) acc[id] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      setExpandedChapters((prev) => ({ ...prev, ...chaptersState }));
    }
  }, [courseStructure]);

  const fetchQuizzes = async () => {
     // ... (unchanged)
     try {
       if (!courseId) return;
       const quizzesData = await quizService.getQuizzesByCourse(courseId);
       setQuizzes(quizzesData);
     } catch (error) {
       console.error("Error fetching quizzes:", error);
     }
  };

  // ... (getItemId and toggles unchanged)
  
  const getItemId = (item: any): string => item.id || item._id || "";

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const toggleSubchapter = (subchapterId: string) => {
    setExpandedSubchapters((prev) => ({ ...prev, [subchapterId]: !prev[subchapterId] }));
  };



  // --- Edit Handlers ---
  const handleEditChapter = (chapter: ExtendedChapter) => {
    setEditingItemType("chapter");
    setEditingItemId({ chapterId: getItemId(chapter) });
    setEditTitle(chapter.title);
    setEditDescription(chapter.description);
    setIsEditModalOpen(true);
  };

  const handleEditSubchapter = (chapterId: string, subchapter: Subchapter) => {
    setEditingItemType("subchapter");
    setEditingItemId({ chapterId, subchapterId: getItemId(subchapter) });
    setEditTitle(subchapter.title);
    setEditDescription(subchapter.description);
    setIsEditModalOpen(true);
  };
  
  const openAddChapterModal = () => {
    setEditingItemType("new-chapter");
    setEditingItemId(null);
    setEditTitle("");
    setEditDescription("");
    setIsEditModalOpen(true);
  };

  const openAddSubchapterModal = (chapterId: string) => {
    setEditingItemType("new-subchapter");
    setEditingItemId({ chapterId });
    setEditTitle("");
    setEditDescription("");
    setIsEditModalOpen(true);
  };

  // ... (handleDeleteSubchapter unchanged)
  const handleDeleteSubchapter = async (chapterId: string, subchapterId: string) => {
    if (!courseStructure) return;
    if (!window.confirm("Are you sure you want to delete this subchapter?")) return;

    try {
        setLoading(true);
        const updatedChapters = courseStructure.chapters.map(ch => {
            const chId = getItemId(ch);
            if (chId === chapterId) {
                return {
                    ...ch,
                    subchapters: ch.subchapters.filter(sub => getItemId(sub) !== subchapterId)
                };
            }
            return ch;
        });

        const updatedStructure = { ...courseStructure, chapters: updatedChapters };
        await courseStructureService.updateCourseStructure(courseId, updatedStructure);
        onUpdate(updatedStructure);
        toast.success("Subchapter deleted");
    } catch (error) {
        toast.error("Failed to delete subchapter");
    } finally {
        setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!courseStructure) return;
    // For new-chapter, editingItemId is null, so validation differs
    if (editingItemType !== "new-chapter" && !editingItemId) return;

    if (!editTitle.trim()) {
        toast.error("Title is required");
        return;
    }

    try {
        setLoading(true);
        let updatedStructure = { ...courseStructure };

        if (editingItemType === "chapter" && editingItemId) {
            updatedStructure.chapters = updatedStructure.chapters.map(ch => {
                if (getItemId(ch) === editingItemId.chapterId) {
                    return { ...ch, title: editTitle, description: editDescription };
                }
                return ch;
            });
            await courseStructureService.updateCourseStructure(courseId, updatedStructure);
            onUpdate(updatedStructure);
            toast.success("Chapter updated");
        } else if (editingItemType === "subchapter" && editingItemId) {
            updatedStructure.chapters = updatedStructure.chapters.map(ch => {
                if (getItemId(ch) === editingItemId.chapterId) {
                    return {
                        ...ch,
                        subchapters: ch.subchapters.map(sub => {
                            if (getItemId(sub) === editingItemId.subchapterId) {
                                return { ...sub, title: editTitle, description: editDescription };
                            }
                            return sub;
                        })
                    };
                }
                return ch;
            });
             await courseStructureService.updateCourseStructure(courseId, updatedStructure);
             onUpdate(updatedStructure);
             toast.success("Subchapter updated");
        } else if (editingItemType === "new-subchapter" && editingItemId) {
             const newSubchapter: Subchapter = {
                 id: "", 
                 title: editTitle,
                 description: editDescription,
                 sections: [],
                 _id: ""
             };
             await courseStructureService.addSubchapter(courseId, editingItemId.chapterId, newSubchapter);
             const refreshed = await courseStructureService.getCourseStructure(courseId);
             if (refreshed) onUpdate(refreshed);
             toast.success("Subchapter added");
        } else if (editingItemType === "new-chapter") {
             const newChapter: Chapter = {
                 id: "",
                 _id: "",
                 title: editTitle,
                 description: editDescription,
                 subchapters: []
             };
             // Cast to Chapter to avoid strict type checks on id/_id if necessary, though defined as Chapter should be fine if optional
             await courseStructureService.addChapter(courseId, newChapter);
             const refreshed = await courseStructureService.getCourseStructure(courseId);
             if (refreshed) onUpdate(refreshed);
             toast.success("Chapter added");
        }

        setIsEditModalOpen(false);
    } catch (error) {
        console.error("Error saving:", error);
        toast.error("Failed to save changes");
    } finally {
        setLoading(false);
    }
  };

  // --- AI Chapter Generation ---
  const addSubchapterField = () => {
    setAISubchapters([...aiSubchapters, { title: "", description: "" }]);
  };

  const removeSubchapterField = (index: number) => {
    if (aiSubchapters.length > 1) {
      const updated = [...aiSubchapters];
      updated.splice(index, 1);
      setAISubchapters(updated);
    }
  };

  const updateSubchapterField = (index: number, field: "title" | "description", value: string) => {
    const updated = [...aiSubchapters];
    updated[index] = { ...updated[index], [field]: value };
    setAISubchapters(updated);
  };

  const handleGenerateAIChapter = async () => {
    if (!aiChapterTitle.trim()) {
      toast.error("Please provide a chapter title");
      return;
    }
    if (!aiSubchapters.some((sub) => sub.title.trim() !== "")) {
      toast.error("Please provide at least one subchapter title");
      return;
    }

    try {
      setAIGenerating(true);
      toast.info("Creating chapter with AI. This may take a moment...");

      const validSubchapters = aiSubchapters.filter((sub) => sub.title.trim() !== "");
      
      const newChapter = {
        title: aiChapterTitle,
        description: aiChapterDescription,
        subchapters: validSubchapters.map((subchapter, index) => ({
          title: subchapter.title,
          description: subchapter.description || "",
          order: index,
          sections: [
            {
              title: "Introduction to " + subchapter.title,
              description: "AI-generated introduction section",
              content: "",
              order: 0,
              learningObjectives: [],
              keywords: [],
            },
          ],
        })),
      };

      // Cast to unknown then Chapter to bypass missing _id check for new creation
      await courseStructureService.addChapter(courseId, newChapter as unknown as Chapter);
      toast.success(`Chapter "${aiChapterTitle}" created successfully!`);
      
      // Reset and refresh
      setAIChapterTitle("");
      setAIChapterDescription("");
      setAISubchapters([{ title: "", description: "" }]);
      setIsAIChapterModalOpen(false);
      
      const updated = await courseStructureService.getCourseStructure(courseId);
      if (updated) onUpdate(updated);
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast.error("Failed to create chapter");
    } finally {
      setAIGenerating(false);
    }
  };

  // --- Delete Chapter ---
  const openDeleteConfirmation = (chapterId: string, chapterTitle: string) => {
    setChapterToDelete({ id: chapterId, title: chapterTitle });
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteChapter = async () => {
    if (!courseId || !chapterToDelete) return;
    try {
      setLoading(true);
      await courseStructureService.deleteChapter(courseId, chapterToDelete.id);
      const updated = await courseStructureService.getCourseStructure(courseId);
      if (updated) onUpdate(updated);
      toast.success(`Chapter "${chapterToDelete.title}" deleted successfully`);
      setIsDeleteAlertOpen(false);
      setChapterToDelete(null);
    } catch (error) {
      toast.error("Failed to delete chapter");
    } finally {
      setLoading(false);
    }
  };

  // --- View Content ---
  const viewSectionContent = (section: ExtendedSection) => {
    setSelectedSectionTitle(section.title);
    setSelectedSectionVideoUrl(section.videoUrl || "");
    setLoadingContent(true);
    setIsContentModalOpen(true);
    if (section.generatedContent) {
      setSelectedSectionContent(section.generatedContent);
      setLoadingContent(false);
    } else {
      setSelectedSectionContent("No content available for this section.");
      setLoadingContent(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-lg font-medium text-gray-900">Course Structure</h3>
           <p className="text-sm text-gray-500">Manage chapters, subchapters and lessons.</p>
        </div>
         <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={openAddChapterModal}
                className="border-[#8A63FF] text-[#8A63FF] hover:bg-[#8A63FF]/10"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
            </Button>
            <Button
            onClick={() => setIsAIChapterModalOpen(true)}
            className="bg-[#8A63FF] hover:bg-[#7A53EF]"
            >
            <Sparkles className="h-4 w-4 mr-2" />
            Add Chapter with AI
            </Button>
         </div>
      </div>

      {!courseStructure?.chapters?.length ? (
         <div className="text-center py-12 bg-gray-50 border border-dashed rounded-lg">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">No chapters yet</h3>
            <p className="text-gray-500 text-sm mb-4">Get started by creating your first chapter.</p>
            <Button variant="outline" onClick={() => setIsAIChapterModalOpen(true)}>Create Chapter</Button>
         </div>
      ) : (
        <div className="space-y-6">
          {courseStructure.chapters.map((chapter, chapterIndex) => {
            const chapterId = getItemId(chapter) || `chapter-${chapterIndex}`;
            return (
              <Card key={chapterId} className="border-l-4 border-l-[#8A63FF]">
                <CardHeader
                  className="cursor-pointer py-4"
                  onClick={() => toggleChapter(chapterId)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <span className="bg-[#8A63FF]/10 text-[#8A63FF] text-xs px-2 py-0.5 rounded mr-3">
                           CH {chapterIndex + 1}
                        </span>
                        {chapter.title}
                      </CardTitle>
                      <CardDescription className="mt-1 ml-11">
                        {chapter.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Button
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditChapter(chapter as ExtendedChapter);
                        }}
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                       </Button>
                       <Button
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleChapter(chapterId);
                        }}
                       >
                         {expandedChapters[chapterId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                       </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirmation(chapterId, chapter.title);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedChapters[chapterId] && (
                  <CardContent className="pt-0 pl-11 pr-6 pb-6 bg-gray-50/50 border-t">
                    <div className="space-y-4 pt-4">
                      {chapter.subchapters.map((subchapter, subchapterIndex) => {
                        const subchapterId = getItemId(subchapter) || `sub-${chapterIndex}-${subchapterIndex}`;
                        return (
                          <div key={subchapterId} className="bg-white border rounded-lg p-4 shadow-sm">
                            <div 
                                className="flex justify-between items-start cursor-pointer group"
                                onClick={() => toggleSubchapter(subchapterId)}
                            >
                                <div>
                                    <h4 className="font-medium text-gray-900 flex items-center">
                                       <span className="text-xs text-gray-400 mr-2">{chapterIndex + 1}.{subchapterIndex + 1}</span>
                                       {subchapter.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-0.5 ml-6">{subchapter.description}</p>
                                </div>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSubchapter(chapterId, subchapter);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSubchapter(chapterId, subchapterId);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                    {expandedSubchapters[subchapterId] ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                </div>
                            </div>

                            {expandedSubchapters[subchapterId] && (
                                <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-2">
                                    {subchapter.sections.map((section, sectionIndex) => (
                                        <div 
                                            key={getItemId(section) || sectionIndex} 
                                            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded text-sm group"
                                        >
                                            <span className="text-gray-700">{section.title}</span>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => viewSectionContent(section)}
                                            >
                                                View Content
                                            </Button>
                                        </div>
                                    ))}
                                    {(!subchapter.sections || subchapter.sections.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">No sections created yet.</p>
                                    )}
                                </div>
                            )}
                          </div>
                        );
                      })}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-dashed"
                        onClick={() => openAddSubchapterModal(chapterId)}
                      >
                         <Plus className="h-4 w-4 mr-2" /> Add Subchapter
                      </Button>

                      {(!chapter.subchapters || chapter.subchapters.length === 0) && (
                          <p className="text-sm text-gray-500 italic text-center py-2 h-0 overflow-hidden">No subchapters found.</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* --- AI Generation Dialog --- */}
      <Dialog open={isAIChapterModalOpen} onOpenChange={setIsAIChapterModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#8A63FF]" />
              Generate Chapter with AI
            </DialogTitle>
            <DialogDescription>
              Describe your chapter and subchapters. AI will generate the content for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapterTitle">Chapter Title</Label>
              <Input
                id="chapterTitle"
                placeholder="e.g., Introduction to React Hooks"
                value={aiChapterTitle}
                onChange={(e) => setAIChapterTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterDesc">Description</Label>
              <Textarea
                id="chapterDesc"
                placeholder="Briefly describe what this chapter covers..."
                value={aiChapterDescription}
                onChange={(e) => setAIChapterDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Subchapters Plan</Label>
                <Button variant="outline" size="sm" onClick={addSubchapterField}>
                  <Plus className="h-4 w-4 mr-1" /> Add Subchapter
                </Button>
              </div>
              
              {aiSubchapters.map((sub, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                  {aiSubchapters.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => removeSubchapterField(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <Input
                      placeholder={`Subchapter ${index + 1} Title`}
                      value={sub.title}
                      onChange={(e) => updateSubchapterField(index, "title", e.target.value)}
                      className="bg-white"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={sub.description}
                      onChange={(e) => updateSubchapterField(index, "description", e.target.value)}
                      className="bg-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIChapterModalOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleGenerateAIChapter} 
                disabled={aiGenerating}
                className="bg-[#8A63FF] hover:bg-[#7A53EF] text-white"
            >
              {aiGenerating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Content
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Edit Modal --- */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {editingItemType === "chapter" ? "Edit Chapter" : editingItemType === "subchapter" ? "Edit Subchapter" : "Add Subchapter"}
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>{loading ? "Saving..." : "Save"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* --- Delete Confirmation --- */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chapter "{chapterToDelete?.title}"
              and all its associated contents (subchapters, sections, materials).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChapter} className="bg-red-600 hover:bg-red-700">
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Section Content Preview --- */}
      <SectionContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        title={selectedSectionTitle}
        content={selectedSectionContent}
        videoUrl={selectedSectionVideoUrl}
        isLoading={loadingContent}
      />
    </div>
  );
};

export default CourseStructureEditor;
