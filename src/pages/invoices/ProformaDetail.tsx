
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { mockDataService } from '@/services/mockDataService';
import { ProformaInvoice } from '@/types';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Send,
  Loader2,
  FileText,
  DollarSign
} from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useForm } from 'react-hook-form';
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  supabase, 
  updateProformaInvoice, 
  updateProformaInvoiceItems 
} from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { PopoverClose } from "@radix-ui/react-popover"
import { DateRange } from "react-day-picker"
import { Button as UIButton } from "@/components/ui/button"
import { getCurrentDate, getFutureDate } from '@/types';

const formSchema = z.object({
  notes: z.string().optional(),
  issuedate: z.string().min(1, 'Issue date is required'),
  duedate: z.string().min(1, 'Due date is required'),
});

interface ProformaDetailProps {
  
}

type FormData = z.infer<typeof formSchema>

const ProformaDetail: React.FC<ProformaDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: new Date(),
    to: getFutureDate(30),
  })

  const { data: proformaInvoice, isLoading, isError } = useQuery({
    queryKey: ['proformaInvoice', id],
    queryFn: () => mockDataService.getProformaInvoiceById(id!),
    enabled: !!id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: proformaInvoice?.notes || "",
      issuedate: proformaInvoice?.issuedate || getCurrentDate(),
      duedate: proformaInvoice?.duedate || getFutureDate(30),
    },
    values: {
      notes: proformaInvoice?.notes || "",
      issuedate: proformaInvoice?.issuedate || getCurrentDate(),
      duedate: proformaInvoice?.duedate || getFutureDate(30),
    },
    mode: "onChange"
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return updateProformaInvoice(id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Proforma Invoice Updated',
        description: 'Proforma invoice has been successfully updated'
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update proforma invoice. Please try again.'
      });
      console.error('Error updating proforma:', error);
    }
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      return mockDataService.convertProformaToFinal(id!);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      queryClient.invalidateQueries({ queryKey: ['finalInvoices'] });
      toast({
        title: 'Proforma Invoice Converted',
        description: 'Proforma invoice has been successfully converted to final invoice'
      });
      navigate(`/invoices/final/${data.finalInvoice?.id}`);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to convert proforma invoice. Please try again.'
      });
      console.error('Error converting proforma:', error);
    }
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return mockDataService.updateProformaStatus(id!, 'sent');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Proforma Invoice Sent',
        description: 'Proforma invoice has been successfully sent'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send proforma invoice. Please try again.'
      });
      console.error('Error sending proforma:', error);
    }
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      return mockDataService.updateProformaStatus(id!, 'approved');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Proforma Invoice Approved',
        description: 'Proforma invoice has been successfully approved'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve proforma invoice. Please try again.'
      });
      console.error('Error approving proforma:', error);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return mockDataService.updateProformaStatus(id!, 'rejected');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformaInvoice', id] });
      toast({
        title: 'Proforma Invoice Rejected',
        description: 'Proforma invoice has been successfully rejected'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject proforma invoice. Please try again.'
      });
      console.error('Error rejecting proforma:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  }

  if (isLoading) {
    return <div>Loading proforma invoice...</div>;
  }

  if (isError || !proformaInvoice) {
    return <div>Error loading proforma invoice.</div>;
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      minimumFractionDigits: 2
    });
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
            Proforma Invoice {proformaInvoice.number}
          </h1>
          <Badge variant="secondary">{proformaInvoice.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {proformaInvoice.status === 'draft' && (
            <>
              <Button 
                variant="outline"
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isLoading}
              >
                {sendMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </>
          )}

          {proformaInvoice.status === 'sent' && (
            <>
              <Button 
                variant="outline"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isLoading}
              >
                {approveMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
              <Button 
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isLoading}
              >
                {rejectMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </>
                )}
              </Button>
            </>
          )}

          {proformaInvoice.status === 'approved' && !proformaInvoice.finalInvoiceId && (
            <Button 
              variant="default"
              onClick={() => convertMutation.mutate()}
              disabled={convertMutation.isLoading}
            >
              {convertMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Convert to Final
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Proforma Invoice</DialogTitle>
            <DialogDescription>
              Make changes to the proforma invoice here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="issuedate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <UIButton
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </UIButton>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={date?.from}
                            onSelect={(date) => {
                              setDate(prev => ({
                                from: date || new Date(),
                                to: prev.to
                              }));
                              form.setValue("issuedate", date?.toISOString().split('T')[0] || getCurrentDate());
                            }}
                            disabled={(date) =>
                              date > new Date()
                            }
                            initialFocus
                          />
                          <PopoverClose className="absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M18 6L6 18" />
                              <path d="M6 6L18 18" />
                            </svg>
                            <span className="sr-only">Close</span>
                          </PopoverClose>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duedate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <UIButton
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </UIButton>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={date?.to}
                            onSelect={(date) => {
                              setDate(prev => ({
                                from: prev.from,
                                to: date || getFutureDate(30)
                              }));
                              form.setValue("duedate", date?.toISOString().split('T')[0] || getFutureDate(30));
                            }}
                            initialFocus
                          />
                          <PopoverClose className="absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M18 6L6 18" />
                              <path d="M6 6L18 18" />
                            </svg>
                            <span className="sr-only">Close</span>
                          </PopoverClose>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter invoice notes"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Details of the client associated with this proforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Client Name: {proformaInvoice.client?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Tax ID: {proformaInvoice.client?.taxid}
            </p>
            <p className="text-sm text-muted-foreground">
              Address: {proformaInvoice.client?.address}, {proformaInvoice.client?.city}, {proformaInvoice.client?.country}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
          <CardDescription>Details of this proforma invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Issue Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(proformaInvoice.issuedate), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(proformaInvoice.duedate), 'PPP')}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Notes</p>
            <p className="text-sm text-muted-foreground">
              {proformaInvoice.notes}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Products and services included in this proforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proformaInvoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unitprice)}</TableCell>
                    <TableCell>{item.taxrate}%</TableCell>
                    <TableCell>{item.discount}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 border-t pt-4 text-right">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(proformaInvoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax:</span>
              <span>{formatCurrency(proformaInvoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(proformaInvoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProformaDetail;
