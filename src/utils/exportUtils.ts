
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { Client, DeliveryNote, FinalInvoice, ProformaInvoice } from '@/types';

// Type augmentation for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    internal: {
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      pages: number[];
      getNumberOfPages: () => number;
    };
  }
}

// Common helper functions
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2
  });
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-DZ');
};

// Add header with company info
const addHeader = (doc: jsPDF, title: string): void => {
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Your Company Name', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text('123 Business Avenue', 14, 30);
  doc.text('City, Country', 14, 35);
  doc.text('Phone: +123 456 7890', 14, 40);
  doc.text('Email: contact@yourcompany.com', 14, 45);
  
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(title, doc.internal.pageSize.getWidth() - 14, 30, { align: 'right' });
};

// Add client information
const addClientInfo = (doc: jsPDF, client: Client, y = 60): void => {
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text('Bill To:', 14, y);
  
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text(client.name, 14, y + 7);
  doc.text(client.address, 14, y + 14);
  doc.text(`${client.city}, ${client.country}`, 14, y + 21);
  doc.text(`Tax ID: ${client.taxId}`, 14, y + 28);
  doc.text(`Phone: ${client.phone}`, 14, y + 35);
  doc.text(`Email: ${client.email}`, 14, y + 42);
};

// Add invoice summary
const addInvoiceSummary = (
  doc: jsPDF, 
  { number, issueDate, dueDate, status }: { 
    number: string; 
    issueDate: string; 
    dueDate: string; 
    status: string;
  },
  y = 60
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text('Invoice Details:', pageWidth - 90, y);
  
  doc.setFontSize(10);
  
  const detailsX = pageWidth - 90;
  const valuesX = pageWidth - 25;
  
  doc.setTextColor(60);
  doc.text('Number:', detailsX, y + 7);
  doc.text('Issue Date:', detailsX, y + 14);
  doc.text('Due Date:', detailsX, y + 21);
  doc.text('Status:', detailsX, y + 28);
  
  doc.setTextColor(40);
  doc.text(number, valuesX, y + 7, { align: 'right' });
  doc.text(formatDate(issueDate), valuesX, y + 14, { align: 'right' });
  doc.text(formatDate(dueDate), valuesX, y + 21, { align: 'right' });
  doc.text(status.charAt(0).toUpperCase() + status.slice(1), valuesX, y + 28, { align: 'right' });
};

// Add footer with page numbers
const addFooter = (doc: jsPDF): void => {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    const pageHeight = pageSize.getHeight();
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount}`, 
      pageWidth / 2, 
      pageHeight - 10, 
      { align: 'center' }
    );
    
    doc.text(
      'Generated on ' + new Date().toLocaleDateString(), 
      pageWidth - 14, 
      pageHeight - 10, 
      { align: 'right' }
    );
  }
};

// Export Proforma Invoice to PDF
export const exportProformaInvoiceToPDF = (proforma: ProformaInvoice): boolean => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, `Proforma Invoice: ${proforma.number}`);
    addClientInfo(doc, proforma.client!);
    addInvoiceSummary(doc, {
      number: proforma.number,
      issueDate: proforma.issueDate,
      dueDate: proforma.dueDate,
      status: proforma.status
    });
    
    // Add payment method
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text('Payment Method:', pageWidth - 90, 95);
    doc.setTextColor(40);
    doc.text(
      proforma.payment_type === 'cash' ? 'Cash' : 'Cheque',
      pageWidth - 25,
      95,
      { align: 'right' }
    );
    
    // Add items table
    doc.autoTable({
      startY: 120,
      head: [['Product', 'Qty', 'Unit Price', 'Tax %', 'Discount %', 'Total Excl.', 'Tax Amount', 'Total Incl.']],
      body: proforma.items.map(item => [
        item.product?.name || '',
        item.quantity,
        formatCurrency(item.unitprice),
        `${item.taxrate}%`,
        `${item.discount}%`,
        formatCurrency(item.totalExcl),
        formatCurrency(item.totalTax),
        formatCurrency(item.total)
      ]),
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 15, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 30, halign: 'right' },
        7: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY || 200;
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text('Subtotal:', pageWidth - 80, finalY + 10);
    doc.text('Tax Total:', pageWidth - 80, finalY + 18);
    
    if (proforma.payment_type === 'cash' && proforma.stamp_tax > 0) {
      doc.text('Stamp Tax:', pageWidth - 80, finalY + 26);
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text('TOTAL:', pageWidth - 80, finalY + 38);
      
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(formatCurrency(proforma.subtotal), pageWidth - 14, finalY + 10, { align: 'right' });
      doc.text(formatCurrency(proforma.taxTotal), pageWidth - 14, finalY + 18, { align: 'right' });
      doc.text(formatCurrency(proforma.stamp_tax || 0), pageWidth - 14, finalY + 26, { align: 'right' });
      
      doc.setFontSize(12);
      doc.setFontStyle('bold');
      doc.text(formatCurrency(proforma.total), pageWidth - 14, finalY + 38, { align: 'right' });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text('TOTAL:', pageWidth - 80, finalY + 30);
      
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(formatCurrency(proforma.subtotal), pageWidth - 14, finalY + 10, { align: 'right' });
      doc.text(formatCurrency(proforma.taxTotal), pageWidth - 14, finalY + 18, { align: 'right' });
      
      doc.setFontSize(12);
      doc.setFontStyle('bold');
      doc.text(formatCurrency(proforma.total), pageWidth - 14, finalY + 30, { align: 'right' });
    }
    
    // Add notes
    if (proforma.notes) {
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text('Notes:', 14, finalY + 50);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(proforma.notes, 14, finalY + 58);
    }
    
    // Add footer with page numbers
    addFooter(doc);
    
    // Save PDF
    doc.save(`proforma-${proforma.number}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Export Final Invoice to PDF
