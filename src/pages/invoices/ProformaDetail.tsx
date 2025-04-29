
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const proformaFormSchema = z.object({
  notes: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
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

  const { data: proforma, isLoading } = useQuery({
    queryKey: ['proformaInvoice', id],
    queryFn: () => mockDataService.getProformaInvoiceById(id!),
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      notes: proforma?.notes || '',
      issueDate: proforma?.issueDate || '',
      dueDate: proforma?.dueDate || ''
    },
    values: {
      notes: proforma?.notes || '',
      issueDate: proforma?.issueDate || '',
      dueDate: proforma?.dueDate || ''
    }
  });

  const updateProformaMutation = useMutation({
    mutationFn: (data) => mockDataService.updateProformaInvoice(id || '', data),
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

  const statusUpdateMutation = useMutation({
    mutationFn: (status: 'draft' | 'sent' | 'approved' | 'rejected') => {
      return mockDataService.updateProformaStatus(id, status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Status Updated',
        description: `Proforma invoice status changed to ${data.status}`
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
                <FormField
                  control={form.control}
                  name="issueDate"
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
                  name="dueDate"
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
                {formatDate(proforma.issueDate)}
              </div>
              <div>
                <strong className="font-semibold">Due Date:</strong>{" "}
                {formatDate(proforma.dueDate)}
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
              {canEdit && proforma.status === 'draft' && (
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

              {proforma.finalInvoiceId && (
                <Button asChild variant="default">
                  <Link to={`/invoices/final/${proforma.finalInvoiceId}`}>
                    <File className="mr-2 h-4 w-4" />
                    View Final Invoice
                  </Link>
                </Button>
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

export default ProformaDetail;
