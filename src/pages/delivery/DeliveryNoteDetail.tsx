import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
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
import { ArrowLeft, FileText, Truck, User, Printer, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { exportDeliveryNoteToPDF } from '@/utils/exportUtils';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface DeliveryNoteDetailProps {
  isEditMode?: boolean;
}

const DeliveryNoteDetail: React.FC<DeliveryNoteDetailProps> = ({ isEditMode = false }) => {
  const { id } = useParams();
  const location = useLocation();
  const isNewNote = id === 'new';
  const { checkPermission } = useAuth();
  
  const isEditing = isEditMode || location.pathname.includes('/edit/');
  
  const canEdit = checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]);
  
  const { 
    data: deliveryNotes = [],
    isLoading 
  } = useQuery({
    queryKey: ['deliveryNotes'],
    queryFn: () => mockDataService.getDeliveryNotes(),
    enabled: !isNewNote,
  });
  
  const deliveryNote = isNewNote ? null : deliveryNotes.find(n => n.id === id);
  
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
      case 'delivered':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!isNewNote && isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handlePrintDeliveryNote = () => {
    if (!deliveryNote) return;
    
    try {
      const result = exportDeliveryNoteToPDF(deliveryNote);
      if (result) {
        toast({
          title: 'PDF Generated',
          description: 'Delivery note has been exported to PDF'
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
            {isNewNote ? 'New Delivery Note' : 
             isEditing ? `Edit Delivery Note: ${deliveryNote?.number}` :
             `Delivery Note: ${deliveryNote?.number}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNewNote && !isEditing && deliveryNote?.status && (
            <Badge variant={getStatusBadgeVariant(deliveryNote.status)}>
              {deliveryNote.status.charAt(0).toUpperCase() + deliveryNote.status.slice(1)}
            </Badge>
          )}
        </div>
      </div>
      
      {!isNewNote && deliveryNote ? (
        <>
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Delivery Note</CardTitle>
                <CardDescription>Make changes to this delivery note</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  This is a demonstration application. <br />
                  The full delivery note edit form would be implemented here in a production environment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Client details for this delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span>{deliveryNote.client?.name}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <span>{deliveryNote.client?.address}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">City:</span>
                      <span>{deliveryNote.client?.city}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span>{deliveryNote.client?.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                  <CardDescription>Information about this document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Delivery Number:</span>
                      <span>{deliveryNote.number}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Issue Date:</span>
                      <span>{deliveryNote.issueDate}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Delivery Date:</span>
                      <span>{deliveryNote.deliveryDate || 'Not delivered yet'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span>
                        <Badge variant={getStatusBadgeVariant(deliveryNote.status)}>
                          {deliveryNote.status.charAt(0).toUpperCase() + deliveryNote.status.slice(1)}
                        </Badge>
                      </span>
                    </div>
                    {deliveryNote.finalInvoiceId && (
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Related Invoice:</span>
                        <span>
                          <Link to={`/invoices/final/${deliveryNote.finalInvoiceId}`} className="text-primary hover:underline">
                            F-{deliveryNote.finalInvoiceId.padStart(4, '0')}
                          </Link>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Transportation Details</CardTitle>
              <CardDescription>Information about delivery transport</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deliveryNote.driver_name && (
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Driver:
                    </span>
                    <span>{deliveryNote.driver_name}</span>
                  </div>
                )}
                
                {deliveryNote.truck_id && (
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Truck className="mr-2 h-4 w-4" />
                      Truck ID:
                    </span>
                    <span>{deliveryNote.truck_id}</span>
                  </div>
                )}
                
                {deliveryNote.delivery_company && (
                  <div className="grid grid-cols-2">
                    <span className="text-sm text-muted-foreground">Delivery Company:</span>
                    <span>{deliveryNote.delivery_company}</span>
                  </div>
                )}
                
                {!deliveryNote.driver_name && !deliveryNote.truck_id && !deliveryNote.delivery_company && (
                  <p className="text-sm text-muted-foreground italic">No transportation details provided</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Items for Delivery</CardTitle>
              <CardDescription>Products to be delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-left">Unit</th>
                      <th className="px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryNote.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2 font-medium">
                          {item.product?.name}
                          <div className="text-xs text-muted-foreground">Code: {item.product?.code}</div>
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2">Unit</td>
                        <td className="px-4 py-2 text-sm text-muted-foreground">{item.product?.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {deliveryNote.notes && (
                <div className="mt-6 rounded-md border p-4">
                  <h4 className="mb-2 font-medium">Delivery Instructions</h4>
                  <p className="text-sm">{deliveryNote.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePrintDeliveryNote}>
              <Printer className="mr-2 h-4 w-4" />
              Print Delivery Note
            </Button>
            
            {canEdit && deliveryNote.status === 'pending' && (
              <Button asChild variant="outline">
                <Link to={`/delivery-notes/edit/${deliveryNote.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Delivery Note
                </Link>
              </Button>
            )}
            
            {deliveryNote.status === 'pending' && (
              <Button>Mark as Delivered</Button>
            )}
          </div>
        </>
      ) : isNewNote ? (
        <Card>
          <CardHeader>
            <CardTitle>New Delivery Note</CardTitle>
            <CardDescription>Create a new delivery note</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              This is a demonstration application. <br />
              The full delivery note creation form would be implemented here in a production environment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-center text-muted-foreground">
                Delivery note not found
              </p>
              <Button asChild variant="outline">
                <Link to="/delivery-notes">Return to List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryNoteDetail;
