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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { mockDataService } from '@/services/mockDataService';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Form validation schema
const productSchema = z.object({
  code: z.string().min(2, 'Product code must be at least 2 characters'),
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string(),
  unitPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
  stockQuantity: z.coerce.number().min(0, 'Stock quantity cannot be negative'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const isNewProduct = id === 'new';
  const [isEditing, setIsEditing] = useState(isNewProduct);
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  
  // Fetch product data if not a new product
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => isNewProduct ? null : mockDataService.getProductById(id!),
    enabled: !isNewProduct,
  });

  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: isNewProduct 
      ? {
          code: '',
          name: '',
          description: '',
          unitPrice: 0,
          taxRate: 19, // Default tax rate in Algeria
          stockQuantity: 0,
        }
      : {
          code: product?.code || '',
          name: product?.name || '',
          description: product?.description || '',
          unitPrice: product?.unitPrice || 0,
          taxRate: product?.taxRate || 0,
          stockQuantity: product?.stockQuantity || 0,
        },
  });
  
  // Update form values when product data is loaded
  React.useEffect(() => {
    if (!isNewProduct && product) {
      form.reset({
        code: product.code,
        name: product.name,
        description: product.description,
        unitPrice: product.unitPrice,
        taxRate: product.taxRate,
        stockQuantity: product.stockQuantity,
      });
    }
  }, [product, form, isNewProduct]);

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductFormValues) => mockDataService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product created',
        description: 'New product has been successfully created',
      });
      navigate('/products');
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create product. Please try again.',
      });
    },
  });
  
  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProductFormValues) => {
      const updatedProduct = {
        code: data.code,
        name: data.name,
        description: data.description,
        unitPrice: data.unitPrice,
        taxRate: data.taxRate,
        stockQuantity: data.stockQuantity
      };
      return mockDataService.updateProduct(id!, updatedProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product updated',
        description: 'Product information has been successfully updated',
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product. Please try again.',
      });
    },
  });
  
  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => mockDataService.deleteProduct(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product deleted',
        description: 'Product has been successfully deleted',
      });
      navigate('/products');
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ProductFormValues) => {
    if (isNewProduct) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };
  
  // Handle loading state
  if (!isNewProduct && isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // Handle error state
  if (!isNewProduct && error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-red-500">Error loading product information</p>
      </div>
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
            {isNewProduct ? 'New Product' : product?.name}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNewProduct && !isEditing && canEdit && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Product
            </Button>
          )}
          {!isNewProduct && canEdit && (
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
                    This will permanently delete the product and cannot be undone.
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
            {isNewProduct 
              ? 'Create New Product' 
              : isEditing 
                ? 'Edit Product Information' 
                : 'Product Information'}
          </CardTitle>
          <CardDescription>
            {isNewProduct 
              ? 'Add a new product to your catalog' 
              : isEditing 
                ? 'Update product details' 
                : 'View product details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product code" 
                          {...field} 
                          disabled={!isEditing && !isNewProduct}
                        />
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
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter product name" 
                          {...field} 
                          disabled={!isEditing && !isNewProduct}
                        />
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
                        {...field} 
                        disabled={!isEditing && !isNewProduct}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (DZD)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter price" 
                          type="number"
                          step="0.01"
                          min="0"
                          {...field} 
                          disabled={!isEditing && !isNewProduct}
                        />
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
                        <Input 
                          placeholder="Enter tax rate" 
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...field} 
                          disabled={!isEditing && !isNewProduct}
                        />
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
                        <Input 
                          placeholder="Enter quantity" 
                          type="number"
                          min="0"
                          {...field} 
                          disabled={!isEditing && !isNewProduct}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {(isEditing || isNewProduct) && (
                <div className="flex justify-end gap-2">
                  {!isNewProduct && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        if (product) {
                          form.reset({
                            code: product.code,
                            name: product.name,
                            description: product.description,
                            unitPrice: product.unitPrice,
                            taxRate: product.taxRate,
                            stockQuantity: product.stockQuantity,
                          });
                        }
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
                        {isNewProduct ? 'Creating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isNewProduct ? 'Create Product' : 'Save Changes'}
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

export default ProductDetail;
