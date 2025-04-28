import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { ArrowLeft, FileText, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const ProformaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewProforma = id === 'new';
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  
  // Fetch proforma data if not new
  const { 
    data: proformas = [],
    isLoading,
    error 
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

  // Update proforma status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => {
      return mockDataService.updateProformaStatus(id!, status, status === 'rejected' ? rejectionReason : undefined);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoices'] });
      toast({
        title: 'Status Updated',
        description: `Proforma invoice status has been updated to ${data.status}`
      });
      setRejectionDialogOpen(false);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update status. Please try again.'
      });
    }
  });

  // Convert to final invoice mutation
  const convertToFinalMutation = useMutation({
    mutationFn: () => {
      return mockDataService.convertProformaToFinal(id!);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['finalInvoices'] });
      toast({
        title: 'Proforma Converted',
        description: 'Proforma has been converted to a final invoice'
      });
      // Navigate to the new final invoice
      if (data.finalInvoiceId) {
        navigate(`/invoices/final/${data.finalInvoiceId}`);
      }
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to convert to final invoice. Please try again.'
      });
    }
  });

  // Handle status changes
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'rejected') {
      setRejectionDialogOpen(true);
    } else {
      updateStatusMutation.mutate(newStatus);
    }
  };

  // Handle conversion to final invoice
  const handleConvertToFinal = () => {
    convertToFinalMutation.mutate();
  };

  // Handle rejection confirmation
  const handleRejectConfirm = () => {
    updateStatusMutation.mutate('rejected');
  };

  // Redirect to NewProformaInvoice if isNewProforma is true
  if (isNewProforma) {
    return <Link to="/invoices/proforma/new" style={{ display: 'none' }} id="redirectToNewProforma" />;
  }

  // Loading state
  if (!isNewProforma && isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (!isNewProforma && error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-red-500">Error loading proforma information</p>
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
              <Button onClick={() => handleStatusChange('sent')}>
                Mark as Sent
              </Button>
            )}
            {proforma.status === 'sent' && (
              <>
                <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Proforma Invoice</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this proforma invoice.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="rejection-reason">Rejection Reason</Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Enter the reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectionReason.trim()}>
                        Confirm Rejection
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button onClick={() => handleStatusChange('approved')}>
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            {proforma.status === 'approved' && !proforma.finalInvoiceId && (
              <Button onClick={handleConvertToFinal}>
                Convert to Final Invoice
              </Button>
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
            <div className="flex justify-center py-8">
              <Button asChild>
                <Link to="/invoices/proforma/new">
                  Create New Proforma
                </Link>
              </Button>
            </div>
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

      {isNewProforma && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.getElementById('redirectToNewProforma').click();
              });
            `,
          }}
        />
      )}
    </div>
  );
};

export default ProformaDetail;
