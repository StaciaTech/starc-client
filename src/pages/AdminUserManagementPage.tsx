import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Search,
  ArrowLeft,
  UserCheck,
  UserX,
  UserPlus,
  Trash,
  CheckCircle,
  Pencil,
  BookOpen,
  CreditCard,
} from "lucide-react";
import userManagementService from "@/services/userManagementService";
import authService from "@/services/authService";
import CreateUserForm from "@/components/admin/CreateUserForm";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Enrollment {
  _id: string;
  courseId: string;
  courseName: string;
  paymentStatus: "pending" | "completed" | "failed";
  enrolledAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  enrollmentEnabled: boolean;
  enrollments?: Enrollment[]; // ✅ New field
  createdAt: string;
  updatedAt: string;
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  username?: string;
}

interface Course {
  _id: string;
  title: string;
}

const AdminUserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // State for Change Course dialog
  const [showChangeCourseDialog, setShowChangeCourseDialog] = useState(false);
  const [selectedUserForChange, setSelectedUserForChange] =
    useState<User | null>(null);
  const [selectedEnrollmentForChange, setSelectedEnrollmentForChange] =
    useState<Enrollment | null>(null);
  const [newCourseId, setNewCourseId] = useState<string>("");

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.data.role === "admin") {
          setIsAdmin(true);
          fetchData();
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
  }, [navigate]);

  // Fetch all users and courses
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData] = await Promise.all([
        userManagementService.getAllUsers(),
        userManagementService.getAvailableCourses(),
      ]);
      setUsers(usersData);
      setAvailableCourses(coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load users or courses");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user enrollment access
  const handleToggleEnrollment = async (userId: string) => {
    try {
      setProcessingUser(userId);
      const updatedUser =
        await userManagementService.toggleUserEnrollmentAccess(userId);

      // Update the user in the list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, enrollmentEnabled: updatedUser.enrollmentEnabled }
            : user,
        ),
      );

      toast.success(
        `Enrollment access ${
          updatedUser.enrollmentEnabled ? "enabled" : "disabled"
        } for ${updatedUser.name}`,
      );
    } catch (error) {
      console.error("Error toggling enrollment access:", error);
      toast.error("Failed to update enrollment access");
    } finally {
      setProcessingUser(null);
    }
  };

  // Handle Approve Enrollment
  const handleApproveEnrollment = async (userId: string, courseId: string) => {
    try {
      setProcessingUser(userId);
      await userManagementService.approveEnrollment(userId, courseId);

      // Refresh data to reflect changes
      await fetchData();
      toast.success("Enrollment approved successfully");
    } catch (error) {
      console.error("Error approving enrollment:", error);
      toast.error("Failed to approve enrollment");
    } finally {
      setProcessingUser(null);
    }
  };

  // Open Change Course Dialog
  const openChangeCourseDialog = (user: User, enrollment: Enrollment) => {
    setSelectedUserForChange(user);
    setSelectedEnrollmentForChange(enrollment);
    setNewCourseId(enrollment.courseId); // Pre-select current course
    setShowChangeCourseDialog(true);
  };

  // Handle Change Course Submit
  const handleChangeCourse = async () => {
    if (!selectedUserForChange || !selectedEnrollmentForChange || !newCourseId)
      return;

    // Don't do anything if course hasn't changed
    if (newCourseId === selectedEnrollmentForChange.courseId) {
      setShowChangeCourseDialog(false);
      return;
    }

    try {
      setProcessingUser(selectedUserForChange._id);

      await userManagementService.changeUserCourse(
        selectedUserForChange._id,
        selectedEnrollmentForChange.courseId,
        newCourseId,
      );

      toast.success("Course changed successfully");
      setShowChangeCourseDialog(false);
      await fetchData(); // Refresh list
    } catch (error) {
      console.error("Error changing course:", error);
      toast.error("Failed to change course");
    } finally {
      setProcessingUser(null);
      setSelectedUserForChange(null);
      setSelectedEnrollmentForChange(null);
      setNewCourseId("");
    }
  };

  // Handle user creation success
  const handleUserCreationSuccess = () => {
    fetchData(); // Refresh the user list
    setShowCreateUserForm(false); // Hide the form
    toast.success("User account has been created");
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.username && user.username.toLowerCase().includes(query))
    );
  });

  // Navigate back to admin dashboard
  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setProcessingUser(userToDelete._id);
      await userManagementService.deleteUser(userToDelete._id);

      // Remove the user from the list
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToDelete._id),
      );

      toast.success(`User ${userToDelete.name} has been deleted successfully`);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setProcessingUser(null);
      setUserToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  if (loading && !users.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={handleBackToAdmin}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage user access, verify payments, and manage enrollments
            </p>
          </div>
          <Button
            onClick={() => setShowCreateUserForm(!showCreateUserForm)}
            className="bg-[#8A63FF] hover:bg-[#7047e0]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {showCreateUserForm ? "Hide Form" : "Create User Account"}
          </Button>
        </div>

        {showCreateUserForm && (
          <div className="mb-6">
            <CreateUserForm onSuccess={handleUserCreationSuccess} />
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            {/* ... */}
            <CardTitle className="text-lg">Users & Enrollments</CardTitle>
            <CardDescription>
              View student enrollments, approve pending payments, and manage
              course access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">User Info</TableHead>
                    <TableHead>Enrolled Courses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      {/* User Info Column */}
                      <TableCell className="align-top">
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-xs text-gray-500">
                            {user.email}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {user.phone || "No phone"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Enrolled Courses Column */}
                      <TableCell className="align-top">
                        {user.enrollments && user.enrollments.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {user.enrollments.map((enrollment) => (
                              <div
                                key={enrollment._id}
                                className="p-2 bg-gray-50 rounded-md border text-sm flex justify-between items-center group"
                              >
                                <div>
                                  <div className="font-medium">
                                    {enrollment.courseName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      enrollment.enrolledAt,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="flex gap-1">
                                  {/* Edit Course Button */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Change Course"
                                    onClick={() =>
                                      openChangeCourseDialog(user, enrollment)
                                    }
                                  >
                                    <Pencil className="h-3 w-3 text-gray-600" />
                                  </Button>

                                  {/* Status Badge */}
                                  {enrollment.paymentStatus === "completed" ? (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      Paid
                                    </Badge>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                      >
                                        Pending
                                      </Badge>
                                      {/* Approve Payment Button */}
                                      <Button
                                        size="sm"
                                        className="h-6 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                                        onClick={() =>
                                          handleApproveEnrollment(
                                            user._id,
                                            enrollment.courseId,
                                          )
                                        }
                                        disabled={processingUser === user._id}
                                      >
                                        Approve
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            No enrollments
                          </span>
                        )}
                      </TableCell>

                      {/* Account Status Column */}
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2 mb-2">
                          <Switch
                            checked={user.enrollmentEnabled}
                            onCheckedChange={() =>
                              handleToggleEnrollment(user._id)
                            }
                            disabled={processingUser === user._id}
                            className="data-[state=checked]:bg-[#8A63FF]"
                          />
                          <span className="text-sm">
                            {user.enrollmentEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="text-right align-top">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDeleteUser(user)}
                          disabled={
                            processingUser === user._id || user.role === "admin"
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Course Dialog */}
      <Dialog
        open={showChangeCourseDialog}
        onOpenChange={setShowChangeCourseDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Enrolled Course</DialogTitle>
            <DialogDescription>
              Change the course assignment for{" "}
              <span className="font-semibold">
                {selectedUserForChange?.name}
              </span>
              .
              <br />
              Current: {selectedEnrollmentForChange?.courseName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Select New Course
            </label>
            <Select value={newCourseId} onValueChange={setNewCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
              Warning: Changing the course will reset the student's progress for
              the old course.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangeCourseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeCourse}
              disabled={
                !newCourseId ||
                newCourseId === selectedEnrollmentForChange?.courseId
              }
            >
              {processingUser ? (
                <Spinner className="h-4 w-4" />
              ) : (
                "Confirm Change"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action
              cannot be undone and will permanently remove the user account
              along with all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUserManagementPage;
