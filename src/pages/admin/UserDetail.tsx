
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the form schema with validation
const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." })
    .optional()
    .or(z.string().length(0)),
  role: z.nativeEnum(UserRole),
  active: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { checkPermission } = useAuth();
  const isNewUser = id === 'new';
  const [isLoading, setIsLoading] = useState(false);
  
  // Set up the form with default values
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: isNewUser ? '' : undefined,
      role: UserRole.VIEWER,
      active: true,
    },
  });

  // Load user data if editing an existing user
  useEffect(() => {
    if (!isNewUser) {
      const fetchUser = async () => {
        try {
          setIsLoading(true);
          // In a real app, you would fetch from Supabase
          // For now using mock data
          const mockUser = {
            id: id,
            name: 'Sample User', 
            email: 'user@example.com',
            role: UserRole.VIEWER,
            active: true
          };
          
          form.reset({
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            active: mockUser.active,
            password: '',
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load user details.',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUser();
    }
  }, [id, form, isNewUser]);

  // Handle form submission
  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsLoading(true);
      
      if (isNewUser) {
        // Create a new user via Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: values.email,
          password: values.password || undefined,
          email_confirm: true,
          user_metadata: {
            name: values.name,
            role: values.role,
            active: values.active,
          },
        });

        if (error) throw error;

        toast({
          title: 'User created',
          description: `User ${values.name} has been created successfully.`,
        });
      } else {
        // Update existing user
        // Note: In a real implementation, you would use Supabase admin API
        
        // For testing/demo purposes we're just showing a success message
        toast({
          title: 'User updated',
          description: `User ${values.name} has been updated successfully.`,
        });
      }
      
      // Navigate back to users list
      navigate('/admin/users');
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save user.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isNewUser ? 'New User' : `Edit User`}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            {isNewUser 
              ? 'Create a new system user with appropriate permissions' 
              : 'Edit existing user details and permissions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isNewUser && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder={isNewUser ? "Minimum 8 characters" : "Leave empty to keep unchanged"} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          {isNewUser 
                            ? "Create a strong password with at least 8 characters" 
                            : "Leave empty to keep the current password"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                          <SelectItem value={UserRole.ACCOUNTANT}>Accountant</SelectItem>
                          <SelectItem value={UserRole.SALESPERSON}>Salesperson</SelectItem>
                          <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines what actions and data this user can access in the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Inactive users cannot log in to the system
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin/users')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isNewUser ? (
                    <UserPlus className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isNewUser ? 'Create User' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetail;
