import React, { useEffect, useState } from "react";
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
import { ArrowLeft, BookOpen, CheckCircle, Clock } from "lucide-react";
import adminService from "@/services/adminService";
import { toast } from "sonner";

interface CourseStats {
  _id: string;
  title: string;
  thumbnail?: string;
  category: string;
  level: string;
  stats: {
    totalSubmissions: number;
    pendingReview: number;
  };
}

const AdminAssignmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getCourseAssignmentStats();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching assignment stats:", error);
      toast.error("Failed to load assignment statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-12 w-12 text-[#8A63FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4 pl-0 hover:bg-transparent hover:text-[#8A63FF]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assignments & Validation
          </h1>
          <p className="text-gray-600">
            Select a course to view and manage student submissions.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course._id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[#8A63FF]"
              onClick={() => navigate(`/admin/assignments/${course._id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge
                    className={`${
                      course.level === "beginner"
                        ? "bg-green-100 text-green-700"
                        : course.level === "intermediate"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                    } hover:bg-opacity-80 border-0`}
                  >
                    {course.level}
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-4 space-x-4">
                  <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg flex-1">
                    <span className="text-2xl font-bold text-[#8A63FF]">
                      {course.stats.totalSubmissions}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Total Submissions
                    </span>
                  </div>
                  {/* <div className="flex flex-col items-center p-3 bg-yellow-50 rounded-lg flex-1">
                    <span className="text-2xl font-bold text-yellow-700">
                      {course.stats.pendingReview}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Pending Review</span>
                  </div> */}
                </div>
                <Button className="w-full mt-6 bg-white border border-[#8A63FF] text-[#8A63FF] hover:bg-[#8A63FF] hover:text-white">
                  View Submissions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">
              No Courses Found
            </h3>
            <p className="text-gray-500 mt-2">
              There appear to be no courses available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssignmentDashboard;
