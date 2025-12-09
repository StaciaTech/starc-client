import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import courseService from "@/services/courseService";
import authService from "@/services/authService";

const AdminCourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.data.role === "admin") {
          setIsAdmin(true);
          fetchCourseData();
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

    checkAdminStatus();
  }, [navigate, courseId]);

  // Fetch course data
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      if (!courseId) {
        toast.error("No course ID provided");
        return;
      }

      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to course management
  const handleBackToManagement = () => {
    navigate("/admin/courses");
  };

  // Navigate to course structure
  const navigateToCourseStructure = () => {
    navigate(`/admin/courses/${courseId}/structure`);
  };

  // Handle edit course
  const handleEditCourse = () => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality will be implemented soon");
  };

  // Handle delete course
  const handleDeleteCourse = async () => {
    if (!courseId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        setLoading(true);
        await courseService.deleteCourse(courseId);
        toast.success("Course deleted successfully");
        navigate("/admin/courses");
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error("Failed to delete course");
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-12 w-12 text-[#8A63FF]" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* <Navbar /> */}
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Course Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The requested course could not be found.
            </p>
            <Button onClick={handleBackToManagement}>
              Return to Course Management
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleBackToManagement}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Management
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="capitalize">{course.level}</Badge>
              <Badge variant="outline">{course.category}</Badge>
              {course.category === "AI Generated" && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditCourse}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
                <CardDescription>
                  Basic information about this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Description
                    </h3>
                    <p className="text-gray-800">{course.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Details
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-gray-500">Level:</span>
                        <span className="font-medium capitalize">
                          {course.level}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{course.category}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                          {course.duration} minutes
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">${course.price}</span>
                      </li>
                      {course.discount > 0 && (
                        <li className="flex justify-between">
                          <span className="text-gray-500">Discount:</span>
                          <span className="font-medium text-green-600">
                            {course.discount}%
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>
                  Manage the structure of this course
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  Course Structure Builder
                </h3>
                <p className="text-gray-500 mb-4 max-w-lg mx-auto">
                  Build your course structure with chapters, subchapters, and
                  sections.
                  {course.category === "AI Generated" &&
                    " This course was generated using AI. You can view and edit the structure to refine the content."}
                </p>
                <Button
                  onClick={navigateToCourseStructure}
                  className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Course Structure
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Course Structure</span>
                  <Button
                    onClick={navigateToCourseStructure}
                    className="bg-[#8A63FF] hover:bg-[#7A53EF]"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Manage Structure
                  </Button>
                </CardTitle>
                <CardDescription>
                  View and manage the hierarchical structure of this course
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 text-center">
                <p className="text-gray-500 mb-4">
                  Click the button above to go to the course structure
                  management page.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  View and manage individual lessons in this course
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Lesson Management</h3>
                <p className="text-gray-500 mb-4 max-w-lg mx-auto">
                  This section will allow you to manage individual lessons.
                </p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>
                  Manage settings for this course
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Course ID
                    </h3>
                    <p className="text-sm text-gray-800 font-mono bg-gray-100 p-2 rounded">
                      {course._id}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Created At
                    </h3>
                    <p className="text-gray-800">
                      {new Date(course.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Last Updated
                    </h3>
                    <p className="text-gray-800">
                      {new Date(course.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCourseDetails;
