
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
  updateFinalInvoice, 
  deleteFinalInvoice 
} from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Banknote,
  FileText,
  Ban,
  Check,
  Edit,
  Save,
  Printer,
  Trash2,
  Undo,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { exportFinalInvoiceToPDF } from '@/utils/exportUtils';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const finalInvoiceFormSchema = z.object({
  notes: z.string().optional(),
  issuedate: z.string(),
  duedate: z.string(),
  status: z.string(),
  paymentDate: z.string().optional(),
  paymentReference: z.string().optional(),
});

const FinalInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { checkPermission } = useAuth();
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  const isEditMode = window.location.pathname.includes('/edit/');

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['finalInvoice', id],
    queryFn: () => mockDataService.getFinalInvoiceById(id!),
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(finalInvoiceFormSchema),
    defaultValues: {
      notes: invoice?.notes || '',
      issuedate: invoice?.issuedate || '',
      duedate: invoice?.duedate || '',
      status: invoice?.status || 'unpaid',
      paymentDate: invoice?.paymentDate || '',
      paymentReference: invoice?.paymentReference || '',
    },
    values: {
      notes: invoice?.notes || '',
      issuedate: invoice?.issuedate || '',
      duedate: invoice?.duedate || '',
      status: invoice?.status || 'unpaid',
      paymentDate: invoice?.paymentDate || '',
      paymentReference: invoice?.paymentReference || '',
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: (data) => updateFinalInvoice(id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalInvoice', id] });
      toast({
        title: 'Invoice Updated',
        description: 'Invoice has been updated successfully'
      });
      navigate(`/invoices/final/${id}`);
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update invoice. Please try again.'
      });
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: () => deleteFinalInvoice(id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalInvoices'] });
      toast({
        title: 'Invoice Deleted',
        description: 'Invoice has been deleted successfully'
      });
      navigate('/invoices/final');
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Failed to delete invoice. Please try again.'
      });
    }
  });

  const statusUpdateMutation = useMutation({
    mutationFn: (data) => {
      return updateFinalInvoice(id || '', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalInvoice', id] });
      toast({
        title: 'Status Updated',
        description: 'Invoice status has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Status Update Failed',
        description: 'Failed to update invoice status. Please try again.'
      });
      console.error('Error updating invoice status:', error);
    }
  });

  const handleUpdateStatus = (status: 'paid' | 'unpaid' | 'cancelled' | 'credited', additionalData = {}) => {
    if (!id) return;
    statusUpdateMutation.mutate({ status, ...additionalData });
  };

  const handleMarkAsPaid = () => {
    const paymentDate = new Date().toISOString().split('T')[0];
    handleUpdateStatus('paid', { paymentDate });
  };

  const handleExportPDF = () => {
    if (!invoice) return;
    
    try {
      const result = exportFinalInvoiceToPDF(invoice);
      if (result) {
        toast({
          title: 'PDF Generated',
          description: 'Invoice has been exported to PDF'
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

  const handleDeleteInvoice = () => {
    if (!id) return;
    deleteInvoiceMutation.mutate();
  };

  const onSubmit = (data) => {
    if (!id) return;
    updateInvoiceMutation.mutate(data);
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

  if (!invoice) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <p className="text-center text-muted-foreground">
              Invoice not found
            </p>
            <Button asChild variant="outline">
              <Link to="/invoices/final">Return to List</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = {
    unpaid: "bg-amber-500",
    paid: "bg-green-500",
    cancelled: "bg-red-500",
    credited: "bg-purple-500",
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-DZ');
  };

  const getPaymentTypeIcon = (paymentType: string) => {
    if (paymentType === 'cash') {
      return <Banknote className="h-4 w-4 text-green-600 mr-2" />;
    }
    return <CreditCard className="h-4 w-4 text-blue-600 mr-2" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/invoices/final">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? `Edit Invoice: ${invoice.number}` : `Invoice: ${invoice.number}`}
          </h1>
        </div>
        {!isEditMode && (
          <Badge
            className={`${statusColor[invoice.status]} text-white px-3 py-1 text-xs font-medium uppercase`}
          >
            {invoice.status}
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
                <div>
                  <strong className="font-semibold">Name:</strong>{" "}
                  {invoice.client?.name}
                </div>
                <div>
                  <strong className="font-semibold">Tax ID:</strong>{" "}
                  {invoice.client?.taxId}
                </div>
                <div>
                  <strong className="font-semibold">Address:</strong>{" "}
                  {invoice.client?.address}
                </div>
                <div>
                  <strong className="font-semibold">City:</strong>{" "}
                  {invoice.client?.city}, {invoice.client?.country}
                </div>
                <div>
                  <strong className="font-semibold">Contact:</strong>{" "}
                  {invoice.client?.phone} | {invoice.client?.email}
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
                  {invoice.number}
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
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="credited">Credited</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('status') === 'paid' && (
                  <>
                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paymentReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Reference</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {invoice.proformaId && (
                  <div>
                    <strong className="font-semibold">From Proforma:</strong>{" "}
                    <Link
                      to={`/invoices/proforma/${invoice.proformaId}`}
                      className="text-primary hover:underline"
                    >
                      View Proforma
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
                <CardDescription>Products and services included in this invoice</CardDescription>
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
                    {invoice.items.map((item) => (
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
                </Table>
                
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
                <Link to={`/invoices/final/${invoice.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={updateInvoiceMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong className="font-semibold">Name:</strong>{" "}
                  {invoice.client?.name}
                </div>
                <div>
                  <strong className="font-semibold">Tax ID:</strong>{" "}
                  {invoice.client?.taxId}
                </div>
                <div>
                  <strong className="font-semibold">Address:</strong>{" "}
                  {invoice.client?.address}
                </div>
                <div>
                  <strong className="font-semibold">City:</strong>{" "}
                  {invoice.client?.city}, {invoice.client?.country}
                </div>
                <div>
                  <strong className="font-semibold">Contact:</strong>{" "}
                  {invoice.client?.phone} | {invoice.client?.email}
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
                  {invoice.number}
                </div>
                <div>
                  <strong className="font-semibold">Issue Date:</strong>{" "}
                  {formatDate(invoice.issuedate)}
                </div>
                <div>
                  <strong className="font-semibold">Due Date:</strong>{" "}
                  {formatDate(invoice.duedate)}
                </div>
                <div>
                  <strong className="font-semibold">Status:</strong>{" "}
                  <Badge
                    className={`${statusColor[invoice.status]} text-white px-2 py-0.5 text-xs font-medium`}
                  >
                    {invoice.status}
                  </Badge>
                </div>
                
                {invoice.status === 'paid' && (
                  <>
                    <div>
                      <strong className="font-semibold">Payment Date:</strong>{" "}
                      {formatDate(invoice.paymentDate || '')}
                    </div>
                    {invoice.paymentReference && (
                      <div>
                        <strong className="font-semibold">Payment Reference:</strong>{" "}
                        {invoice.paymentReference}
                      </div>
                    )}
                  </>
                )}

                {invoice.proformaId && (
                  <div>
                    <strong className="font-semibold">From Proforma:</strong>{" "}
                    <Link
                      to={`/invoices/proforma/${invoice.proformaId}`}
                      className="text-primary hover:underline"
                    >
                      View Proforma
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Products and services included in this invoice</CardDescription>
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
                  {invoice.items.map((item) => (
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
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right font-semibold">
                      Tax Total:
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-right">
                      {formatCurrency(invoice.taxTotal)}
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td colSpan={5} className="px-4 py-2 text-right font-bold text-lg">
                      Total:
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-right font-bold text-lg">
                      {formatCurrency(invoice.total)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line">{invoice.notes}</CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this invoice</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {canEdit && invoice.status !== 'credited' && (
                <Button asChild variant="outline">
                  <Link to={`/invoices/final/edit/${invoice.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Link>
                </Button>
              )}
              
              {invoice.status === 'unpaid' && canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Paid
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the invoice as paid and set payment date to today.
                        Would you like to add a payment reference?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="Payment reference (optional)"
                        id="paymentReference"
                        className="mb-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const paymentRef = (document.getElementById('paymentReference') as HTMLInputElement)?.value;
                          const paymentDate = new Date().toISOString().split('T')[0];
                          const data = {
                            status: 'paid',
                            paymentDate,
                            ...(paymentRef ? { paymentReference: paymentRef } : {})
                          };
                          statusUpdateMutation.mutate(data);
                        }}
                      >
                        Mark as Paid
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {invoice.status === 'unpaid' && canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="bg-red-50 hover:bg-red-100">
                      <Ban className="mr-2 h-4 w-4 text-red-600" />
                      Cancel Invoice
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the invoice as cancelled.
                        Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUpdateStatus('cancelled')}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Yes, Cancel It
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {canEdit && invoice.status === 'unpaid' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this invoice.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteInvoice}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {(invoice.status === 'paid' || invoice.status === 'cancelled') && canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="bg-yellow-50 hover:bg-yellow-100">
                      <Undo className="mr-2 h-4 w-4 text-yellow-600" />
                      Revert to Unpaid
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revert to Unpaid</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will revert the invoice status to unpaid.
                        Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUpdateStatus('unpaid', { paymentDate: null, paymentReference: null })}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              <Button variant="outline" onClick={handleExportPDF}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Download
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FinalInvoiceDetail;
