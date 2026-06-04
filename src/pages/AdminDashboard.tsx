import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  BarChart3,
  Settings,
  ShoppingCart,
  GraduationCap,
  UserCheck,
  BookMarked,
  ListChecks,
} from "lucide-react";
import authService from "@/services/authService";

interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalRevenue: number;
  activeEnrollments: number;
  newUsersThisMonth: number;
  coursesPublished: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    newUsersThisMonth: 0,
    coursesPublished: 0,
  });

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.data.role === "admin") {
          setIsAdmin(true);
          setAdminName(userData.data.name || "Admin");
          await fetchDashboardStats();
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

    checkAdminAndFetchData();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      // TODO: Replace with actual API calls
      // const statsData = await adminService.getDashboardStats();

      // Placeholder data
      setStats({
        totalCourses: 24,
        totalUsers: 1247,
        totalRevenue: 245680,
        activeEnrollments: 3891,
        newUsersThisMonth: 156,
        coursesPublished: 18,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    }
  };

  const navigationCards = [
    {
      title: "Course Management",
      description: "Create, edit, and manage all courses",
      icon: BookOpen,
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      path: "/admin/courses",
      stats: `${stats.totalCourses} Courses`,
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      path: "/admin/users",
      stats: `${stats.totalUsers} Users`,
    },
    {
      title: "Assignments & Validation",
      description: "Review and grade student submissions",
      icon: ListChecks,
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      path: "/admin/assignments",
      stats: "Review Pending",
      comingSoon: true,
    },
    {
      title: "Unsuperwise learning Book Management",
      description: "Review and create books",
      icon: ListChecks,
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      path: "/admin/unsupervised-books",
      stats: "create book",
      comingSoon: false,
    },
    {
      title: "Settings",
      description: "Platform settings and configurations",
      icon: Settings,
      color: "from-gray-500 to-gray-700",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      path: "/admin/settings",
      stats: "Configure",
      comingSoon: true,
    },
  ];

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments.toLocaleString(),
      change: "+8.2%",
      changeType: "positive",
      icon: GraduationCap,
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "New Users",
      value: stats.newUsersThisMonth.toString(),
      change: "This month",
      changeType: "neutral",
      icon: UserCheck,
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Published Courses",
      value: stats.coursesPublished.toString(),
      change: `of ${stats.totalCourses} total`,
      changeType: "neutral",
      icon: BookMarked,
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  const recentActivities = [
    {
      user: "John Doe",
      action: "enrolled in",
      target: "Full Stack Development",
      time: "5 minutes ago",
      icon: ShoppingCart,
    },
    {
      user: "Jane Smith",
      action: "completed",
      target: "React Fundamentals",
      time: "1 hour ago",
      icon: Activity,
    },
    {
      user: "Admin",
      action: "published",
      target: "AI & Machine Learning",
      time: "3 hours ago",
      icon: BookOpen,
    },
    {
      user: "Mike Johnson",
      action: "signed up",
      target: "New user registration",
      time: "5 hours ago",
      icon: Users,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Spinner className="h-12 w-12 text-[#8A63FF]" />
          <span className="ml-2 text-gray-600">Loading Dashboard...</span>
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {adminName}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <div className={` p-6 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Icon className="h-6 w-6 text-[#8A63FF]" />
                      </div>
                      {stat.changeType === "positive" && (
                        <Badge className="bg-white/20 text-[#8A63FF] border-0">
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#8A63FF] opacity-90 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-[#8A63FF]">
                        {stat.value}
                      </p>
                      {stat.changeType === "neutral" && (
                        <p className="text-sm text-[#8A63FF] opacity-75 mt-1">
                          {stat.change}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {navigationCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={index}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#8A63FF] ${card.comingSoon ? "opacity-75" : ""
                    }`}
                  onClick={() => !card.comingSoon && navigate(card.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`${card.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`h-8 w-8 ${card.iconColor}`} />
                      </div>
                      {card.comingSoon ? (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      ) : (
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#8A63FF] group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    <div className="mt-4">
                      <CardTitle className="text-xl mb-2 group-hover:text-[#8A63FF] transition-colors">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {card.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        {card.stats}
                      </span>
                      {!card.comingSoon && (
                        <Button
                          size="sm"
                          className="bg-[#8A63FF] hover:bg-[#7047e0] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Manage
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions on your platform
                </CardDescription>
              </div>
              <Activity className="h-5 w-5 text-[#8A63FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Icon className="h-5 w-5 text-[#8A63FF]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        <span className="font-semibold">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-[#8A63FF] hover:text-[#7047e0]"
              >
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
