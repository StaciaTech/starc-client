import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ArrowLeft,
  X,
  BookOpen,
  Calendar,
  User,
  Calculator,
  CheckCircle2,
  UploadCloud,
  ImageIcon,
  Sparkles,
  Users,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/config/api";
import {
  addWeeks,
  subDays,
  format,
  isValid,
  differenceInWeeks,
  parseISO,
} from "date-fns";

const CreateSupervisedCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    technologies: [] as string[],
    prerequisites: "",
    learningObjectives: [] as string[],

    price: "",
    discount: "0",
    enrollmentDeadline: "",
    batchStartDate: "",
    batchEndDate: "",

    mentorName: "",
    mentorEmail: "",
    mentorBio: "",

    googleMeetLink: "",
    sessionDayOfWeek: "Saturday",
    sessionTime: "10:00",
    sessionDuration: "120",

    maxStudents: "30", // Default to 30
    assignmentRatio: "1", // ✅ New: Default 1 student per assignment
    projectRatio: "5", // ✅ New: Default 5 students per project group
  });

  const [techInput, setTechInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");

  // ✅ Image State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- Dynamic Calculation State ---
  const [durationInfo, setDurationInfo] = useState({
    totalWeeks: 0,
    teachingWeeks: 0,
    chapters: 0,
    message: "Select dates to calculate duration",
  });

  // --- Handlers ---

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "batchStartDate" && value && !prev.batchEndDate) {
        const startDate = new Date(value);
        if (isValid(startDate)) {
          const defaultEnd = addWeeks(startDate, 14);
          newData.batchEndDate = format(defaultEnd, "yyyy-MM-dd");
          const deadline = subDays(startDate, 3);
          newData.enrollmentDeadline = format(deadline, "yyyy-MM-dd");
        }
      }
      return newData;
    });
  };

  // ✅ Image Upload Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Duration Calculator Effect
  useEffect(() => {
    if (formData.batchStartDate && formData.batchEndDate) {
      const start = parseISO(formData.batchStartDate);
      const end = parseISO(formData.batchEndDate);

      if (isValid(start) && isValid(end) && end > start) {
        const weeks = differenceInWeeks(end, start);
        let teaching = Math.max(0, weeks - 2);
        let chapters = Math.floor(teaching / 2);

        if (weeks < 4) {
          setDurationInfo({
            totalWeeks: weeks,
            teachingWeeks: 0,
            chapters: 0,
            message: "⚠️ Too short. Min 4 weeks required.",
          });
        } else {
          setDurationInfo({
            totalWeeks: weeks,
            teachingWeeks: teaching,
            chapters: chapters,
            message: "Valid Schedule",
          });
        }
      }
    }
  }, [formData.batchStartDate, formData.batchEndDate]);

  // Array Helpers
  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };
  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  const addObjective = () => {
    if (
      objectiveInput.trim() &&
      !formData.learningObjectives.includes(objectiveInput.trim())
    ) {
      setFormData({
        ...formData,
        learningObjectives: [
          ...formData.learningObjectives,
          objectiveInput.trim(),
        ],
      });
      setObjectiveInput("");
    }
  };
  const removeObjective = (obj: string) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((o) => o !== obj),
    });
  };

  // 5. Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (durationInfo.chapters < 1) {
      toast.error("Course duration too short.");
      return;
    }

    const requiredFields = [
      formData.title,
      formData.description,
      formData.price,
      formData.mentorName,
      formData.mentorEmail,
      formData.batchStartDate,
      formData.batchEndDate,
    ];

    if (requiredFields.some((f) => !f)) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ Use FormData to handle file upload
      const data = new FormData();

      // Append basic fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (Array.isArray(value)) {
          // Append arrays (technologies, objectives)
          value.forEach((item) => data.append(`${key}[]`, item));
        } else {
          data.append(key, value as string);
        }
      });

      // ✅ Append Thumbnail File
      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      const response = await axios.post(
        `${API_URL}/api/admin/supervised-courses/create`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Course initialized successfully!");
        navigate(-1);
      }
    } catch (error: any) {
      console.error("Create course error:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10 -ml-2"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-4xl font-bold text-gray-900">
                Create Supervised Course
              </h1>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              AI will generate a custom schedule, curriculum, assignments, and
              projects.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Thumbnail Upload */}
                <div className="flex flex-col gap-2">
                  <Label>Course Thumbnail</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs h-40">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md shadow-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <ImageIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload thumbnail
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF (max. 2MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Course Title *</Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Full Stack Masterclass"
                    required
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Course details..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g. Web Development"
                      required
                    />
                  </div>
                  <div>
                    <Label>Level</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(val) =>
                        setFormData({ ...formData, level: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <Label>Technologies Covered</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="e.g., React, Node.js"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addTechnology())
                      }
                    />
                    <Button
                      type="button"
                      onClick={addTechnology}
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((t) => (
                      <span
                        key={t}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {t}{" "}
                        <button
                          type="button"
                          onClick={() => removeTechnology(t)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Objectives */}
                <div>
                  <Label>Learning Objectives</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={objectiveInput}
                      onChange={(e) => setObjectiveInput(e.target.value)}
                      placeholder="e.g., Build scalable APIs"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addObjective())
                      }
                    />
                    <Button
                      type="button"
                      onClick={addObjective}
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.learningObjectives.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 bg-gray-50 p-2 rounded-md border border-gray-100 text-sm"
                      >
                        <span className="font-bold text-purple-600 mt-0.5">
                          {i + 1}.
                        </span>
                        <span className="flex-1">{obj}</span>
                        <button
                          type="button"
                          onClick={() => removeObjective(obj)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.learningObjectives.length === 0 && (
                      <p className="text-xs text-gray-400 italic">
                        No objectives added yet.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Duration & Schedule */}
            <Card className="border-blue-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-5 h-5" />
                  Duration & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label>Batch Start Date *</Label>
                      <Input
                        type="date"
                        name="batchStartDate"
                        value={formData.batchStartDate}
                        onChange={handleDateChange}
                        required
                        className="border-blue-200 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label>Batch End Date *</Label>
                      <Input
                        type="date"
                        name="batchEndDate"
                        value={formData.batchEndDate}
                        onChange={handleDateChange}
                        required
                        className="border-blue-200 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Flexible duration
                      </p>
                    </div>
                    <div>
                      <Label>Enrollment Deadline</Label>
                      <Input
                        type="date"
                        name="enrollmentDeadline"
                        value={formData.enrollmentDeadline}
                        onChange={handleChange}
                        required
                        className="text-red-600"
                      />
                    </div>
                  </div>

                  {/* AI Calculator Preview */}
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold border-b pb-2">
                      <Calculator className="w-5 h-5" />
                      Curriculum Preview
                    </div>
                    {formData.batchStartDate && formData.batchEndDate ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Duration:</span>
                          <span className="font-medium">
                            {durationInfo.totalWeeks} Weeks
                          </span>
                        </div>
                        <div className="bg-white border border-purple-200 p-4 rounded-lg text-center mt-2 shadow-sm">
                          <p className="text-xs uppercase tracking-wider text-purple-600 font-bold mb-1">
                            AI Will Generate
                          </p>
                          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
                            {durationInfo.chapters}{" "}
                            <span className="text-lg font-normal text-gray-500">
                              Chapters
                            </span>
                          </div>
                        </div>
                        {durationInfo.totalWeeks < 4 && (
                          <p className="text-xs text-red-500 text-center">
                            ⚠️ Duration too short.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8 text-sm">
                        Select dates to preview.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ NEW: AI Content Configuration */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-5 h-5" />
                  AI Generation Settings
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Configure how the AI generates assignments and projects based
                  on your cohort size.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Max Students */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Cohort Size</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-48">
                            Total number of students expected in this batch.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        name="maxStudents"
                        value={formData.maxStudents}
                        onChange={handleChange}
                        className="pl-9 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Assignment Ratio */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Assignment Ratio</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-52">
                            <strong>Students per Assignment Variant.</strong>
                            <br />• Enter <strong>1</strong> = Every student
                            gets a unique assignment.
                            <br />• Enter <strong>5</strong> = 5 students get
                            the same assignment.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      name="assignmentRatio"
                      min="1"
                      value={formData.assignmentRatio}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500">
                      Generates{" "}
                      <strong>
                        {Math.ceil(
                          parseInt(formData.maxStudents || "0") /
                            parseInt(formData.assignmentRatio || "1"),
                        )}
                      </strong>{" "}
                      variants per chapter.
                    </p>
                  </div>

                  {/* Project Ratio */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Project Group Size</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-52">
                            <strong>Students per Capstone Project.</strong>
                            <br />
                            AI will generate unique project briefs for each
                            team.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        name="projectRatio"
                        min="1"
                        value={formData.projectRatio}
                        onChange={handleChange}
                        className="pl-9 bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Generates{" "}
                      <strong>
                        {Math.ceil(
                          parseInt(formData.maxStudents || "0") /
                            parseInt(formData.projectRatio || "1"),
                        )}
                      </strong>{" "}
                      unique capstone projects.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Mentor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" /> Mentor & Live
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mentor Name *</Label>
                    <Input
                      name="mentorName"
                      value={formData.mentorName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Mentor Email *</Label>
                    <Input
                      name="mentorEmail"
                      value={formData.mentorEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Meet Link *</Label>
                  <Input
                    name="googleMeetLink"
                    value={formData.googleMeetLink}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg border border-green-100">
                  <div>
                    <Label>Session Day</Label>
                    <Select
                      value={formData.sessionDayOfWeek}
                      onValueChange={(val) =>
                        setFormData({ ...formData, sessionDayOfWeek: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      name="sessionTime"
                      value={formData.sessionTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Duration (Min)</Label>
                    <Input
                      type="number"
                      name="sessionDuration"
                      value={formData.sessionDuration}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/courses")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || durationInfo.chapters < 1}
                className="bg-purple-600 hover:bg-purple-700 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-4 h-4" />{" "}
                    Generating...
                  </>
                ) : (
                  "Create & Generate Schedule"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CreateSupervisedCourse;
