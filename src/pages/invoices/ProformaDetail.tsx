
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
import { ArrowLeft, FileText } from 'lucide-react';

const ProformaDetail = () => {
  const { id } = useParams();
  const isNewProforma = id === 'new';
  
  // Fetch proforma data if not new
  const { 
    data: proformas = [],
    isLoading 
  } = useQuery({
    queryKey: ['proformaInvoices'],
    queryFn: () => mockDataService.getProformaInvoices(),
    enabled: !isNewProforma,
  });
  
  // Find the specific proforma
  const proforma = isNewProforma ? null : proformas.find(p => p.id === id);
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '';
    return amount.toLocaleString('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      minimumFractionDigits: 2
    });
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outline';
    switch (status) {
      case 'draft':
        return 'outline';
      case 'sent':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Loading state
  if (!isNewProforma && isLoading) {
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
            <Link to="/invoices/proforma">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewProforma ? 'New Proforma Invoice' : `Proforma: ${proforma?.number}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNewProforma && proforma?.status && (
            <Badge variant={getStatusBadgeVariant(proforma.status)}>
              {proforma.status.charAt(0).toUpperCase() + proforma.status.slice(1)}
            </Badge>
          )}
        </div>
      </div>
      
      {!isNewProforma && proforma ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Client details for this proforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span>{proforma.client?.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Tax ID:</span>
                    <span>{proforma.client?.taxId}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <span>{proforma.client?.address}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">City:</span>
                    <span>{proforma.client?.city}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Proforma Details</CardTitle>
                <CardDescription>Information about this document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Proforma Number:</span>
                    <span>{proforma.number}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Issue Date:</span>
                    <span>{proforma.issueDate}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Due Date:</span>
                    <span>{proforma.dueDate}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span>
                      <Badge variant={getStatusBadgeVariant(proforma.status)}>
                        {proforma.status.charAt(0).toUpperCase() + proforma.status.slice(1)}
                      </Badge>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Products and services in this proforma</CardDescription>
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
                    {proforma.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">{item.product?.name}</div>
                            <div className="text-xs text-muted-foreground">{item.product?.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right">{item.taxRate}%</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 space-y-2 border-t pt-4 text-right">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(proforma.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax:</span>
                  <span>{formatCurrency(proforma.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(proforma.total)}</span>
                </div>
              </div>
              
              {proforma.notes && (
                <div className="mt-6 rounded-md border p-4">
                  <h4 className="mb-2 font-medium">Notes</h4>
                  <p className="text-sm">{proforma.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            {proforma.status === 'draft' && (
              <Button>Mark as Sent</Button>
            )}
            {proforma.status === 'sent' && (
              <>
                <Button variant="destructive">Reject</Button>
                <Button>Approve</Button>
              </>
            )}
            {proforma.status === 'approved' && proforma.finalInvoiceId && (
              <Button asChild>
                <Link to={`/invoices/final/${proforma.finalInvoiceId}`}>
                  View Final Invoice
                </Link>
              </Button>
            )}
          </div>
        </>
      ) : isNewProforma ? (
        <Card>
          <CardHeader>
            <CardTitle>New Proforma Invoice</CardTitle>
            <CardDescription>Create a new proforma invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              This is a demonstration application. <br />
              The full proforma creation form would be implemented here in a production environment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-center text-muted-foreground">
                Proforma invoice not found
              </p>
              <Button asChild variant="outline">
                <Link to="/invoices/proforma">Return to List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProformaDetail;
