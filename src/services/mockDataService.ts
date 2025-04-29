import {
  Client,
  DeliveryNote,
  FinalInvoice,
  InvoiceItem,
  ProformaInvoice,
  Product,
  User,
  UserRole,
  generateId,
  getCurrentDate,
  getFutureDate,
} from '@/types';

// Mock data
const mockClients: Client[] = [
  {
    id: generateId(),
    name: 'Acme Corp',
    address: '123 Main St',
    taxId: '123456789',
    phone: '555-1234',
    email: 'info@acme.com',
    country: 'USA',
    city: 'New York',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    name: 'Beta Co',
    address: '456 Elm St',
    taxId: '987654321',
    phone: '555-5678',
    email: 'sales@beta.com',
    country: 'Canada',
    city: 'Toronto',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    name: 'Gamma Ltd',
    address: '789 Oak St',
    taxId: '456789123',
    phone: '555-9012',
    email: 'support@gamma.com',
    country: 'UK',
    city: 'London',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
];

const mockProducts: Product[] = [
  {
    id: generateId(),
    code: 'A101',
    name: 'Widget',
    description: 'A simple widget',
    unitprice: 10.0,
    taxrate: 0.20,
    stockquantity: 100,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    code: 'B202',
    name: 'Gadget',
    description: 'A complex gadget',
    unitprice: 25.0,
    taxrate: 0.20,
    stockquantity: 50,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    code: 'C303',
    name: 'Thingamajig',
    description: 'A fancy thingamajig',
    unitprice: 50.0,
    taxrate: 0.20,
    stockquantity: 25,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
];

const mockInvoiceItems: InvoiceItem[] = [
  {
    id: generateId(),
    productId: mockProducts[0].id,
    product: mockProducts[0],
    quantity: 2,
    unitprice: mockProducts[0].unitprice,
    taxrate: mockProducts[0].taxrate,
    discount: 0.0,
    totalExcl: 20.0,
    totalTax: 4.0,
    total: 24.0,
  },
  {
    id: generateId(),
    productId: mockProducts[1].id,
    product: mockProducts[1],
    quantity: 1,
    unitprice: mockProducts[1].unitprice,
    taxrate: mockProducts[1].taxrate,
    discount: 0.0,
    totalExcl: 25.0,
    totalTax: 5.0,
    total: 30.0,
  },
];

const mockProformaInvoices: ProformaInvoice[] = [
  {
    id: generateId(),
    number: 'P-0001',
    clientId: mockClients[0].id,
    client: mockClients[0],
    issueDate: getCurrentDate(),
    dueDate: getFutureDate(30),
    items: mockInvoiceItems,
    notes: 'Proforma invoice for Acme Corp',
    subtotal: 45.0,
    taxTotal: 9.0,
    total: 54.0,
    status: 'draft',
    payment_type: 'cheque',
    stamp_tax: 0,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    number: 'P-0002',
    clientId: mockClients[1].id,
    client: mockClients[1],
    issueDate: getCurrentDate(),
    dueDate: getFutureDate(30),
    items: mockInvoiceItems,
    notes: 'Proforma invoice for Beta Co',
    subtotal: 45.0,
    taxTotal: 9.0,
    total: 54.0,
    status: 'sent',
    payment_type: 'cash',
    stamp_tax: 200,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
];

const mockFinalInvoices: FinalInvoice[] = [
  {
    id: generateId(),
    number: 'F-0001',
    clientId: mockClients[0].id,
    client: mockClients[0],
    issueDate: getCurrentDate(),
    dueDate: getFutureDate(30),
    items: mockInvoiceItems,
    notes: 'Final invoice for Acme Corp',
    subtotal: 45.0,
    taxTotal: 9.0,
    total: 54.0,
    status: 'unpaid',
    proformaId: mockProformaInvoices[0].id,
    paymentDate: undefined,
    paymentReference: undefined,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    number: 'F-0002',
    clientId: mockClients[1].id,
    client: mockClients[1],
    issueDate: getCurrentDate(),
    dueDate: getFutureDate(30),
    items: mockInvoiceItems,
    notes: 'Final invoice for Beta Co',
    subtotal: 45.0,
    taxTotal: 9.0,
    total: 54.0,
    status: 'paid',
    proformaId: mockProformaInvoices[1].id,
    paymentDate: getCurrentDate(),
    paymentReference: 'REF123',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
];

const mockDeliveryNotes: DeliveryNote[] = [
  {
    id: generateId(),
    number: 'D-0001',
    finalInvoiceId: mockFinalInvoices[0].id,
    finalInvoice: mockFinalInvoices[0],
    clientId: mockClients[0].id,
    client: mockClients[0],
    issueDate: getCurrentDate(),
    deliveryDate: undefined,
    items: mockInvoiceItems,
    notes: 'Delivery note for Acme Corp',
    status: 'pending',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
    driver_name: 'John Doe',
    truck_id: 'ABC-123',
    delivery_company: 'Speedy Delivery',
  },
  {
    id: generateId(),
    number: 'D-0002',
    finalInvoiceId: mockFinalInvoices[1].id,
    finalInvoice: mockFinalInvoices[1],
    clientId: mockClients[1].id,
    client: mockClients[1],
    issueDate: getCurrentDate(),
    deliveryDate: getCurrentDate(),
    items: mockInvoiceItems,
    notes: 'Delivery note for Beta Co',
    status: 'delivered',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
    driver_name: 'Jane Smith',
    truck_id: 'XYZ-456',
    delivery_company: 'Reliable Transport',
  },
];

const mockUsers: User[] = [
  {
    id: generateId(),
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    active: true,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    email: 'accountant@example.com',
    name: 'Accountant User',
    role: UserRole.ACCOUNTANT,
    active: true,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    email: 'salesperson@example.com',
    name: 'Salesperson User',
    role: UserRole.SALESPERSON,
    active: true,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
  {
    id: generateId(),
    email: 'viewer@example.com',
    name: 'Viewer User',
    role: UserRole.VIEWER,
    active: true,
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  },
];

// Mock data service
export const mockDataService = {
  // Get all clients
  getClients: async (): Promise<Client[]> => {
    const storedClients = localStorage.getItem('clients') || JSON.stringify(mockClients);
    return JSON.parse(storedClients);
  },

  // Get client by ID
  getClientById: async (id: string): Promise<Client | undefined> => {
    const clients = await mockDataService.getClients();
    return clients.find((client) => client.id === id);
  },

  // Create a new client
  createClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const newClient: Client = {
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      ...client,
    };
    const clients = await mockDataService.getClients();
    clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));
    return newClient;
  },

  // Update an existing client
  updateClient: async (id: string, updates: Partial<Client>): Promise<Client> => {
    const clients = await mockDataService.getClients();
    const index = clients.findIndex((client) => client.id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }
    const updatedClient: Client = {
      ...clients[index],
      ...updates,
      updatedAt: getCurrentDate(),
    };
    clients[index] = updatedClient;
    localStorage.setItem('clients', JSON.stringify(clients));
    return updatedClient;
  },

  // Delete a client
  deleteClient: async (id: string): Promise<void> => {
    const clients = await mockDataService.getClients();
    const updatedClients = clients.filter((client) => client.id !== id);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  },

  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const storedProducts = localStorage.getItem('products') || JSON.stringify(mockProducts);
    return JSON.parse(storedProducts);
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product | undefined> => {
    const products = await mockDataService.getProducts();
    return products.find((product) => product.id === id);
  },

  // Create a new product
  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      ...product,
    };
    const products = await mockDataService.getProducts();
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    return newProduct;
  },

  // Update an existing product
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const products = await mockDataService.getProducts();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: getCurrentDate(),
    };
    products[index] = updatedProduct;
    localStorage.setItem('products', JSON.stringify(products));
    return updatedProduct;
  },

  // Delete a product
  deleteProduct: async (id: string): Promise<void> => {
    const products = await mockDataService.getProducts();
    const updatedProducts = products.filter((product) => product.id !== id);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  },

  // Get all proforma invoices
  getProformaInvoices: async (): Promise<ProformaInvoice[]> => {
    const storedInvoices = localStorage.getItem('proformaInvoices') || JSON.stringify(mockProformaInvoices);
    const invoices = JSON.parse(storedInvoices) as ProformaInvoice[];
    
    // Populate client data
    const clients = await mockDataService.getClients();
    invoices.forEach(invoice => {
      invoice.client = clients.find(c => c.id === invoice.clientId);
    });

    // Populate items data
    const products = await mockDataService.getProducts();
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        item.product = products.find(p => p.id === item.productId);
      });
    });

    return invoices;
  },

  // Get proforma invoice by ID
  getProformaInvoiceById: async (id: string): Promise<ProformaInvoice | undefined> => {
    const invoices = await mockDataService.getProformaInvoices();
    return invoices.find((invoice) => invoice.id === id);
  },

  // Create a new proforma invoice
  createProformaInvoice: async (invoice: Omit<ProformaInvoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProformaInvoice> => {
    const newInvoice: ProformaInvoice = {
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      ...invoice,
    };
    const invoices = await mockDataService.getProformaInvoices();
    invoices.push(newInvoice);
    localStorage.setItem('proformaInvoices', JSON.stringify(invoices));
    return newInvoice;
  },

  // Update an existing proforma invoice
  updateProformaInvoice: async (id: string, updates: Partial<ProformaInvoice>): Promise<ProformaInvoice> => {
    const invoices = await mockDataService.getProformaInvoices();
    const index = invoices.findIndex((invoice) => invoice.id === id);
    if (index === -1) {
      throw new Error('Proforma invoice not found');
    }
    const updatedInvoice: ProformaInvoice = {
      ...invoices[index],
      ...updates,
      updatedAt: getCurrentDate(),
    };
    invoices[index] = updatedInvoice;
    localStorage.setItem('proformaInvoices', JSON.stringify(invoices));
    return updatedInvoice;
  },

  // Update proforma invoice status
  updateProformaStatus: async (id: string, status: ProformaInvoice['status']): Promise<ProformaInvoice> => {
    const invoices = await mockDataService.getProformaInvoices();
    const index = invoices.findIndex((invoice) => invoice.id === id);

    if (index === -1) {
      throw new Error('Proforma invoice not found');
    }

    const updatedInvoice: ProformaInvoice = {
      ...invoices[index],
      status: status,
      updatedAt: getCurrentDate(),
    };

    invoices[index] = updatedInvoice;
    localStorage.setItem('proformaInvoices', JSON.stringify(invoices));
    return updatedInvoice;
  },

  // Convert proforma invoice to final invoice
  convertProformaToFinal: async (proformaId: string): Promise<{ proforma: ProformaInvoice | undefined; finalInvoice: FinalInvoice }> => {
    const proformaInvoices = await mockDataService.getProformaInvoices();
    const proformaIndex = proformaInvoices.findIndex((invoice) => invoice.id === proformaId);

    if (proformaIndex === -1) {
      throw new Error('Proforma invoice not found');
    }

    const proforma = proformaInvoices[proformaIndex];

    if (proforma.status !== 'approved') {
      throw new Error('Proforma invoice must be approved before converting to final invoice');
    }

    const newFinalInvoice: FinalInvoice = {
      id: generateId(),
      number: 'F-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      clientId: proforma.clientId,
      client: proforma.client,
      issueDate: getCurrentDate(),
      dueDate: getFutureDate(30),
      items: proforma.items,
      notes: proforma.notes,
      subtotal: proforma.subtotal,
      taxTotal: proforma.taxTotal,
      total: proforma.total,
      status: 'unpaid',
      proformaId: proforma.id,
      paymentDate: undefined,
      paymentReference: undefined,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };

    const finalInvoices = await mockDataService.getFinalInvoices();
    finalInvoices.push(newFinalInvoice);
    localStorage.setItem('finalInvoices', JSON.stringify(finalInvoices));

    const updatedProforma: ProformaInvoice = {
      ...proforma,
      finalInvoiceId: newFinalInvoice.id,
      updatedAt: getCurrentDate(),
    };

    proformaInvoices[proformaIndex] = updatedProforma;
    localStorage.setItem('proformaInvoices', JSON.stringify(proformaInvoices));

    return {
      proforma: updatedProforma,
      finalInvoice: newFinalInvoice,
    };
  },

  // Get all final invoices
  getFinalInvoices: async (): Promise<FinalInvoice[]> => {
    const storedInvoices = localStorage.getItem('finalInvoices') || JSON.stringify(mockFinalInvoices);
    const invoices = JSON.parse(storedInvoices) as FinalInvoice[];

    // Populate client data
    const clients = await mockDataService.getClients();
    invoices.forEach(invoice => {
      invoice.client = clients.find(c => c.id === invoice.clientId);
    });

    // Populate items data
    const products = await mockDataService.getProducts();
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        item.product = products.find(p => p.id === item.productId);
      });
    });

    return invoices;
  },

  // Get final invoice by ID
  getFinalInvoiceById: async (id: string): Promise<FinalInvoice | undefined> => {
    const invoices = await mockDataService.getFinalInvoices();
    return invoices.find((invoice) => invoice.id === id);
  },

  // Update an existing final invoice
  updateFinalInvoice: async (id: string, updates: Partial<FinalInvoice>): Promise<FinalInvoice> => {
    const invoices = await mockDataService.getFinalInvoices();
    const index = invoices.findIndex((invoice) => invoice.id === id);
    if (index === -1) {
      throw new Error('Final invoice not found');
    }
    const updatedInvoice: FinalInvoice = {
      ...invoices[index],
      ...updates,
      updatedAt: getCurrentDate(),
    };
    invoices[index] = updatedInvoice;
    localStorage.setItem('finalInvoices', JSON.stringify(invoices));
    return updatedInvoice;
  },

  // Mark final invoice as paid
  markFinalInvoiceAsPaid: async (id: string): Promise<FinalInvoice> => {
    const invoices = await mockDataService.getFinalInvoices();
    const index = invoices.findIndex((invoice) => invoice.id === id);

    if (index === -1) {
      throw new Error('Final invoice not found');
    }

    const updatedInvoice: FinalInvoice = {
      ...invoices[index],
      status: 'paid',
      paymentDate: getCurrentDate(),
      updatedAt: getCurrentDate(),
    };

    invoices[index] = updatedInvoice;
    localStorage.setItem('finalInvoices', JSON.stringify(invoices));
    return updatedInvoice;
  },

  // Get all delivery notes
  getDeliveryNotes: async (): Promise<DeliveryNote[]> => {
    const storedNotes = localStorage.getItem('deliveryNotes') || JSON.stringify(mockDeliveryNotes);
    const notes = JSON.parse(storedNotes) as DeliveryNote[];

    // Populate client data
    const clients = await mockDataService.getClients();
    notes.forEach(note => {
      note.client = clients.find(c => c.id === note.clientId);
    });

    // Populate final invoice data
    const finalInvoices = await mockDataService.getFinalInvoices();
    notes.forEach(note => {
      note.finalInvoice = finalInvoices.find(f => f.id === note.finalInvoiceId);
    });

    // Populate items data
    const products = await mockDataService.getProducts();
    notes.forEach(note => {
      note.items.forEach(item => {
        item.product = products.find(p => p.id === item.productId);
      });
    });

    return notes;
  },

  // Get delivery note by ID
  getDeliveryNoteById: async (id: string): Promise<DeliveryNote | undefined> => {
    const notes = await mockDataService.getDeliveryNotes();
    return notes.find((note) => note.id === id);
  },

  // Create a new delivery note
  createDeliveryNote: async (note: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeliveryNote> => {
    const newNote: DeliveryNote = {
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      ...note,
    };
    const notes = await mockDataService.getDeliveryNotes();
    notes.push(newNote);
    localStorage.setItem('deliveryNotes', JSON.stringify(notes));
    return newNote;
  },

  // Update an existing delivery note
  updateDeliveryNote: async (id: string, updates: Partial<DeliveryNote>): Promise<DeliveryNote> => {
    const notes = await mockDataService.getDeliveryNotes();
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new Error('Delivery note not found');
    }
    const updatedNote: DeliveryNote = {
      ...notes[index],
      ...updates,
      updatedAt: getCurrentDate(),
    };
    notes[index] = updatedNote;
    localStorage.setItem('deliveryNotes', JSON.stringify(notes));
    return updatedNote;
  },

  // Get all users
  getUsers: async (): Promise<User[]> => {
    const storedUsers = localStorage.getItem('users') || JSON.stringify(mockUsers);
    return JSON.parse(storedUsers);
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User | undefined> => {
    const users = await mockDataService.getUsers();
    return users.find((user) => user.id === id);
  },

  // Create a new user
  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const newUser: User = {
      id: generateId(),
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
      ...user,
    };
    const users = await mockDataService.getUsers();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  },

  // Update an existing user
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const users = await mockDataService.getUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    const updatedUser: User = {
      ...users[index],
      ...updates,
      updatedAt: getCurrentDate(),
    };
    users[index] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    return updatedUser;
  },

  // Delete a user
  deleteUser: async (id: string): Promise<void> => {
    const users = await mockDataService.getUsers();
    const updatedUsers = users.filter((user) => user.id !== id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  },
  // Mark a delivery note as delivered
  markDeliveryNoteAsDelivered: async (id) => {
    try {
      const notes = await getDeliveryNotes();
      const index = notes.findIndex(note => note.id === id);
      
      if (index === -1) {
        throw new Error('Delivery note not found');
      }
      
      const updatedNote = {
        ...notes[index],
        status: 'delivered',
        deliveryDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };
      
      notes[index] = updatedNote;
      localStorage.setItem('deliveryNotes', JSON.stringify(notes));
      
      return updatedNote;
    } catch (error) {
      console.error('Error marking delivery note as delivered:', error);
      throw error;
    }
  },
  
  // Delete a proforma invoice
  deleteProformaInvoice: async (id) => {
    try {
      const proformaInvoices = await getProformaInvoices();
      const filteredInvoices = proformaInvoices.filter(invoice => invoice.id !== id);
      
      if (filteredInvoices.length === proformaInvoices.length) {
        throw new Error('Proforma invoice not found');
      }
      
      localStorage.setItem('proformaInvoices', JSON.stringify(filteredInvoices));
      return { success: true };
    } catch (error) {
      console.error('Error deleting proforma invoice:', error);
      throw error;
    }
  },
  
  // Undo proforma approval (set back to 'sent' status)
  undoProformaApproval: async (id) => {
    try {
      const proformaInvoices = await getProformaInvoices();
      const index = proformaInvoices.findIndex(invoice => invoice.id === id);
      
      if (index === -1) {
        throw new Error('Proforma invoice not found');
      }
      
      if (proformaInvoices[index].status !== 'approved') {
        throw new Error('Cannot undo approval: proforma is not in approved status');
      }
      
      const updatedInvoice = {
        ...proformaInvoices[index],
        status: 'sent',
        updatedAt: new Date().toISOString()
      };
      
      proformaInvoices[index] = updatedInvoice;
      localStorage.setItem('proformaInvoices', JSON.stringify(proformaInvoices));
      
      return updatedInvoice;
    } catch (error) {
      console.error('Error undoing proforma approval:', error);
      throw error;
    }
  },
  
  // Undo conversion to final invoice
  undoFinalInvoiceConversion: async (proformaId) => {
    try {
      // Get the proforma invoice
      const proformaInvoices = await getProformaInvoices();
      const proformaIndex = proformaInvoices.findIndex(invoice => invoice.id === proformaId);
      
      if (proformaIndex === -1) {
        throw new Error('Proforma invoice not found');
      }
      
      const proforma = proformaInvoices[proformaIndex];
      
      if (!proforma.finalInvoiceId) {
        throw new Error('This proforma has not been converted to a final invoice');
      }
      
      // Get final invoices and remove the one linked to this proforma
      const finalInvoices = await getFinalInvoices();
      const updatedFinalInvoices = finalInvoices.filter(invoice => invoice.id !== proforma.finalInvoiceId);
      
      // Update proforma status and remove finalInvoiceId reference
      const updatedProforma = {
        ...proforma,
        status: 'approved',
        finalInvoiceId: undefined,
        updatedAt: new Date().toISOString()
      };
      
      proformaInvoices[proformaIndex] = updatedProforma;
      
      // Save changes
      localStorage.setItem('proformaInvoices', JSON.stringify(proformaInvoices));
      localStorage.setItem('finalInvoices', JSON.stringify(updatedFinalInvoices));
      
      return { 
        success: true, 
        proforma: updatedProforma 
      };
    } catch (error) {
      console.error('Error undoing conversion to final invoice:', error);
      throw error;
    }
  },
};

// Helper functions
async function getProformaInvoices() {
  const storedInvoices = localStorage.getItem('proformaInvoices') || '[]';
  return JSON.parse(storedInvoices);
}

async function getFinalInvoices() {
  const storedInvoices = localStorage.getItem('finalInvoices') || '[]';
  return JSON.parse(storedInvoices);
}

async function getDeliveryNotes() {
  const storedNotes = localStorage.getItem('deliveryNotes') || '[]';
  return JSON.parse(storedNotes);
}
