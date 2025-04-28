
import { supabase } from '@/integrations/supabase/client';
import { 
  Client, 
  Product, 
  ProformaInvoice, 
  FinalInvoice, 
  DeliveryNote, 
  generateId 
} from '@/types';

// Real database implementation using Supabase
export const mockDataService = {
  // Clients
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
    
    return data.map(client => ({
      id: client.id,
      name: client.name,
      address: client.address,
      taxId: client.taxid,
      phone: client.phone,
      email: client.email,
      country: client.country,
      city: client.city,
      createdAt: client.createdat || new Date().toISOString(),
      updatedAt: client.updatedat || new Date().toISOString()
    }));
  },
  
  getClientById: async (id: string): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      taxId: data.taxid,
      phone: data.phone,
      email: data.email,
      country: data.country,
      city: data.city,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  },
  
  createClient: async (client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        address: client.address,
        taxid: client.taxId,
        phone: client.phone,
        email: client.email,
        country: client.country,
        city: client.city
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      taxId: data.taxid,
      phone: data.phone,
      email: data.email,
      country: data.country,
      city: data.city,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  },
  
  updateClient: async (id: string, client: Partial<Client>): Promise<Client> => {
    const updateData: any = {};
    if (client.name) updateData.name = client.name;
    if (client.address) updateData.address = client.address;
    if (client.taxId) updateData.taxid = client.taxId;
    if (client.phone) updateData.phone = client.phone;
    if (client.email) updateData.email = client.email;
    if (client.country) updateData.country = client.country;
    if (client.city) updateData.city = client.city;
    
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      taxId: data.taxid,
      phone: data.phone,
      email: data.email,
      country: data.country,
      city: data.city,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  },
  
  // Products
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return data.map(product => ({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      unitPrice: product.unitprice,
      taxRate: product.taxrate,
      stockQuantity: product.stockquantity,
      createdAt: product.createdat || new Date().toISOString(),
      updatedAt: product.updatedat || new Date().toISOString()
    }));
  },
  
  getProductById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      unitPrice: data.unitprice,
      taxRate: data.taxrate,
      stockQuantity: data.stockquantity,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  },
  
  createProduct: async (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        code: product.code,
        name: product.name,
        description: product.description,
        unitprice: product.unitPrice,
        taxrate: product.taxRate,
        stockquantity: product.stockQuantity
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      unitPrice: data.unitprice,
      taxRate: data.taxrate,
      stockQuantity: data.stockquantity,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  },
  
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const updateData: any = {};
    if (product.code !== undefined) updateData.code = product.code;
    if (product.name !== undefined) updateData.name = product.name;
    if (product.description !== undefined) updateData.description = product.description;
    if (product.unitPrice !== undefined) updateData.unitprice = product.unitPrice;
    if (product.taxRate !== undefined) updateData.taxrate = product.taxRate;
    if (product.stockQuantity !== undefined) updateData.stockquantity = product.stockQuantity;
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      unitPrice: data.unitprice,
      taxRate: data.taxrate,
      stockQuantity: data.stockquantity,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  },
  
  // Proforma Invoices
  getProformaInvoices: async (): Promise<ProformaInvoice[]> => {
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('proforma_invoices')
      .select('*, clients(*)');
    
    if (invoicesError) {
      console.error('Error fetching proforma invoices:', invoicesError);
      throw invoicesError;
    }
    
    const proformas: ProformaInvoice[] = [];
    
    for (const invoice of invoicesData) {
      // Get items for this invoice
      const { data: itemsJoinData, error: itemsJoinError } = await supabase
        .from('proforma_invoice_items')
        .select('*, invoice_items(*)')
        .eq('proformainvoiceid', invoice.id);
      
      if (itemsJoinError) {
        console.error(`Error fetching items for proforma invoice ${invoice.id}:`, itemsJoinError);
        continue;
      }
      
      const items = await Promise.all(itemsJoinData.map(async (joinItem) => {
        const item = joinItem.invoice_items;
        let product = null;
        
        if (item.productid) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.productid)
            .single();
          
          if (!productError) {
            product = {
              id: productData.id,
              code: productData.code,
              name: productData.name,
              description: productData.description,
              unitPrice: productData.unitprice,
              taxRate: productData.taxrate,
              stockQuantity: productData.stockquantity,
              createdAt: productData.createdat || new Date().toISOString(),
              updatedAt: productData.updatedat || new Date().toISOString()
            };
          }
        }
        
        return {
          id: item.id,
          productId: item.productid,
          product: product,
          quantity: item.quantity,
          unitPrice: item.unitprice,
          taxRate: item.taxrate,
          discount: item.discount,
          totalExcl: item.totalexcl,
          totalTax: item.totaltax,
          total: item.total
        };
      }));
      
      const client = invoice.clients ? {
        id: invoice.clients.id,
        name: invoice.clients.name,
        address: invoice.clients.address,
        taxId: invoice.clients.taxid,
        phone: invoice.clients.phone,
        email: invoice.clients.email,
        country: invoice.clients.country,
        city: invoice.clients.city,
        createdAt: invoice.clients.createdat || new Date().toISOString(),
        updatedAt: invoice.clients.updatedat || new Date().toISOString()
      } : undefined;
      
      proformas.push({
        id: invoice.id,
        number: invoice.number,
        clientId: invoice.clientid,
        client,
        issueDate: invoice.issuedate,
        dueDate: invoice.duedate,
        items,
        notes: invoice.notes || '',
        subtotal: invoice.subtotal,
        taxTotal: invoice.taxtotal,
        total: invoice.total,
        status: invoice.status as 'draft' | 'sent' | 'approved' | 'rejected',
        finalInvoiceId: invoice.finalinvoiceid,
        createdAt: invoice.createdat || new Date().toISOString(),
        updatedAt: invoice.updatedat || new Date().toISOString()
      });
    }
    
    return proformas;
  },
  
  getProformaInvoiceById: async (id: string): Promise<ProformaInvoice> => {
    const { data: invoice, error: invoiceError } = await supabase
      .from('proforma_invoices')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    if (invoiceError) {
      console.error(`Error fetching proforma invoice ${id}:`, invoiceError);
      throw invoiceError;
    }
    
    // Get items for this invoice
    const { data: itemsJoinData, error: itemsJoinError } = await supabase
      .from('proforma_invoice_items')
      .select('*, invoice_items(*)')
      .eq('proformainvoiceid', invoice.id);
    
    if (itemsJoinError) {
      console.error(`Error fetching items for proforma invoice ${id}:`, itemsJoinError);
      throw itemsJoinError;
    }
    
    const items = await Promise.all(itemsJoinData.map(async (joinItem) => {
      const item = joinItem.invoice_items;
      let product = null;
      
      if (item.productid) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productid)
          .single();
        
        if (!productError) {
          product = {
            id: productData.id,
            code: productData.code,
            name: productData.name,
            description: productData.description,
            unitPrice: productData.unitprice,
            taxRate: productData.taxrate,
            stockQuantity: productData.stockquantity,
            createdAt: productData.createdat || new Date().toISOString(),
            updatedAt: productData.updatedat || new Date().toISOString()
          };
        }
      }
      
      return {
        id: item.id,
        productId: item.productid,
        product,
        quantity: item.quantity,
        unitPrice: item.unitprice,
        taxRate: item.taxrate,
        discount: item.discount,
        totalExcl: item.totalexcl,
        totalTax: item.totaltax,
        total: item.total
      };
    }));
    
    const client = invoice.clients ? {
      id: invoice.clients.id,
      name: invoice.clients.name,
      address: invoice.clients.address,
      taxId: invoice.clients.taxid,
      phone: invoice.clients.phone,
      email: invoice.clients.email,
      country: invoice.clients.country,
      city: invoice.clients.city,
      createdAt: invoice.clients.createdat || new Date().toISOString(),
      updatedAt: invoice.clients.updatedat || new Date().toISOString()
    } : undefined;
    
    return {
      id: invoice.id,
      number: invoice.number,
      clientId: invoice.clientid,
      client,
      issueDate: invoice.issuedate,
      dueDate: invoice.duedate,
      items,
      notes: invoice.notes || '',
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxtotal,
      total: invoice.total,
      status: invoice.status as 'draft' | 'sent' | 'approved' | 'rejected',
      finalInvoiceId: invoice.finalinvoiceid,
      createdAt: invoice.createdat || new Date().toISOString(),
      updatedAt: invoice.updatedat || new Date().toISOString()
    };
  },
  
  createProformaInvoice: async (proforma: any): Promise<ProformaInvoice> => {
    try {
      // Start a transaction
      const { error: startError } = await supabase.rpc('begin_transaction');
      if (startError) throw startError;
      
      try {
        // Generate proforma number using database function
        const { data: numberData, error: numberError } = await supabase.rpc('generate_proforma_number');
        if (numberError) throw numberError;
        
        // Create the proforma invoice
        const { data: createdInvoice, error: invoiceError } = await supabase
          .from('proforma_invoices')
          .insert({
            clientid: proforma.clientId,
            number: numberData || proforma.number,
            issuedate: proforma.issueDate,
            duedate: proforma.dueDate,
            notes: proforma.notes || '',
            subtotal: proforma.subtotal,
            taxtotal: proforma.taxTotal,
            total: proforma.total,
            status: proforma.status || 'draft'
          })
          .select()
          .single();
        
        if (invoiceError) throw invoiceError;
        
        // Create invoice items and link them to the proforma
        for (const item of proforma.items) {
          // Create invoice item
          const { data: createdItem, error: itemError } = await supabase
            .from('invoice_items')
            .insert({
              productid: item.productId,
              quantity: item.quantity,
              unitprice: item.unitPrice,
              taxrate: item.taxRate,
              discount: item.discount || 0,
              totalexcl: item.totalExcl,
              totaltax: item.totalTax,
              total: item.total
            })
            .select()
            .single();
          
          if (itemError) throw itemError;
          
          // Link item to proforma
          const { error: linkError } = await supabase
            .from('proforma_invoice_items')
            .insert({
              proformainvoiceid: createdInvoice.id,
              itemid: createdItem.id
            });
          
          if (linkError) throw linkError;
        }
        
        // Commit the transaction
        const { error: commitError } = await supabase.rpc('commit_transaction');
        if (commitError) throw commitError;
        
        // Return the created proforma with full data
        return await mockDataService.getProformaInvoiceById(createdInvoice.id);
        
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      console.error('Error creating proforma invoice:', error);
      throw error;
    }
  },
  
  updateProformaStatus: async (id: string, status: 'draft' | 'sent' | 'approved' | 'rejected'): Promise<ProformaInvoice> => {
    const { error } = await supabase
      .from('proforma_invoices')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating proforma invoice status ${id}:`, error);
      throw error;
    }
    
    return mockDataService.getProformaInvoiceById(id);
  },
  
  convertProformaToFinal: async (proformaId: string): Promise<{ proforma: ProformaInvoice, finalInvoice: FinalInvoice }> => {
    try {
      // Start a transaction
      const { error: startError } = await supabase.rpc('begin_transaction');
      if (startError) throw startError;
      
      try {
        // Get the proforma invoice
        const proforma = await mockDataService.getProformaInvoiceById(proformaId);
        
        // Generate invoice number using database function
        const { data: numberData, error: numberError } = await supabase.rpc('generate_invoice_number');
        if (numberError) throw numberError;
        
        // Create the final invoice
        const { data: createdInvoice, error: invoiceError } = await supabase
          .from('final_invoices')
          .insert({
            clientid: proforma.clientId,
            proformaid: proformaId,
            number: numberData,
            issuedate: proforma.issueDate,
            duedate: proforma.dueDate,
            notes: proforma.notes,
            subtotal: proforma.subtotal,
            taxtotal: proforma.taxTotal,
            total: proforma.total,
            status: 'unpaid'
          })
          .select()
          .single();
        
        if (invoiceError) throw invoiceError;
        
        // Link items to the final invoice
        for (const item of proforma.items) {
          // Link item to final invoice
          const { error: linkError } = await supabase
            .from('final_invoice_items')
            .insert({
              finalinvoiceid: createdInvoice.id,
              itemid: item.id
            });
          
          if (linkError) throw linkError;
        }
        
        // Update the proforma to point to the final invoice and set status to approved
        const { error: updateError } = await supabase
          .from('proforma_invoices')
          .update({
            finalinvoiceid: createdInvoice.id,
            status: 'approved'
          })
          .eq('id', proformaId);
        
        if (updateError) throw updateError;
        
        // Commit the transaction
        const { error: commitError } = await supabase.rpc('commit_transaction');
        if (commitError) throw commitError;
        
        // Return updated proforma and new final invoice
        const updatedProforma = await mockDataService.getProformaInvoiceById(proformaId);
        const finalInvoice = await mockDataService.getFinalInvoiceById(createdInvoice.id);
        
        return { proforma: updatedProforma, finalInvoice };
        
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      console.error(`Error converting proforma invoice ${proformaId} to final:`, error);
      throw error;
    }
  },
  
  // Final Invoices
  getFinalInvoices: async (): Promise<FinalInvoice[]> => {
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('final_invoices')
      .select('*, clients(*)');
    
    if (invoicesError) {
      console.error('Error fetching final invoices:', invoicesError);
      throw invoicesError;
    }
    
    const finalInvoices: FinalInvoice[] = [];
    
    for (const invoice of invoicesData) {
      // Get items for this invoice
      const { data: itemsJoinData, error: itemsJoinError } = await supabase
        .from('final_invoice_items')
        .select('*, invoice_items(*)')
        .eq('finalinvoiceid', invoice.id);
      
      if (itemsJoinError) {
        console.error(`Error fetching items for final invoice ${invoice.id}:`, itemsJoinError);
        continue;
      }
      
      const items = await Promise.all(itemsJoinData.map(async (joinItem) => {
        const item = joinItem.invoice_items;
        let product = null;
        
        if (item.productid) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.productid)
            .single();
          
          if (!productError) {
            product = {
              id: productData.id,
              code: productData.code,
              name: productData.name,
              description: productData.description,
              unitPrice: productData.unitprice,
              taxRate: productData.taxrate,
              stockQuantity: productData.stockquantity,
              createdAt: productData.createdat || new Date().toISOString(),
              updatedAt: productData.updatedat || new Date().toISOString()
            };
          }
        }
        
        return {
          id: item.id,
          productId: item.productid,
          product,
          quantity: item.quantity,
          unitPrice: item.unitprice,
          taxRate: item.taxrate,
          discount: item.discount,
          totalExcl: item.totalexcl,
          totalTax: item.totaltax,
          total: item.total
        };
      }));
      
      const client = invoice.clients ? {
        id: invoice.clients.id,
        name: invoice.clients.name,
        address: invoice.clients.address,
        taxId: invoice.clients.taxid,
        phone: invoice.clients.phone,
        email: invoice.clients.email,
        country: invoice.clients.country,
        city: invoice.clients.city,
        createdAt: invoice.clients.createdat || new Date().toISOString(),
        updatedAt: invoice.clients.updatedat || new Date().toISOString()
      } : undefined;
      
      finalInvoices.push({
        id: invoice.id,
        number: invoice.number,
        clientId: invoice.clientid,
        client,
        issueDate: invoice.issuedate,
        dueDate: invoice.duedate,
        items,
        notes: invoice.notes || '',
        subtotal: invoice.subtotal,
        taxTotal: invoice.taxtotal,
        total: invoice.total,
        status: invoice.status as 'unpaid' | 'paid' | 'cancelled' | 'credited',
        proformaId: invoice.proformaid,
        paymentDate: invoice.paymentdate,
        paymentReference: invoice.paymentreference,
        createdAt: invoice.createdat || new Date().toISOString(),
        updatedAt: invoice.updatedat || new Date().toISOString()
      });
    }
    
    return finalInvoices;
  },
  
  getFinalInvoiceById: async (id: string): Promise<FinalInvoice> => {
    const { data: invoice, error: invoiceError } = await supabase
      .from('final_invoices')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    if (invoiceError) {
      console.error(`Error fetching final invoice ${id}:`, invoiceError);
      throw invoiceError;
    }
    
    // Get items for this invoice
    const { data: itemsJoinData, error: itemsJoinError } = await supabase
      .from('final_invoice_items')
      .select('*, invoice_items(*)')
      .eq('finalinvoiceid', invoice.id);
    
    if (itemsJoinError) {
      console.error(`Error fetching items for final invoice ${id}:`, itemsJoinError);
      throw itemsJoinError;
    }
    
    const items = await Promise.all(itemsJoinData.map(async (joinItem) => {
      const item = joinItem.invoice_items;
      let product = null;
      
      if (item.productid) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productid)
          .single();
        
        if (!productError) {
          product = {
            id: productData.id,
            code: productData.code,
            name: productData.name,
            description: productData.description,
            unitPrice: productData.unitprice,
            taxRate: productData.taxrate,
            stockQuantity: productData.stockquantity,
            createdAt: productData.createdat || new Date().toISOString(),
            updatedAt: productData.updatedat || new Date().toISOString()
          };
        }
      }
      
      return {
        id: item.id,
        productId: item.productid,
        product,
        quantity: item.quantity,
        unitPrice: item.unitprice,
        taxRate: item.taxrate,
        discount: item.discount,
        totalExcl: item.totalexcl,
        totalTax: item.totaltax,
        total: item.total
      };
    }));
    
    const client = invoice.clients ? {
      id: invoice.clients.id,
      name: invoice.clients.name,
      address: invoice.clients.address,
      taxId: invoice.clients.taxid,
      phone: invoice.clients.phone,
      email: invoice.clients.email,
      country: invoice.clients.country,
      city: invoice.clients.city,
      createdAt: invoice.clients.createdat || new Date().toISOString(),
      updatedAt: invoice.clients.updatedat || new Date().toISOString()
    } : undefined;
    
    return {
      id: invoice.id,
      number: invoice.number,
      clientId: invoice.clientid,
      client,
      issueDate: invoice.issuedate,
      dueDate: invoice.duedate,
      items,
      notes: invoice.notes || '',
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxtotal,
      total: invoice.total,
      status: invoice.status as 'unpaid' | 'paid' | 'cancelled' | 'credited',
      proformaId: invoice.proformaid,
      paymentDate: invoice.paymentdate,
      paymentReference: invoice.paymentreference,
      createdAt: invoice.createdat || new Date().toISOString(),
      updatedAt: invoice.updatedat || new Date().toISOString()
    };
  },
  
  // Delivery Notes
  getDeliveryNotes: async (): Promise<DeliveryNote[]> => {
    const { data: notesData, error: notesError } = await supabase
      .from('delivery_notes')
      .select('*, clients(*)');
    
    if (notesError) {
      console.error('Error fetching delivery notes:', notesError);
      throw notesError;
    }
    
    const deliveryNotes: DeliveryNote[] = [];
    
    for (const note of notesData) {
      // Get items for this delivery note
      const { data: itemsJoinData, error: itemsJoinError } = await supabase
        .from('delivery_note_items')
        .select('*, invoice_items(*)')
        .eq('deliverynoteid', note.id);
      
      if (itemsJoinError) {
        console.error(`Error fetching items for delivery note ${note.id}:`, itemsJoinError);
        continue;
      }
      
      const items = await Promise.all(itemsJoinData.map(async (joinItem) => {
        const item = joinItem.invoice_items;
        let product = null;
        
        if (item.productid) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.productid)
            .single();
          
          if (!productError) {
            product = {
              id: productData.id,
              code: productData.code,
              name: productData.name,
              description: productData.description,
              unitPrice: productData.unitprice,
              taxRate: productData.taxrate,
              stockQuantity: productData.stockquantity,
              createdAt: productData.createdat || new Date().toISOString(),
              updatedAt: productData.updatedat || new Date().toISOString()
            };
          }
        }
        
        return {
          id: item.id,
          productId: item.productid,
          product,
          quantity: item.quantity,
          unitPrice: item.unitprice,
          taxRate: item.taxrate,
          discount: item.discount,
          totalExcl: item.totalexcl,
          totalTax: item.totaltax,
          total: item.total
        };
      }));
      
      const client = note.clients ? {
        id: note.clients.id,
        name: note.clients.name,
        address: note.clients.address,
        taxId: note.clients.taxid,
        phone: note.clients.phone,
        email: note.clients.email,
        country: note.clients.country,
        city: note.clients.city,
        createdAt: note.clients.createdat || new Date().toISOString(),
        updatedAt: note.clients.updatedat || new Date().toISOString()
      } : undefined;
      
      let finalInvoice;
      if (note.finalinvoiceid) {
        try {
          finalInvoice = await mockDataService.getFinalInvoiceById(note.finalinvoiceid);
        } catch (error) {
          console.warn(`Error fetching final invoice ${note.finalinvoiceid} for delivery note ${note.id}:`, error);
        }
      }
      
      deliveryNotes.push({
        id: note.id,
        number: note.number,
        finalInvoiceId: note.finalinvoiceid,
        finalInvoice,
        clientId: note.clientid,
        client,
        issueDate: note.issuedate,
        deliveryDate: note.deliverydate,
        items,
        notes: note.notes || '',
        status: note.status as 'pending' | 'delivered' | 'cancelled',
        createdAt: note.createdat || new Date().toISOString(),
        updatedAt: note.updatedat || new Date().toISOString()
      });
    }
    
    return deliveryNotes;
  },
  
  getDeliveryNoteById: async (id: string): Promise<DeliveryNote> => {
    const { data: note, error: noteError } = await supabase
      .from('delivery_notes')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    if (noteError) {
      console.error(`Error fetching delivery note ${id}:`, noteError);
      throw noteError;
    }
    
    // Get items for this delivery note
    const { data: itemsJoinData, error: itemsJoinError } = await supabase
      .from('delivery_note_items')
      .select('*, invoice_items(*)')
      .eq('deliverynoteid', note.id);
    
    if (itemsJoinError) {
      console.error(`Error fetching items for delivery note ${id}:`, itemsJoinError);
      throw itemsJoinError;
    }
    
    const items = await Promise.all(itemsJoinData.map(async (joinItem) => {
      const item = joinItem.invoice_items;
      let product = null;
      
      if (item.productid) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productid)
          .single();
        
        if (!productError) {
          product = {
            id: productData.id,
            code: productData.code,
            name: productData.name,
            description: productData.description,
            unitPrice: productData.unitprice,
            taxRate: productData.taxrate,
            stockQuantity: productData.stockquantity,
            createdAt: productData.createdat || new Date().toISOString(),
            updatedAt: productData.updatedat || new Date().toISOString()
          };
        }
      }
      
      return {
        id: item.id,
        productId: item.productid,
        product,
        quantity: item.quantity,
        unitPrice: item.unitprice,
        taxRate: item.taxrate,
        discount: item.discount,
        totalExcl: item.totalexcl,
        totalTax: item.totaltax,
        total: item.total
      };
    }));
    
    const client = note.clients ? {
      id: note.clients.id,
      name: note.clients.name,
      address: note.clients.address,
      taxId: note.clients.taxid,
      phone: note.clients.phone,
      email: note.clients.email,
      country: note.clients.country,
      city: note.clients.city,
      createdAt: note.clients.createdat || new Date().toISOString(),
      updatedAt: note.clients.updatedat || new Date().toISOString()
    } : undefined;
    
    let finalInvoice;
    if (note.finalinvoiceid) {
      try {
        finalInvoice = await mockDataService.getFinalInvoiceById(note.finalinvoiceid);
      } catch (error) {
        console.warn(`Error fetching final invoice ${note.finalinvoiceid} for delivery note ${note.id}:`, error);
      }
    }
    
    return {
      id: note.id,
      number: note.number,
      finalInvoiceId: note.finalinvoiceid,
      finalInvoice,
      clientId: note.clientid,
      client,
      issueDate: note.issuedate,
      deliveryDate: note.deliverydate,
      items,
      notes: note.notes || '',
      status: note.status as 'pending' | 'delivered' | 'cancelled',
      createdAt: note.createdat || new Date().toISOString(),
      updatedAt: note.updatedat || new Date().toISOString()
    };
  },
  
  createDeliveryNote: async (deliveryNote: any): Promise<DeliveryNote> => {
    try {
      // Start a transaction
      const { error: startError } = await supabase.rpc('begin_transaction');
      if (startError) throw startError;
      
      try {
        // Generate delivery note number using database function
        const { data: numberData, error: numberError } = await supabase.rpc('generate_delivery_note_number');
        if (numberError) throw numberError;
        
        // Create the delivery note
        const { data: createdNote, error: noteError } = await supabase
          .from('delivery_notes')
          .insert({
            clientid: deliveryNote.clientId,
            finalinvoiceid: deliveryNote.finalInvoiceId,
            number: numberData || deliveryNote.number,
            issuedate: deliveryNote.issueDate,
            notes: deliveryNote.notes || '',
            status: deliveryNote.status || 'pending'
          })
          .select()
          .single();
        
        if (noteError) throw noteError;
        
        // Create invoice items and link them to the delivery note
        for (const item of deliveryNote.items) {
          // Create invoice item
          const { data: createdItem, error: itemError } = await supabase
            .from('invoice_items')
            .insert({
              productid: item.productId,
              quantity: item.quantity,
              unitprice: item.unitPrice || 0,
              taxrate: item.taxRate || 0,
              discount: item.discount || 0,
              totalexcl: item.totalExcl || 0,
              totaltax: item.totalTax || 0,
              total: item.total || 0
            })
            .select()
            .single();
          
          if (itemError) throw itemError;
          
          // Link item to delivery note
          const { error: linkError } = await supabase
            .from('delivery_note_items')
            .insert({
              deliverynoteid: createdNote.id,
              itemid: createdItem.id
            });
          
          if (linkError) throw linkError;
        }
        
        // Commit the transaction
        const { error: commitError } = await supabase.rpc('commit_transaction');
        if (commitError) throw commitError;
        
        // Return the created delivery note with full data
        return await mockDataService.getDeliveryNoteById(createdNote.id);
        
      } catch (error) {
        // Rollback on error
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (error) {
      console.error('Error creating delivery note:', error);
      throw error;
    }
  }
};
