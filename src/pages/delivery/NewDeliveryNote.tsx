import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { mockDataService } from '@/services/mockDataService';
import { 
  useAuth, 
  UserRole 
} from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  X,
  Truck,
  User 
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrentDate, generateId } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const deliveryNoteSchema = z.object({
  clientid: z.string().min(1, 'Client is required'),
  issuedate: z.string().min(1, 'Issue date is required'),
  notes: z.string().optional(),
  driverName: z.string().optional(),
  truckId: z.string().optional(),
  deliveryCompany: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string().min(1, 'Product is required'),
      quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
      product: z.object({
        name: z.string(),
        description: z.string(),
        code: z.string(),
        unitprice: z.number(),
        taxrate: z.number(),
      }).optional()
    })
  ).min(1, 'At least one item is required')
});

type DeliveryNoteFormValues = z.infer<typeof deliveryNoteSchema>;

const NewDeliveryNote = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const canCreate = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALESPERSON]);
  
  const queryParams = new URLSearchParams(location.search);
  const invoiceId = queryParams.get('invoiceId');
  
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => mockDataService.getClients(),
  });
  
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => mockDataService.getProducts(),
  });

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['finalInvoice', invoiceId],
    queryFn: () => mockDataService.getFinalInvoiceById(invoiceId!),
    enabled: !!invoiceId,
  });

  const form = useForm<DeliveryNoteFormValues>({
    resolver: zodResolver(deliveryNoteSchema),
    defaultValues: {
      clientid: '',
      issuedate: getCurrentDate(),
      notes: '',
      driverName: '',
      truckId: '',
      deliveryCompany: '',
      items: [
        {
          id: generateId(),
          productId: '',
          quantity: 1,
        }
      ]
    }
  });

  useEffect(() => {
    if (invoice) {
      form.setValue('clientid', invoice.clientid);
      form.setValue('notes', `Delivery for invoice ${invoice.number}`);
      
      if (invoice.items && invoice.items.length > 0) {
        const items = invoice.items.map(item => ({
          id: generateId(),
          productId: item.productId,
          quantity: item.quantity,
          product: item.product
        }));
        form.setValue('items', items);
      }
    }
  }, [invoice, form]);

  const addItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [
      ...currentItems,
      {
        id: generateId(),
        productId: '',
        quantity: 1
      }
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = [...form.getValues('items')];
    currentItems.splice(index, 1);
    form.setValue('items', currentItems);
  };

  const updateItemProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const items = [...form.getValues('items')];
    items[index].productId = productId;
    items[index].product = product;
    form.setValue('items', items);
  };

  const createMutation = useMutation({
    mutationFn: async (data: DeliveryNoteFormValues) => {
      const deliveryNote = {
        clientid: data.clientid,
        finalInvoiceId: invoiceId || undefined,
        issuedate: data.issuedate,
        notes: data.notes || '',
        status: 'pending',
        driver_name: data.driverName || null,
        truck_id: data.truckId || null,
        delivery_company: data.deliveryCompany || null,
        items: data.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            id: generateId(),
            productId: item.productId,
            product,
            quantity: item.quantity,
            unitprice: product?.unitprice || 0,
            taxrate: product?.taxrate || 0,
            discount: 0,
            totalExcl: (product?.unitprice || 0) * item.quantity,
            totalTax: (product?.unitprice || 0) * item.quantity * (product?.taxrate || 0) / 100,
            total: (product?.unitprice || 0) * item.quantity * (1 + (product?.taxrate || 0) / 100)
          };
        })
      };
      
      return mockDataService.createDeliveryNote(deliveryNote);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryNotes'] });
      toast({
        title: 'Delivery Note Created',
        description: 'Delivery note has been successfully created'
      });
      navigate('/delivery-notes');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create delivery note. Please try again.'
      });
      console.error('Error creating delivery note:', error);
    }
  });

  const onSubmit = (data: DeliveryNoteFormValues) => {
    if (!canCreate) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to create delivery notes'
      });
      return;
    }
    
    createMutation.mutate(data);
  };

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-center text-muted-foreground">
              You don't have permission to create delivery notes
            </p>
            <Button asChild variant="outline">
              <Link to="/delivery-notes">Return to List</Link>
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
            <Link to="/delivery-notes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Delivery Note
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Select the client for this delivery note</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="clientid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.taxId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>Information about the delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="issuedate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Driver Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter driver name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="truckId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Truck className="mr-2 h-4 w-4" />
                        Truck ID
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter truck ID or license plate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter delivery company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional information or delivery instructions"
                        className="min-h-[120px]"
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Items</CardTitle>
                <CardDescription>Products to be delivered</CardDescription>
              </div>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.getValues('items')?.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItemProduct(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.items?.[index]?.productId && (
                            <p className="text-xs text-destructive mt-1">
                              Product is required
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            defaultValue={item.quantity}
                            onChange={(e) => {
                              const items = [...form.getValues('items')];
                              items[index].quantity = parseInt(e.target.value) || 1;
                              form.setValue('items', items);
                            }}
                          />
                          {form.formState.errors.items?.[index]?.quantity && (
                            <p className="text-xs text-destructive mt-1">
                              Valid quantity is required
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={form.getValues('items').length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {form.formState.errors.items && !Array.isArray(form.formState.errors.items) && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.items.message}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link to="/delivery-notes">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Delivery Note
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewDeliveryNote;
