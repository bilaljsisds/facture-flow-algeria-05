
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { mockDataService } from '@/services/mockDataService';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Form validation schema
const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  taxId: z.string().min(5, 'Tax ID must be at least 5 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const isNewClient = id === 'new';
  const [isEditing, setIsEditing] = useState(isNewClient);
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  
  // Fetch client data if not a new client
  const { 
    data: client, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['client', id],
    queryFn: () => isNewClient ? null : mockDataService.getClientById(id!),
    enabled: !isNewClient,
  });

  // Form setup
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: isNewClient 
      ? {
          name: '',
          address: '',
          taxId: '',
          phone: '',
          email: '',
          country: 'Algeria', // Default country
          city: '',
        }
      : {
          name: client?.name || '',
          address: client?.address || '',
          taxId: client?.taxId || '',
          phone: client?.phone || '',
          email: client?.email || '',
          country: client?.country || '',
          city: client?.city || '',
        },
  });
  
  // Update form values when client data is loaded
  React.useEffect(() => {
    if (!isNewClient && client) {
      form.reset({
        name: client.name,
        address: client.address,
        taxId: client.taxId,
        phone: client.phone,
        email: client.email,
        country: client.country,
        city: client.city,
      });
    }
  }, [client, form, isNewClient]);

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: (data: ClientFormValues) => mockDataService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Client created',
        description: 'New client has been successfully created',
      });
      navigate('/clients');
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create client. Please try again.',
      });
    },
  });
  
  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: (data: ClientFormValues) => mockDataService.updateClient(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Client updated',
        description: 'Client information has been successfully updated',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update client. Please try again.',
      });
    },
  });
  
  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: () => mockDataService.deleteClient(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Client deleted',
        description: 'Client has been successfully deleted',
      });
      navigate('/clients');
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete client. Please try again.',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ClientFormValues) => {
    if (isNewClient) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };
  
  // Handle loading state
  if (!isNewClient && isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // Handle error state
  if (!isNewClient && error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-red-500">Error loading client information</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewClient ? 'New Client' : client?.name}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNewClient && !isEditing && canEdit && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Client
            </Button>
          )}
          {!isNewClient && canEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the client and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isNewClient 
              ? 'Create New Client' 
              : isEditing 
                ? 'Edit Client Information' 
                : 'Client Information'}
          </CardTitle>
          <CardDescription>
            {isNewClient 
              ? 'Add a new client to your system' 
              : isEditing 
                ? 'Update client details' 
                : 'View client details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter company name" 
                          {...field} 
                          disabled={!isEditing && !isNewClient}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID (NIF)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter tax identification number" 
                          {...field} 
                          disabled={!isEditing && !isNewClient}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter full address" 
                        {...field} 
                        disabled={!isEditing && !isNewClient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter city" 
                          {...field} 
                          disabled={!isEditing && !isNewClient}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter country" 
                          {...field} 
                          disabled={!isEditing && !isNewClient}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter email address" 
                          type="email"
                          {...field} 
                          disabled={!isEditing && !isNewClient}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter phone number" 
                          {...field} 
                          disabled={!isEditing && !isNewClient}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {(isEditing || isNewClient) && (
                <div className="flex justify-end gap-2">
                  {!isNewClient && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        form.reset({
                          name: client?.name || '',
                          address: client?.address || '',
                          taxId: client?.taxId || '',
                          phone: client?.phone || '',
                          email: client?.email || '',
                          country: client?.country || '',
                          city: client?.city || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                        {isNewClient ? 'Creating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isNewClient ? 'Create Client' : 'Save Changes'}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetail;
