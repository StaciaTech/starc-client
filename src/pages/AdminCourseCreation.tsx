import React, { useState } from "react";
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
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  X,
  BookOpen,
  Calendar,
  User,
  Video,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/config/api";

const CreateSupervisedCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    category: "",
    level: "beginner",
    technologies: [] as string[],
    prerequisites: "",
    learningObjectives: [] as string[],

    // Pricing & Dates
    price: "",
    discount: "0",
    enrollmentDeadline: "",
    batchStartDate: "",

    // Mentor Info
    mentorName: "",
    mentorEmail: "",
    mentorBio: "",

    // Mentoring Session
    googleMeetLink: "",
    sessionDayOfWeek: "Saturday",
    sessionTime: "10:00",
    sessionDuration: "120",

    // Optional
    thumbnail: "",
    maxStudents: "",
  });

  const [techInput, setTechInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add technology
  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };

  // Remove technology
  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  // Add learning objective
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

  // Remove learning objective
  const removeObjective = (obj: string) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((o) => o !== obj),
    });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.price ||
      !formData.mentorName ||
      !formData.mentorEmail ||
      !formData.googleMeetLink ||
      !formData.enrollmentDeadline ||
      !formData.batchStartDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/api/admin/supervised-courses/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        // Navigate to status page to watch AI generation
        navigate(`/admin/courses/${response.data.data.courseId}/status`);
      }
    } catch (error: any) {
      console.error("Create course error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create course";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Web Development",
    "Mobile Development",
    "IoT & Embedded Systems",
    "Electronics",
    "Mechanical Engineering",
    "AI & Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "Data Science",
    "DevOps",
  ];

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Supervised Course
          </h1>
          <p className="text-gray-600">
            AI will automatically generate course content, quizzes, assignments,
            and mentor plan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core course details and learning outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Full Stack Web Development with MERN"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <Label>Technologies/Tools Covered</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g., React, Node.js, MongoDB"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTechnology())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addTechnology}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  name="prerequisites"
                  value={formData.prerequisites}
                  onChange={handleChange}
                  placeholder="What should students know before taking this course?"
                  rows={2}
                />
              </div>

              {/* Learning Objectives */}
              <div>
                <Label>Learning Objectives</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    placeholder="e.g., Build full-stack web applications"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addObjective())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addObjective}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {formData.learningObjectives.map((obj, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 bg-gray-50 p-2 rounded"
                    >
                      <span className="text-purple-600 font-bold">
                        {index + 1}.
                      </span>
                      <span className="flex-1">{obj}</span>
                      <button
                        type="button"
                        onClick={() => removeObjective(obj)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pricing & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="15000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="10"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label htmlFor="enrollmentDeadline">
                    Enrollment Deadline *
                  </Label>
                  <Input
                    id="enrollmentDeadline"
                    name="enrollmentDeadline"
                    type="date"
                    value={formData.enrollmentDeadline}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="batchStartDate">Batch Start Date *</Label>
                  <Input
                    id="batchStartDate"
                    name="batchStartDate"
                    type="date"
                    value={formData.batchStartDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxStudents">Max Students (Optional)</Label>
                  <Input
                    id="maxStudents"
                    name="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    placeholder="30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Mentor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mentorName">Mentor Name *</Label>
                  <Input
                    id="mentorName"
                    name="mentorName"
                    value={formData.mentorName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mentorEmail">Mentor Email *</Label>
                  <Input
                    id="mentorEmail"
                    name="mentorEmail"
                    type="email"
                    value={formData.mentorEmail}
                    onChange={handleChange}
                    placeholder="mentor@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mentorBio">Mentor Bio (Optional)</Label>
                <Textarea
                  id="mentorBio"
                  name="mentorBio"
                  value={formData.mentorBio}
                  onChange={handleChange}
                  placeholder="Brief introduction about the mentor..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mentoring Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Mentoring Session Details
              </CardTitle>
              <CardDescription>Bi-weekly 2-hour sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="googleMeetLink">Google Meet Link *</Label>
                <Input
                  id="googleMeetLink"
                  name="googleMeetLink"
                  type="url"
                  value={formData.googleMeetLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sessionDayOfWeek">Day of Week *</Label>
                  <Select
                    value={formData.sessionDayOfWeek}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sessionDayOfWeek: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sessionTime">Time (24h format) *</Label>
                  <Input
                    id="sessionTime"
                    name="sessionTime"
                    type="time"
                    value={formData.sessionTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sessionDuration">Duration (minutes)</Label>
                  <Input
                    id="sessionDuration"
                    name="sessionDuration"
                    type="number"
                    value={formData.sessionDuration}
                    onChange={handleChange}
                    placeholder="120"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/courses")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating & Generating Content...
                </>
              ) : (
                <>Create Course & Generate Content</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupervisedCourse;
