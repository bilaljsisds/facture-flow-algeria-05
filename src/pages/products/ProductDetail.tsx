
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
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
import { mockDataService } from '@/services/mockDataService';
import {
  useAuth,
  UserRole
} from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Save,
  Trash
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form validation schema
const productSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
  taxRate: z.coerce.number().min(0, 'Tax rate must be positive'),
  stockQuantity: z.coerce.number().min(0, 'Stock quantity cannot be negative'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const [isEditing, setIsEditing] = useState(false);

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
  });

  // Update form values when product data is loaded
  React.useEffect(() => {
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
  }, [product, form]);

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => mockDataService.updateProduct(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({
        title: 'Product Updated',
        description: 'Product has been successfully updated',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product',
      });
      console.error('Error updating product:', error);
    },
  });

  const handleSaveEdit = (values: ProductFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-center text-muted-foreground">
              Product not found
            </p>
            <Button asChild variant="outline">
              <Link to="/products">Return to Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2,
    });
  };

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
            {product.name}
          </h1>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {product.code}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update product information</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Code</FormLabel>
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
                            <FormLabel>Product Name</FormLabel>
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
                              {...field} 
                              className="min-h-[120px]" 
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
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
                              <Input type="number" min="0" step="0.1" {...field} />
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
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={form.handleSubmit(handleSaveEdit)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>Basic product details</CardDescription>
                  </div>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Product Code
                      </div>
                      <div className="text-lg font-semibold">{product.code}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Product Name
                      </div>
                      <div className="text-lg font-semibold">{product.name}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Description
                    </div>
                    <div className="mt-1 whitespace-pre-line">
                      {product.description || "No description available"}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Unit Price
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(product.unitPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Tax Rate
                      </div>
                      <div className="text-lg font-semibold">{product.taxRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Stock Quantity
                      </div>
                      <div className="text-lg font-semibold">
                        {product.stockQuantity} units
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {canEdit && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Product
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            product and may affect existing invoices and delivery notes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product History</CardTitle>
              <CardDescription>History of transactions for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                No transaction history available
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetail;