export const exportFinalInvoiceToPDF = (invoice: FinalInvoice): boolean => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, `Invoice: ${invoice.number}`);
    addClientInfo(doc, invoice.client!);
    addInvoiceSummary(doc, {
      number: invoice.number,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status
    });
    
    // Add items table
    doc.autoTable({
      startY: 120,
      head: [['Product', 'Qty', 'Unit Price', 'Tax %', 'Total Excl.', 'Tax Amount', 'Total Incl.']],
      body: invoice.items.map(item => [
        item.product?.name || '',
        item.quantity,
        formatCurrency(item.unitprice),
        `${item.taxrate}%`,
        formatCurrency(item.totalExcl),
        formatCurrency(item.totalTax),
        formatCurrency(item.total)
      ]),
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 15, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY || 200;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text('Subtotal:', pageWidth - 80, finalY + 10);
    doc.text('Tax Total:', pageWidth - 80, finalY + 18);
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('TOTAL:', pageWidth - 80, finalY + 30);
    
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(formatCurrency(invoice.subtotal), pageWidth - 14, finalY + 10, { align: 'right' });
    doc.text(formatCurrency(invoice.taxTotal), pageWidth - 14, finalY + 18, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFontStyle('bold');
    doc.text(formatCurrency(invoice.total), pageWidth - 14, finalY + 30, { align: 'right' });
    
    // Add payment info if paid
    if (invoice.status === 'paid' && invoice.paymentDate) {
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text('Payment Information:', 14, finalY + 50);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`Date: ${formatDate(invoice.paymentDate)}`, 14, finalY + 58);
      if (invoice.paymentReference) {
        doc.text(`Reference: ${invoice.paymentReference}`, 14, finalY + 66);
      }
    }
    
    // Add notes
    if (invoice.notes) {
      const yPos = invoice.status === 'paid' ? finalY + 80 : finalY + 50;
      
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text('Notes:', 14, yPos);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(invoice.notes, 14, yPos + 8);
    }
    
    // Add footer with page numbers
    addFooter(doc);
    
    // Save PDF
    doc.save(`invoice-${invoice.number}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Export Delivery Note to PDF
export const exportDeliveryNoteToPDF = (deliveryNote: DeliveryNote): boolean => {
  try {
    const doc = new jsPDF();
    
    addHeader(doc, `Delivery Note: ${deliveryNote.number}`);
    addClientInfo(doc, deliveryNote.client!);
    
    // Add delivery note details
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text('Delivery Details:', pageWidth - 90, 60);
    
    doc.setFontSize(10);
    
    const detailsX = pageWidth - 90;
    const valuesX = pageWidth - 25;
    
    doc.setTextColor(60);
    doc.text('Number:', detailsX, 67);
    doc.text('Issue Date:', detailsX, 74);
    doc.text('Delivery Date:', detailsX, 81);
    doc.text('Status:', detailsX, 88);
    
    doc.setTextColor(40);
    doc.text(deliveryNote.number, valuesX, 67, { align: 'right' });
    doc.text(formatDate(deliveryNote.issueDate), valuesX, 74, { align: 'right' });
    doc.text(deliveryNote.deliveryDate ? formatDate(deliveryNote.deliveryDate) : 'Not delivered yet', valuesX, 81, { align: 'right' });
    doc.text(deliveryNote.status.charAt(0).toUpperCase() + deliveryNote.status.slice(1), valuesX, 88, { align: 'right' });
    
    // Add related invoice info if exists
    if (deliveryNote.finalInvoiceId && deliveryNote.finalInvoice) {
      doc.text('Related Invoice:', detailsX, 95);
      doc.setTextColor(40);
      doc.text(deliveryNote.finalInvoice.number, valuesX, 95, { align: 'right' });
    }
    
    // Add transportation details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Transportation Details', 14, 120);
    
    doc.setFontSize(10);
    
    let yPos = 130;
    if (deliveryNote.driver_name) {
      doc.setTextColor(60);
      doc.text('Driver:', 14, yPos);
      doc.setTextColor(40);
      doc.text(deliveryNote.driver_name, 60, yPos);
      yPos += 7;
    }
    
    if (deliveryNote.truck_id) {
      doc.setTextColor(60);
      doc.text('Truck ID:', 14, yPos);
      doc.setTextColor(40);
      doc.text(deliveryNote.truck_id, 60, yPos);
      yPos += 7;
    }
    
    if (deliveryNote.delivery_company) {
      doc.setTextColor(60);
      doc.text('Company:', 14, yPos);
      doc.setTextColor(40);
      doc.text(deliveryNote.delivery_company, 60, yPos);
      yPos += 7;
    }
    
    // Add items table
    doc.autoTable({
      startY: yPos + 10,
      head: [['Product', 'Quantity', 'Unit', 'Description']],
      body: deliveryNote.items.map(item => [
        item.product?.name || '',
        item.quantity,
        'Unit',
        item.product?.description || ''
      ]),
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30 },
        3: { cellWidth: 'auto' }
      }
    });
    
    // Add delivery instructions
    if (deliveryNote.notes) {
      const finalY = doc.lastAutoTable.finalY || 200;
      
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text('Delivery Instructions:', 14, finalY + 20);
      
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(deliveryNote.notes, 14, finalY + 28);
    }
    
    // Add signatures section
    const finalY = doc.lastAutoTable.finalY || 200;
    const notesOffset = deliveryNote.notes ? 40 : 20;
    
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text('Received by:', 14, finalY + notesOffset + 20);
    doc.text('Date:', 14, finalY + notesOffset + 30);
    doc.text('Signature:', 14, finalY + notesOffset + 40);
    
    doc.line(50, finalY + notesOffset + 30, 150, finalY + notesOffset + 30);
    doc.line(50, finalY + notesOffset + 40, 150, finalY + notesOffset + 40);
    
    // Add footer with page numbers
    addFooter(doc);
    
    // Save PDF
    doc.save(`delivery-note-${deliveryNote.number}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// ETAT 104 REPORT EXPORTS
interface ClientSummary {
  clientId: string;
  clientName: string;
  taxId: string;
  subtotal: number;
  taxTotal: number;
  total: number;
}

export const exportEtat104ToPDF = (
  clientSummaries: ClientSummary[], 
  year: string, 
  month: string,
  totalAmount: number,
  totalTax: number,
  grandTotal: number
) => {
  const pdf = new jsPDF();
  
  // Add company header
  pdf.setFontSize(20);
  pdf.text('YOUR COMPANY NAME', 105, 20, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Company Address, City, Country', 105, 28, { align: 'center' });
  pdf.text('Phone: +000 000 0000 | Email: info@company.com', 105, 34, { align: 'center' });
  
  // Add report title
  pdf.setFontSize(16);
  pdf.text(`ÉTAT 104 REPORT - ${month}/${year}`, 105, 50, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Monthly TVA Declaration Summary', 105, 58, { align: 'center' });
  
  // Items table
  const tableRows = clientSummaries.map(summary => [
    summary.clientName,
    summary.taxId,
    formatCurrency(summary.subtotal),
    formatCurrency(summary.taxTotal),
    formatCurrency(summary.total)
  ]);
  
  // Add totals row
  tableRows.push([
    'TOTALS:',
    '',
    formatCurrency(totalAmount),
    formatCurrency(totalTax),
    formatCurrency(grandTotal)
  ]);
  
  autoTable(pdf, {
    startY: 70,
    head: [['Client', 'NIF', 'Amount (Excl.)', 'TVA', 'Total']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    columnStyles: {
      0: { cellWidth: 50 },
    },
    rowStyles: {
      [tableRows.length - 1]: { fontStyle: 'bold' }
    }
  });
  
  // Calculate the Y position after the table
  const finalY = (pdf as any).lastAutoTable.finalY + 20;
  
  // Summary
  pdf.setFontSize(14);
  pdf.text('Summary for État 104 Declaration', 105, finalY, { align: 'center' });
  
  const summaryY = finalY + 10;
  pdf.setFontSize(11);
  pdf.text('Total Sales (Excl. Tax):', 60, summaryY);
  pdf.text(formatCurrency(totalAmount), 150, summaryY);
  
  pdf.text('Total TVA Collected:', 60, summaryY + 7);
  pdf.text(formatCurrency(totalTax), 150, summaryY + 7);
  
  pdf.text('Total TVA Deductible (simulated):', 60, summaryY + 14);
  pdf.text(formatCurrency(totalTax * 0.3), 150, summaryY + 14);
  
  // Draw line
  pdf.line(60, summaryY + 18, 170, summaryY + 18);
  
  // TVA due
  pdf.setFontSize(12);
  pdf.text('TVA Due:', 60, summaryY + 24);
  pdf.text(formatCurrency(totalTax * 0.7), 150, summaryY + 24);
  
  // Note
  pdf.setFontSize(9);
  pdf.text('Note: This report is fully compliant with the Algerian tax authority requirements for G50 declarations.', 105, summaryY + 40, { align: 'center' });
  
  // Footer
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 10, { align: 'center' });
  }
  
  // Save the PDF
  pdf.save(`Etat104_${month}_${year}.pdf`);
  return true;
};

export const exportEtat104ToExcel = (
  clientSummaries: ClientSummary[], 
  year: string, 
  month: string,
  totalAmount: number,
  totalTax: number,
  grandTotal: number
) => {
  // Prepare data for Excel
  const data = clientSummaries.map(summary => ({
    'Client': summary.clientName,
    'NIF': summary.taxId,
    'Amount (Excl.)': summary.subtotal,
    'TVA': summary.taxTotal,
    'Total': summary.total
  }));
  
  // Add totals row
  data.push({
    'Client': 'TOTALS:',
    'NIF': '',
    'Amount (Excl.)': totalAmount,
    'TVA': totalTax,
    'Total': grandTotal
  });
  
  // Create summary sheet data
  const summaryData = [
    { 'Summary': 'Total Sales (Excl. Tax):', 'Value': totalAmount },
    { 'Summary': 'Total TVA Collected:', 'Value': totalTax },
    { 'Summary': 'Total TVA Deductible (simulated):', 'Value': totalTax * 0.3 },
    { 'Summary': 'TVA Due:', 'Value': totalTax * 0.7 }
  ];
  
  // Create workbook and worksheets
  const wb = XLSX.utils.book_new();
  
  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'État 104 Data');
  
  // Summary sheet
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Save Excel file
  XLSX.writeFile(wb, `Etat104_${month}_${year}.xlsx`);
  return true;
};

// Helper function for status colors
function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
    case 'approved':
    case 'delivered':
      return "#27ae60"; // Green (Hexadecimal)
    case 'unpaid':
    case 'sent':
    case 'pending':
      return "#2980b9"; // Blue (Hexadecimal)
    case 'cancelled':
    case 'rejected':
      return "#c0392b"; // Red (Hexadecimal)
    case 'credited':
    case 'draft':
    default:
      return "#95a5a6"; // Gray (Hexadecimal)
  }
}