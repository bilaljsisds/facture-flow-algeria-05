
import React, { useState } from 'react';

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { mockDataService } from '@/services/mockDataService';
import { 
  supabase, 
  updateProformaInvoiceItems,
  deleteProformaInvoice,
  undoProformaConversion 
} from '@/integrations/supabase/client';
import Br from  '@/integrations/supabase/client';
import {
  useAuth,
  UserRole
} from '@/contexts/AuthContext';
import {
  ArrowLeft,
  File,
  FileCheck,
  Send,
  ThumbsDown,
  ThumbsUp,
  CreditCard,
  Banknote,
  Printer,
  Edit,
  Save,
  Trash2,
  Undo,
  Plus,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { exportProformaInvoiceToPDF } from '@/utils/exportUtils';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { generateId } from '@/types';

const proformaFormSchema = z.object({
  clientid: z.string().min(1, "Client is required"),
  notes: z.string().optional(),
  issuedate: z.string(),
  duedate: z.string(),
  payment_type: z.string(),
  status: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      productId: z.string().min(1, 'Product is required'),
      quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
      unitprice: z.coerce.number().min(0, 'Price must be positive'),
      taxrate: z.coerce.number().min(0, 'Tax rate must be positive'),
      discount: z.coerce.number().min(0).max(100, 'Discount must be between 0 and 100'),
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

const ProformaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const canApprove = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const canConvert = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const isEditMode = window.location.pathname.includes('/edit/');
  const [totals, setTotals] = useState({ 
    subtotal: 0, 
    taxTotal: 0, 
    stampTax: 0,
    total: 0 
  });

  const { data: proforma, isLoading } = useQuery({
    queryKey: ['proformaInvoice', id],
    queryFn: () => mockDataService.getProformaInvoiceById(id!),
    enabled: !!id,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => mockDataService.getClients(),
  });
  
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => mockDataService.getProducts(),
  });

  const form = useForm({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      clientid: proforma?.clientid || '',
      notes: proforma?.notes || '',
      issuedate: proforma?.issuedate || '',
      duedate: proforma?.duedate || '',
      payment_type: proforma?.payment_type || 'cheque',
      status: proforma?.status || 'draft',
      items: proforma?.items || [],
    },
    values: {
      clientid: proforma?.clientid || '',
      notes: proforma?.notes || '',
      issuedate: proforma?.issuedate || '',
      duedate: proforma?.duedate || '',
      payment_type: proforma?.payment_type || 'cheque',
      status: proforma?.status || 'draft',
      items: proforma?.items || [],
    }
  });

  const calculateStampTax = (paymentType: string, subtotal: number) => {
    if (paymentType !== "cash") return 0;

    if (subtotal > 100000) {
      return subtotal * 0.02;
    } else if (subtotal > 30000) {
      return subtotal * 0.015;
    } else if (subtotal > 300) {
      return subtotal * 0.01;
    } else {
      return 0;
    }
  };

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith('items') || name === 'items' || name === 'payment_type') {
        calculateTotals();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const calculateTotals = () => {
    const items = form.getValues('items') || [];
    const paymentType = form.getValues('payment_type');
    
    let subtotal = 0;
    let taxTotal = 0;
    
    items.forEach(item => {
      if (!item.productId) return;
      
      const quantity = item.quantity || 0;
      const unitprice = item.unitprice || 0;
      const taxrate = item.taxrate || 0;
      const discount = item.discount || 0;
      
      const itemSubtotal = quantity * unitprice * (1 - discount / 100);
      const itemTax = itemSubtotal * (taxrate / 100);
      
      subtotal += itemSubtotal;
      taxTotal += itemTax;
    });
    
    const stampTax = calculateStampTax(paymentType, subtotal);
    const total = subtotal + taxTotal + stampTax;
    
    setTotals({ subtotal, taxTotal, stampTax, total });
  };

  const addItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [
      ...currentItems,
      {
        id: generateId(),
        productId: '',
        quantity: 1,
        unitprice: 0,
        taxrate: 0,
        discount: 0
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
    if (product) {
      const items = [...form.getValues('items')];
      items[index] = {
        ...items[index],
        productId: productId,
        unitprice: product.unitprice,
        taxrate: product.taxrate,
        product: product
      };
      form.setValue('items', items);
    }
  };

  const updateProformaMutation = useMutation({
    mutationFn: async (data) => {
      // First update the invoice basic details
      await Br.updateProformaInvoice(id || '', {
        clientid: data.clientid,
        issuedate: data.issuedate,
        duedate: data.duedate,
        notes: data.notes,
        payment_type: data.payment_type,
        status: data.status
      });

      // Process items to calculate their totals
      const processedItems = data.items.map(item => {
        const quantity = item.quantity || 0;
        const unitprice = item.unitprice || 0;
        const taxrate = item.taxrate || 0;
        const discount = item.discount || 0;
        
        const totalExcl = quantity * unitprice * (1 - discount / 100);
        const totalTax = totalExcl * (taxrate / 100);
        const total = totalExcl + totalTax;
        
        return {
          ...item,
          totalExcl,
          totalTax,
          total
        };
      });

      // Calculate invoice totals
      const subtotal = processedItems.reduce((sum, item) => sum + item.totalExcl, 0);
      const taxTotal = processedItems.reduce((sum, item) => sum + item.totalTax, 0);
      const stampTax = calculateStampTax(data.payment_type, subtotal);
      const total = subtotal + taxTotal + stampTax;

      // Update the invoice with calculated totals
      await Br.updateProformaInvoice(id || '', {
        subtotal,
        taxtotal: taxTotal,
        stamp_tax: stampTax,
        total
      });

      // Process items for database insertion
      // Here we'd normally insert items into invoice_items table and link them
      // For the mock service, we're updating through the service
      return await mockDataService.Br.updateProformaInvoice(id || '', {
        ...data,
        items: processedItems,
        subtotal,
        taxTotal,
        stampTax,
        total
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Proforma Updated',
        description: 'Proforma invoice has been updated successfully'
      });
      navigate(`/invoices/proforma/${id}`);
    },
    onError: (error) => {
      console.error('Error updating proforma:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update proforma invoice. Please try again.'
      });
    }
  });

  const deleteProformaMutation = useMutation({
    mutationFn: () => deleteProformaInvoice(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoices'] });
      toast({
        title: 'Proforma Deleted',
        description: 'Proforma invoice has been deleted successfully'
      });
      navigate('/invoices/proforma');
    },
    onError: (error) => {
      console.error('Error deleting proforma:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Failed to delete proforma invoice. Please try again.'
      });
    }
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (status: 'draft' | 'sent' | 'approved' | 'rejected') => {
      return Br.updateProformaInvoice(id || '', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Status Updated',
        description: `Proforma invoice status has been updated`
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update status. Please try again.'
      });
      console.error('Error updating proforma status:', error);
    }
  });

  const undoConversionMutation = useMutation({
    mutationFn: () => {
      if (!proforma?.finalInvoiceId) {
        throw new Error('No linked final invoice');
      }
      return undoProformaConversion(id || '', proforma.finalInvoiceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Conversion Undone',
        description: 'Successfully removed the final invoice'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to undo conversion. Please try again.'
      });
      console.error('Error undoing conversion:', error);
    }
  });

  const convertMutation = useMutation({
    mutationFn: () => {
      return mockDataService.convertProformaToFinal(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Proforma Converted',
        description: 'Successfully converted to final invoice'
      });
      if (data.proforma && data.proforma.finalInvoiceId) {
        navigate(`/invoices/final/${data.proforma.finalInvoiceId}`);
      }
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to convert to final invoice. Please try again.'
      });
      console.error('Error converting proforma to final:', error);
    }
  });

  const handleUpdateStatus = (status: 'draft' | 'sent' | 'approved' | 'rejected') => {
    if (!id) return;
    statusUpdateMutation.mutate(status);
  };

  const handleConvertToFinal = () => {
    if (!id) return;
    convertMutation.mutate();
  };

  const handleUndoConversion = () => {
    if (!id || !proforma?.finalInvoiceId) return;
    undoConversionMutation.mutate();
  };

  const handleExportPDF = () => {
    if (!proforma) return;
    
    try {
      const result = exportProformaInvoiceToPDF(proforma);
      if (result) {
        toast({
          title: 'PDF Generated',
          description: 'Proforma invoice has been exported to PDF'
        });
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.'
      });
    }
  };

  const onSubmit = (data) => {
    if (!id) return;
    updateProformaMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-DZ');
  };

  const getPaymentTypeIcon = (paymentType: string) => {
    if (paymentType === 'cash') {
      return <Banknote className="h-4 w-4 text-green-600 mr-2" />;
    }
    return <CreditCard className="h-4 w-4 text-blue-600 mr-2" />;
  };

  const handleDeleteProforma = () => {
    if (!id) return;
    deleteProformaMutation.mutate();
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

  if (!proforma) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-center text-muted-foreground">
              Proforma invoice not found
            </p>
            <Button asChild variant="outline">
              <Link to="/invoices/proforma">Return to List</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = {
    draft: "bg-gray-500",
    sent: "bg-blue-500",
    approved: "bg-green-500",
    rejected: "bg-red-500"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/invoices/proforma">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? `Edit Proforma: ${proforma.number}` : `Proforma Invoice: ${proforma.number}`}
          </h1>
        </div>
        {!isEditMode && (
          <Badge
            className={`${statusColor[proforma.status]} text-white px-3 py-1 text-xs font-medium uppercase`}
          >
            {proforma.status}
          </Badge>
        )}
      </div>

      {isEditMode ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                {field => field.value && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div>
                      <strong className="font-semibold">Tax ID:</strong>{" "}
                      {clients.find(c => c.id === field.value)?.taxId}
                    </div>
                    <div>
                      <strong className="font-semibold">Address:</strong>{" "}
                      {clients.find(c => c.id === field.value)?.address}
                    </div>
                    <div>
                      <strong className="font-semibold">City:</strong>{" "}
                      {clients.find(c => c.id === field.value)?.city}, {clients.find(c => c.id === field.value)?.country}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong className="font-semibold">Invoice Number:</strong>{" "}
                  {proforma.number}
                </div>
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
                <FormField
                  control={form.control}
                  name="duedate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <CardDescription>Products and services included in this proforma</CardDescription>
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
                        <TableHead className="w-[80px]">Qty</TableHead>
                        <TableHead className="w-[120px]">Unit Price</TableHead>
                        <TableHead className="w-[80px]">Tax %</TableHead>
                        <TableHead className="w-[80px]">Disc %</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.getValues('items')?.map((item, index) => (
                        <TableRow key={item.id || index}>
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
                                {form.formState.errors.items?.[index]?.productId?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const items = [...form.getValues('items')];
                                items[index].quantity = parseInt(e.target.value) || 1;
                                form.setValue('items', items);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitprice}
                              onChange={(e) => {
                                const items = [...form.getValues('items')];
                                items[index].unitprice = parseFloat(e.target.value) || 0;
                                form.setValue('items', items);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.taxrate}
                              onChange={(e) => {
                                const items = [...form.getValues('items')];
                                items[index].taxrate = parseFloat(e.target.value) || 0;
                                form.setValue('items', items);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount || 0}
                              onChange={(e) => {
                                const items = [...form.getValues('items')];
                                items[index].discount = parseFloat(e.target.value) || 0;
                                form.setValue('items', items);
                              }}
                            />
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
                
                <div className="mt-4 space-y-2 border-t pt-4 text-right">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tax:</span>
                    <span>{formatCurrency(totals.taxTotal)}</span>
                  </div>
                  {form.getValues('payment_type') === 'cash' && (
                    <div className="flex justify-between">
                      <span className="font-medium">Stamp Tax:</span>
                      <span>{formatCurrency(totals.stampTax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link to={`/invoices/proforma/${proforma.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={updateProformaMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong className="font-semibold">Name:</strong>{" "}
                {proforma.client?.name}
              </div>
              <div>
                <strong className="font-semibold">Tax ID:</strong>{" "}
                {proforma.client?.taxId}
              </div>
              <div>
                <strong className="font-semibold">Address:</strong>{" "}
                {proforma.client?.address}
              </div>
              <div>
                <strong className="font-semibold">City:</strong>{" "}
                {proforma.client?.city}, {proforma.client?.country}
              </div>
              <div>
                <strong className="font-semibold">Contact:</strong>{" "}
                {proforma.client?.phone} | {proforma.client?.email}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong className="font-semibold">Invoice Number:</strong>{" "}
                {proforma.number}
              </div>
              <div>
                <strong className="font-semibold">Issue Date:</strong>{" "}
                {formatDate(proforma.issuedate)}
              </div>
              <div>
                <strong className="font-semibold">Due Date:</strong>{" "}
                {formatDate(proforma.duedate)}
              </div>
              <div>
                <strong className="font-semibold">Status:</strong>{" "}
                <Badge
                  className={`${statusColor[proforma.status]} text-white px-2 py-0.5 text-xs font-medium`}
                >
                  {proforma.status}
                </Badge>
              </div>
              <div>
                <strong className="font-semibold">Payment Method:</strong>{" "}
                <span className="flex items-center">
                  {getPaymentTypeIcon(proforma.payment_type || 'cheque')}
                  {proforma.payment_type === 'cash' ? 'Cash' : 'Cheque'}
                </span>
              </div>
              {proforma.finalInvoiceId && (
                <div>
                  <strong className="font-semibold">Final Invoice:</strong>{" "}
                  <Link
                    to={`/invoices/final/${proforma.finalInvoiceId}`}
                    className="text-primary hover:underline"
                  >
                    View Final Invoice
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Products and services included in this proforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Tax %</TableHead>
                    <TableHead className="text-right">Discount %</TableHead>
                    <TableHead className="text-right">Total Excl.</TableHead>
                    <TableHead className="text-right">Tax Amount</TableHead>
                    <TableHead className="text-right">Total Incl.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proforma.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.product?.code}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitprice)}</TableCell>
                      <TableCell className="text-right">{item.taxrate}%</TableCell>
                      <TableCell className="text-right">{item.discount}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalExcl)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalTax)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={5} className="px-4 py-2 text-right font-semibold">
                      Subtotal:
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-right">
                      {formatCurrency(proforma.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right font-semibold">
                      Tax Total:
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-right">
                      {formatCurrency(proforma.taxTotal)}
                    </td>
                  </tr>
                  {proforma.payment_type === 'cash' && proforma.stamp_tax > 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-semibold">
                        Stamp Tax:
                      </td>
                      <td colSpan={3} className="px-4 py-2 text-right">
                        {formatCurrency(proforma.stamp_tax)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t">
                    <td colSpan={5} className="px-4 py-2 text-right font-bold text-lg">
                      Total:
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-right font-bold text-lg">
                      {formatCurrency(proforma.total)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>

          {proforma.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line">{proforma.notes}</CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this proforma invoice</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {canEdit && (proforma.status === 'draft' || proforma.status === 'sent') && (
                <Button asChild variant="outline">
                  <Link to={`/invoices/proforma/edit/${proforma.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Proforma
                  </Link>
                </Button>
              )}
              
              {proforma.status === 'draft' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus('sent')}
                  disabled={statusUpdateMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Mark as Sent
                </Button>
              )}

              {proforma.status === 'sent' && canApprove && (
                <Button
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={statusUpdateMutation.isPending}
                >
                  <ThumbsUp className="mr-2 h-4 w-4 text-green-600" />
                  Approve
                </Button>
              )}

              {proforma.status === 'sent' && canApprove && (
                <Button
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={statusUpdateMutation.isPending}
                >
                  <ThumbsDown className="mr-2 h-4 w-4 text-red-600" />
                  Reject
                </Button>
              )}

              {proforma.status === 'approved' && !proforma.finalInvoiceId && canConvert && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Convert to Final Invoice
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Convert to Final Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a final invoice based on this proforma.
                        Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConvertToFinal}
                        disabled={convertMutation.isPending}
                      >
                        {convertMutation.isPending ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                            Converting...
                          </>
                        ) : (
                          "Convert"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {proforma.status === 'approved' && canApprove && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="bg-yellow-50 hover:bg-yellow-100">
                      <Undo className="mr-2 h-4 w-4 text-yellow-600" />
                      Undo Approval
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Undo Approval</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will change the status back to "sent".
                        Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUpdateStatus('sent')}
                        disabled={statusUpdateMutation.isPending}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {proforma.finalInvoiceId && canConvert && (
                <>
                  <Button asChild variant="default">
                    <Link to={`/invoices/final/${proforma.finalInvoiceId}`}>
                      <File className="mr-2 h-4 w-4" />
                      View Final Invoice
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="bg-yellow-50 hover:bg-yellow-100">
                        <Undo className="mr-2 h-4 w-4 text-yellow-600" />
                        Undo Conversion
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Undo Conversion</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete the linked final invoice and reset this proforma.
                          Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleUndoConversion}
                          disabled={undoConversionMutation.isPending}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              <Button variant="outline" onClick={handleExportPDF}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Download
              </Button>
              
              {canEdit && proforma.status === 'draft' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Proforma Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this proforma invoice.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProforma}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProformaDetail;
