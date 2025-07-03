import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { 
  Select,
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import userManagementService from '@/services/userManagementService';

interface Course {
  _id: string;
  title: string;
  category: string;
  level: string;
}

interface CreateUserFormProps {
  onSuccess: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    enrollmentEnabled: true
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const coursesData = await userManagementService.getAvailableCourses();
        setCourses(coursesData);
      } catch (error) {
        toast.error('Failed to fetch available courses');
        console.error('Error fetching courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      enrollmentEnabled: checked
    }));
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prevSelected => {
      if (prevSelected.includes(courseId)) {
        return prevSelected.filter(id => id !== courseId);
      } else {
        return [...prevSelected, courseId];
      }
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      email: '',
      password: ''
    };

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
      valid = false;
    }

    if (!formData.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (formData.enrollmentEnabled && selectedCourses.length === 0) {
      toast.warning('Please select at least one course to assign to this user');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the API to create user
      await userManagementService.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        enrollmentEnabled: formData.enrollmentEnabled,
        assignedCourses: selectedCourses
      });
      
      toast.success('User account created successfully');
      
      // Reset the form
      setFormData({
        name: '',
        email: '',
        password: '',
        enrollmentEnabled: true
      });
      setSelectedCourses([]);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User Account</CardTitle>
        <CardDescription>
          Create a new user account and assign specific courses to the student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              name="name"
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && (
              <p className="text-sm font-medium text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              name="email"
              type="email" 
              placeholder="student@example.com" 
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-sm font-medium text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              name="password"
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleInputChange}
            />
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters.
            </p>
            {errors.password && (
              <p className="text-sm font-medium text-red-500">{errors.password}</p>
            )}
          </div>
          
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">
                Enable Course Enrollment
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow this user to enroll in the selected courses.
              </p>
            </div>
            <Switch
              checked={formData.enrollmentEnabled}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          {formData.enrollmentEnabled && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label className="text-base">Assign Courses</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select the specific courses this student will be allowed to enroll in.
              </p>
              
              {loadingCourses ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="h-6 w-6 mr-2" />
                  <span>Loading courses...</span>
                </div>
              ) : courses.length === 0 ? (
                <p className="text-sm text-amber-600">No courses available to assign.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                  {courses.map((course) => (
                    <div key={course._id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <Checkbox 
                        id={`course-${course._id}`}
                        checked={selectedCourses.includes(course._id)}
                        onCheckedChange={() => handleCourseToggle(course._id)}
                      />
                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={`course-${course._id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {course.title}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {course.category} · {course.level}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {courses.length > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm">
                    {selectedCourses.length} course(s) selected
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCourses([])}
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating User...
              </>
            ) : (
              'Create User Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm; 