
import { 
  Client, 
  Product, 
  ProformaInvoice, 
  FinalInvoice, 
  DeliveryNote,
  InvoiceItem,
  generateId,
  getCurrentDate,
  getFutureDate
} from '@/types';

// Mock clients data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Algiers Electronics',
    address: '123 Boulevard des Martyrs, Algiers',
    taxId: '123456789012345',
    phone: '+213 21 12 34 56',
    email: 'contact@algierselectronics.dz',
    country: 'Algeria',
    city: 'Algiers',
    createdAt: '2023-01-15',
    updatedAt: '2023-01-15'
  },
  {
    id: '2',
    name: 'Oran Supplies Co.',
    address: '45 Rue Larbi Ben M\'Hidi, Oran',
    taxId: '234567890123456',
    phone: '+213 41 23 45 67',
    email: 'info@oransupplies.dz',
    country: 'Algeria',
    city: 'Oran',
    createdAt: '2023-01-20',
    updatedAt: '2023-01-20'
  },
  {
    id: '3',
    name: 'Constantine Traders',
    address: '78 Avenue de l\'Independance, Constantine',
    taxId: '345678901234567',
    phone: '+213 31 34 56 78',
    email: 'sales@constantinetraders.dz',
    country: 'Algeria',
    city: 'Constantine',
    createdAt: '2023-02-05',
    updatedAt: '2023-02-05'
  },
  {
    id: '4',
    name: 'Annaba Distributors',
    address: '12 Rue des Frères Bouadou, Annaba',
    taxId: '456789012345678',
    phone: '+213 38 45 67 89',
    email: 'info@annabadist.dz',
    country: 'Algeria',
    city: 'Annaba',
    createdAt: '2023-02-15',
    updatedAt: '2023-02-15'
  },
  {
    id: '5',
    name: 'Setif Industries',
    address: '34 Boulevard de l\'ALN, Sétif',
    taxId: '567890123456789',
    phone: '+213 36 56 78 90',
    email: 'contact@setifindustries.dz',
    country: 'Algeria',
    city: 'Setif',
    createdAt: '2023-03-01',
    updatedAt: '2023-03-01'
  }
];

// Mock products data
export const mockProducts: Product[] = [
  {
    id: '1',
    code: 'P001',
    name: 'Laptop Dell XPS 15',
    description: 'High-performance laptop with 16GB RAM, 512GB SSD',
    unitPrice: 195000,
    taxRate: 19,
    stockQuantity: 25,
    createdAt: '2023-01-10',
    updatedAt: '2023-01-10'
  },
  {
    id: '2',
    code: 'P002',
    name: 'Smartphone Samsung Galaxy S21',
    description: '256GB storage, 8GB RAM, 5G capable',
    unitPrice: 110000,
    taxRate: 19,
    stockQuantity: 42,
    createdAt: '2023-01-12',
    updatedAt: '2023-01-12'
  },
  {
    id: '3',
    code: 'P003',
    name: 'Office Desk Chair',
    description: 'Ergonomic office chair with adjustable height',
    unitPrice: 18500,
    taxRate: 9,
    stockQuantity: 15,
    createdAt: '2023-01-15',
    updatedAt: '2023-01-15'
  },
  {
    id: '4',
    code: 'P004',
    name: 'LED Monitor 27"',
    description: '27-inch 4K monitor with HDMI and Display Port',
    unitPrice: 45000,
    taxRate: 19,
    stockQuantity: 30,
    createdAt: '2023-01-18',
    updatedAt: '2023-01-18'
  },
  {
    id: '5',
    code: 'P005',
    name: 'Wireless Keyboard and Mouse',
    description: 'Bluetooth keyboard and mouse combo',
    unitPrice: 8500,
    taxRate: 19,
    stockQuantity: 50,
    createdAt: '2023-01-20',
    updatedAt: '2023-01-20'
  },
  {
    id: '6',
    code: 'P006',
    name: 'External Hard Drive 2TB',
    description: 'Portable USB 3.0 external hard drive',
    unitPrice: 15000,
    taxRate: 19,
    stockQuantity: 35,
    createdAt: '2023-01-22',
    updatedAt: '2023-01-22'
  }
];

// Generate mock invoice items
const generateInvoiceItems = (productIds: string[]): InvoiceItem[] => {
  return productIds.map(productId => {
    const product = mockProducts.find(p => p.id === productId)!;
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = product.unitPrice;
    const taxRate = product.taxRate;
    const discount = 0;
    const totalExcl = quantity * unitPrice;
    const totalTax = totalExcl * (taxRate / 100);
    const total = totalExcl + totalTax;
    
    return {
      id: generateId(),
      productId,
      product,
      quantity,
      unitPrice,
      taxRate,
      discount,
      totalExcl,
      totalTax,
      total
    };
  });
};

// Calculate invoice totals
const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalExcl, 0);
  const taxTotal = items.reduce((sum, item) => sum + item.totalTax, 0);
  const total = subtotal + taxTotal;
  
  return { subtotal, taxTotal, total };
};

