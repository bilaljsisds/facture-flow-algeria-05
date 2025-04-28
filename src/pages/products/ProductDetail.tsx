import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { mockDataService } from '@/services/mockDataService';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Clipboard,
  FileEdit,
  Loader2,
  Package2,
  Save,
  Trash,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Form validation schema
const productSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  taxRate: z.coerce.number().min(0, 'Tax rate must be positive'),
  stockQuantity: z.coerce.number().min(0, 'Stock must be positive'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const canDelete = checkPermission([UserRole.ADMIN]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get product
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => mockDataService.getProductById(id!),
    enabled: !!id,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      unitPrice: 0,
      taxRate: 0,
      stockQuantity: 0,
    },
    values: product,
    mode: 'onChange'
  });

  // Set default values when product is loaded
  useState(() => {
    if (product) {
      form.reset(product);
    }
  }, [product, form]);

  // Update product
  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      return mockDataService.updateProduct(id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product'
      });
      navigate('/products');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product'
      });
      console.error('Error updating product:', error);
    }
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: () => mockDataService.deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product Deleted',
        description: 'Product has been successfully deleted'
      });
      navigate('/products');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product. Please try again.'
      });
      console.error('Error deleting product:', error);
      setDeleteDialogOpen(false);
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    if (!canEdit) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to edit products'
      });
      return;
    }

    updateMutation.mutate(data);
  };

  const deleteHandler = () => {
    if (canDelete) {
      deleteMutation.mutate();
    } else {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to delete products'
      });
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/products">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              <Skeleton className="h-8 w-[200px]" />
            </h1>
          </div>
          <Skeleton className="h-9 w-[100px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-[150px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-3 w-[200px]" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-[150px]" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-3 w-[200px]" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!canEdit && !canDelete) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-center text-muted-foreground">
              You don't have permission to view this product
            </p>
            <Button asChild variant="outline">
              <Link to="/products">Return to List</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {product?.name}
          </h1>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the product from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={deleteHandler}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Edit product details and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Manage pricing and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Product
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ProductDetail;
