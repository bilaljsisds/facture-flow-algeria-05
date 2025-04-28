// Base types for our domain models

export interface Client {
  id: string;
  name: string;
  address: string;
  taxId: string; // NIF (tax ID)
  phone: string;
  email: string;
  country: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  unitprice: number;
  taxrate: number; // TVA rate
  stockquantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitprice: number;
  taxrate: number;
  discount: number;
  totalExcl: number;
  totalTax: number;
  total: number;
}

export interface BaseInvoice {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProformaInvoice extends BaseInvoice {
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  finalInvoiceId?: string; // If approved and converted to final invoice
}

export interface FinalInvoice extends BaseInvoice {
  status: 'unpaid' | 'paid' | 'cancelled' | 'credited';
  proformaId?: string; // Reference to the source proforma invoice
  paymentDate?: string;
  paymentReference?: string;
}

export interface DeliveryNote {
  id: string;
  number: string;
  finalInvoiceId: string;
  finalInvoice?: FinalInvoice;
  clientId: string;
  client?: Client;
  issueDate: string;
  deliveryDate?: string;
  items: InvoiceItem[];
  notes: string;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  SALESPERSON = 'salesperson',
  VIEWER = 'viewer',
}

// Mock data generators
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};
