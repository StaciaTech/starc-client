import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Search, ArrowLeft, UserCheck, UserX, UserPlus, Trash } from 'lucide-react';
import userManagementService from '@/services/userManagementService';
import authService from '@/services/authService';
import CreateUserForm from '@/components/admin/CreateUserForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  enrollmentEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  username?: string;
}

const AdminUserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  
  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData.data.role === 'admin') {
          setIsAdmin(true);
          fetchUsers();
        } else {
          toast.error('You do not have permission to access this page');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error('Authentication error');
        navigate('/LoginPage');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userManagementService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user enrollment access
  const handleToggleEnrollment = async (userId: string) => {
    try {
      setProcessingUser(userId);
      const updatedUser = await userManagementService.toggleUserEnrollmentAccess(userId);
      
      // Update the user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, enrollmentEnabled: updatedUser.enrollmentEnabled } 
            : user
        )
      );
      
      toast.success(`Enrollment access ${updatedUser.enrollmentEnabled ? 'enabled' : 'disabled'} for ${updatedUser.name}`);
    } catch (error) {
      console.error('Error toggling enrollment access:', error);
      toast.error('Failed to update enrollment access');
    } finally {
      setProcessingUser(null);
    }
  };

  // Handle user creation success
  const handleUserCreationSuccess = () => {
    fetchUsers(); // Refresh the user list
    setShowCreateUserForm(false); // Hide the form
    toast.success('User account has been created and is ready to hand over');
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.username && user.username.toLowerCase().includes(query))
    );
  });

  // Navigate back to admin dashboard
  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setProcessingUser(userToDelete._id);
      await userManagementService.deleteUser(userToDelete._id);
      
      // Remove the user from the list
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
      
      toast.success(`User ${userToDelete.name} has been deleted successfully`);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleBackToAdmin}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">Manage user access and create student accounts</p>
          </div>
          <Button 
            onClick={() => setShowCreateUserForm(!showCreateUserForm)}
            className="bg-[#8A63FF] hover:bg-[#7047e0]"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {showCreateUserForm ? 'Hide Form' : 'Create User Account'}
          </Button>
        </div>

        {showCreateUserForm && (
          <div className="mb-6">
            <CreateUserForm onSuccess={handleUserCreationSuccess} />
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Users</CardTitle>
            <CardDescription>
              Manage users: toggle enrollment access, and delete user accounts.
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.enrollmentEnabled ? (
                          <Badge className="bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Access Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 border-gray-300">
                            <UserX className="h-3 w-3 mr-1" />
                            Access Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {processingUser === user._id ? (
                            <Spinner className="h-4 w-4 mr-2" />
                          ) : (
                            <>
                              <Switch
                                checked={user.enrollmentEnabled}
                                onCheckedChange={() => handleToggleEnrollment(user._id)}
                                disabled={processingUser === user._id}
                                className="data-[state=checked]:bg-[#8A63FF]"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmDeleteUser(user)}
                                disabled={processingUser === user._id || user.role === 'admin'}
                                title={user.role === 'admin' ? 'Admin users cannot be deleted' : 'Delete user'}
                                className="ml-2"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? 
              This action cannot be undone and will permanently remove the user account 
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