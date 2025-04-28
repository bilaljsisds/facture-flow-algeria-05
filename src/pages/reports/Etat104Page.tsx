
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockDataService } from '@/services/mockDataService';
import { FinalInvoice } from '@/types';
import { FileSpreadsheet, Download } from 'lucide-react';

const Etat104Page = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  
  // Fetch invoices
  const { data: finalInvoices = [], isLoading } = useQuery({
    queryKey: ['finalInvoices'],
    queryFn: () => mockDataService.getFinalInvoices(),
  });
  
  // Filter invoices for the selected period (demo only)
  const filteredInvoices = finalInvoices.filter(invoice => {
    const invoiceDate = new Date(invoice.issueDate);
    return (
      invoiceDate.getFullYear() === parseInt(year) && 
      invoiceDate.getMonth() + 1 === parseInt(month)
    );
  });
  
  // Calculate totals
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.subtotal, 0);
  const totalTax = filteredInvoices.reduce((sum, invoice) => sum + invoice.taxTotal, 0);
  const grandTotal = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD',
      minimumFractionDigits: 2
    });
  };
  
  // Export functions (demo only)
  const exportToPDF = () => {
    alert('PDF Export functionality would be implemented here');
  };
  
  const exportToExcel = () => {
    alert('Excel Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">État 104 Report</h1>
          <p className="text-muted-foreground">
            Generate your monthly tax declaration summary
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>Select the period for the État 104 report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">January</SelectItem>
                  <SelectItem value="02">February</SelectItem>
                  <SelectItem value="03">March</SelectItem>
                  <SelectItem value="04">April</SelectItem>
                  <SelectItem value="05">May</SelectItem>
                  <SelectItem value="06">June</SelectItem>
                  <SelectItem value="07">July</SelectItem>
                  <SelectItem value="08">August</SelectItem>
                  <SelectItem value="09">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button className="mt-4" onClick={() => console.log('Generate report')}>
            Generate Report
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>État 104 Report - {month}/{year}</CardTitle>
          <CardDescription>Monthly TVA Declaration Summary</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-center text-muted-foreground">
                No invoice data available for this period
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead className="text-right">Amount (Excl.)</TableHead>
                      <TableHead className="text-right">TVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.number}</TableCell>
                        <TableCell>{invoice.issueDate}</TableCell>
                        <TableCell>{invoice.client?.name}</TableCell>
                        <TableCell>{invoice.client?.taxId}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.subtotal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.taxTotal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Summary row */}
                    <TableRow className="font-medium">
                      <TableCell colSpan={4} className="text-right">
                        TOTALS:
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalTax)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(grandTotal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="mb-3 font-medium">Summary for État 104 Declaration</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2">
                    <span>Total Sales (Excl. Tax):</span>
                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span>Total TVA Collected:</span>
                    <span className="font-medium">{formatCurrency(totalTax)}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span>Total TVA Deductible (simulated):</span>
                    <span className="font-medium">{formatCurrency(totalTax * 0.3)}</span>
                  </div>
                  <div className="grid grid-cols-2 border-t pt-2">
                    <span>TVA Due:</span>
                    <span className="font-medium">{formatCurrency(totalTax * 0.7)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Note: In a production environment, this report would be fully compliant with the Algerian tax authority requirements for G50 declarations.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Etat104Page;
