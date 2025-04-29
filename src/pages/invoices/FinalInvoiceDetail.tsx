import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDataService } from '@/services/mockDataService';
import { ArrowLeft, Truck, FilePdf } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { exportFinalInvoiceToPDF } from '@/utils/exportUtils';

const FinalInvoiceDetail = () => {
  const { id } = useParams();
  const isNewInvoice = id === 'new';
  
  const { 
    data: invoices = [],
    isLoading 
  } = useQuery({
    queryKey: ['finalInvoices'],
    queryFn: () => mockDataService.getFinalInvoices(),
    enabled: !isNewInvoice,
  });
  
  const invoice = isNewInvoice ? null : invoices.find(i => i.id === id);
  
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '';
    return amount.toLocaleString('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      minimumFractionDigits: 2
    });
  };
  
  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outline';
    switch (status) {
      case 'paid':
        return 'default';
      case 'unpaid':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'credited':
        return 'outline';
      default:
        return 'outline';
    }
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

  if (!isNewInvoice && isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
            {isNewInvoice ? 'New Final Invoice' : `Invoice: ${invoice?.number}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNewInvoice && invoice?.status && (
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          )}
        </div>
      </div>
      
      {!isNewInvoice && invoice ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Client details for this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span>{invoice.client?.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Tax ID:</span>
                    <span>{invoice.client?.taxId}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <span>{invoice.client?.address}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">City:</span>
                    <span>{invoice.client?.city}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Information about this document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Invoice Number:</span>
                    <span>{invoice.number}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Issue Date:</span>
                    <span>{invoice.issueDate}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <span>{invoice.dueDate}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </span>
                  </div>
                  {invoice.proformaId && (
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">From Proforma:</span>
                      <span>
                        <Link to={`/invoices/proforma/${invoice.proformaId}`} className="text-primary hover:underline">
                          P-{invoice.proformaId.padStart(4, '0')}
                        </Link>
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Products and services in this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Tax</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">{item.product?.name}</div>
                            <div className="text-xs text-muted-foreground">{item.product?.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unitprice)}</td>
                        <td className="px-4 py-2 text-right">{item.taxrate}%</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 space-y-2 border-t pt-4 text-right">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax:</span>
                  <span>{formatCurrency(invoice.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
              
              {invoice.notes && (
                <div className="mt-6 rounded-md border p-4">
                  <h4 className="mb-2 font-medium">Notes</h4>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FilePdf className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            
            {['unpaid', 'paid'].includes(invoice.status) && (
              <Button asChild>
                <Link to={`/delivery-notes/new?invoiceId=${invoice.id}`}>
                  <Truck className="mr-2 h-4 w-4" />
                  Create Delivery Note
                </Link>
              </Button>
            )}
            
            {invoice.status === 'unpaid' && (
              <Button>Mark as Paid</Button>
            )}
          </div>
        </>
      ) : isNewInvoice ? (
        <Card>
          <CardHeader>
            <CardTitle>New Final Invoice</CardTitle>
            <CardDescription>Create a new final invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              This is a demonstration application. <br />
              The full invoice creation form would be implemented here in a production environment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <FilePdf className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-center text-muted-foreground">
                Invoice not found
              </p>
              <Button asChild variant="outline">
                <Link to="/invoices/final">Return to List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinalInvoiceDetail;