// Generate mock proforma invoices
export const generateMockProformaInvoices = (): ProformaInvoice[] => {
  const proformas: ProformaInvoice[] = [];
  
  for (let i = 1; i <= 18; i++) {
    const clientId = mockClients[i % mockClients.length].id;
    const client = mockClients.find(c => c.id === clientId);
    const productIds = mockProducts
      .slice(0, (i % 3) + 2)
      .map(product => product.id);
    
    const items = generateInvoiceItems(productIds);
    const { subtotal, taxTotal, total } = calculateInvoiceTotals(items);
    
    const status = i % 4 === 0 ? 'approved' : i % 3 === 0 ? 'rejected' : i % 2 === 0 ? 'sent' : 'draft';
    const finalInvoiceId = status === 'approved' ? `${i}` : undefined;
    
    proformas.push({
      id: `${i}`,
      number: `P-2023-${String(i).padStart(4, '0')}`,
      clientId,
      client,
      issueDate: getCurrentDate(),
      dueDate: getFutureDate(15),
      items,
      notes: 'This is a proforma invoice for your consideration.',
      subtotal,
      taxTotal,
      total,
      status: status as any,
      finalInvoiceId,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    });
  }
  
  return proformas;
};

// Generate mock final invoices
export const generateMockFinalInvoices = (): FinalInvoice[] => {
  const invoices: FinalInvoice[] = [];
  
  for (let i = 1; i <= 24; i++) {
    const clientId = mockClients[i % mockClients.length].id;
    const client = mockClients.find(c => c.id === clientId);
    const productIds = mockProducts
      .slice(0, (i % 4) + 1)
      .map(product => product.id);
    
    const items = generateInvoiceItems(productIds);
    const { subtotal, taxTotal, total } = calculateInvoiceTotals(items);
    
    const status = i % 3 === 0 ? 'paid' : 'unpaid';
    const proformaId = i <= 18 && i % 4 === 0 ? `${i}` : undefined;
    const paymentDate = status === 'paid' ? getFutureDate(-(Math.floor(Math.random() * 10))) : undefined;
    
    invoices.push({
      id: `${i}`,
      number: `F-2023-${String(i).padStart(4, '0')}`,
      clientId,
      client,
      issueDate: getCurrentDate(),
      dueDate: getFutureDate(30),
      items,
      notes: 'Thank you for your business.',
      subtotal,
      taxTotal,
      total,
      status: status as any,
      proformaId,
      paymentDate,
      paymentReference: paymentDate ? `PAY-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` : undefined,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    });
  }
  
  return invoices;
};

// Generate mock delivery notes
export const generateMockDeliveryNotes = (): DeliveryNote[] => {
  const deliveryNotes: DeliveryNote[] = [];
  
  for (let i = 1; i <= 19; i++) {
    const finalInvoiceId = `${i + 5}`;
    const finalInvoice = generateMockFinalInvoices().find(fi => fi.id === finalInvoiceId);
    const clientId = finalInvoice ? finalInvoice.clientId : mockClients[i % mockClients.length].id;
    const client = mockClients.find(c => c.id === clientId);
    const items = finalInvoice ? finalInvoice.items : generateInvoiceItems(mockProducts.slice(0, 2).map(p => p.id));
    
    const status = i % 3 === 0 ? 'delivered' : i % 2 === 0 ? 'pending' : 'pending';
    const deliveryDate = status === 'delivered' ? getFutureDate(-(Math.floor(Math.random() * 5))) : undefined;
    
    deliveryNotes.push({
      id: `${i}`,
      number: `D-2023-${String(i).padStart(4, '0')}`,
      finalInvoiceId,
      clientId,
      client,
      issueDate: getCurrentDate(),
      deliveryDate,
      items,
      notes: 'Please check all items upon delivery.',
      status: status as any,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    });
  }
  
  return deliveryNotes;
};

// Mock data service functions
export const mockDataService = {
  // Client services
  getClients: () => Promise.resolve(mockClients),
  getClientById: (id: string) => Promise.resolve(mockClients.find(client => client.id === id) || null),
  createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      id: generateId(),
      ...client,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    mockClients.push(newClient);
    return Promise.resolve(newClient);
  },
  updateClient: (id: string, client: Partial<Client>) => {
    const index = mockClients.findIndex(c => c.id === id);
    if (index !== -1) {
      mockClients[index] = { ...mockClients[index], ...client, updatedAt: getCurrentDate() };
      return Promise.resolve(mockClients[index]);
    }
    return Promise.reject(new Error('Client not found'));
  },
  deleteClient: (id: string) => {
    const index = mockClients.findIndex(c => c.id === id);
    if (index !== -1) {
      mockClients.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.reject(new Error('Client not found'));
  },
  
  // Product services
  getProducts: () => Promise.resolve(mockProducts),
  getProductById: (id: string) => Promise.resolve(mockProducts.find(product => product.id === id) || null),
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      id: generateId(),
      ...product,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate()
    };
    mockProducts.push(newProduct);
    return Promise.resolve(newProduct);
  },
  updateProduct: (id: string, product: Partial<Product>) => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...product, updatedAt: getCurrentDate() };
      return Promise.resolve(mockProducts[index]);
    }
    return Promise.reject(new Error('Product not found'));
  },
  deleteProduct: (id: string) => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.reject(new Error('Product not found'));
  },
  
  // Invoice services - implement as needed
  getProformaInvoices: () => Promise.resolve(generateMockProformaInvoices()),
  getFinalInvoices: () => Promise.resolve(generateMockFinalInvoices()),
  getDeliveryNotes: () => Promise.resolve(generateMockDeliveryNotes()),
  
  // Add additional methods as needed for your application
};
