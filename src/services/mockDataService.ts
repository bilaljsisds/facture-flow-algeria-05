import { supabase, beginTransaction, commitTransaction, rollbackTransaction } from '@/integrations/supabase/client';
import { 
  Client, 
  Product, 
  ProformaInvoice, 
  FinalInvoice, 
  DeliveryNote 
} from '@/types';

class MockDataService {
  // Client methods
  async getClients(): Promise<Client[]> {
    try {
      // Here we would connect to the API
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) throw error;
      
      return data as Client[];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      // Find client by ID
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Client;
    } catch (error) {
      console.error('Error fetching client by ID:', error);
      return null;
    }
  }

  async createClient(clientData: Partial<Client>): Promise<Client | null> {
    try {
      // Add new client
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select('*')
        .single();
      
      if (error) throw error;
      
      return data as Client;
    } catch (error) {
      console.error('Error creating client:', error);
      return null;
    }
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
    try {
      // Update existing client
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return data as Client;
    } catch (error) {
      console.error('Error updating client:', error);
      return null;
    }
  }

  async deleteClient(id: string): Promise<boolean> {
    try {
      // Delete client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
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
      unitprice: product.unitprice,
      taxrate: product.taxrate,
      stockquantity: product.stockquantity,
      createdAt: product.createdat || new Date().toISOString(),
      updatedAt: product.updatedat || new Date().toISOString()
    }));
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
    
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      unitprice: data.unitprice,
      taxrate: data.taxrate,
      stockquantity: data.stockquantity,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  }

  async createProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select('*')
        .single();
      
      if (error) throw error;
      
      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    const updateData: any = {};
    if (productData.code !== undefined) updateData.code = productData.code;
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.unitprice !== undefined) updateData.unitprice = productData.unitprice;
    if (productData.taxrate !== undefined) updateData.taxrate = productData.taxrate;
    if (productData.stockquantity !== undefined) updateData.stockquantity = productData.stockquantity;
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating product ${id}:`, error);
      return null;
    }
    
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      unitprice: data.unitprice,
      taxrate: data.taxrate,
      stockquantity: data.stockquantity,
      createdAt: data.createdat || new Date().toISOString(),
      updatedAt: data.updatedat || new Date().toISOString()
    };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting product ${id}:`, error);
      return false;
    }
    
    return true;
  }

  // Proforma Invoices
  async getProformaInvoices(): Promise<ProformaInvoice[]> {
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('proforma_invoices')
      .select('*, clients(*)');
    
    if (invoicesError) {
      console.error('Error fetching proforma invoices:', invoicesError);
      throw invoicesError;
    }
    
    const proformas: ProformaInvoice[] = [];
    
    for (const invoice of invoicesData) {
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
              unitprice: productData.unitprice,
              taxrate: productData.taxrate,
              stockquantity: productData.stockquantity,
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
          unitprice: item.unitprice,
          taxrate: item.taxrate,
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
  }

  async getProformaInvoiceById(id: string): Promise<ProformaInvoice | null> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('proforma_invoices')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    if (invoiceError) {
      console.error(`Error fetching proforma invoice ${id}:`, invoiceError);
      return null;
    }
    
    const { data: itemsJoinData, error: itemsJoinError } = await supabase
      .from('proforma_invoice_items')
      .select('*, invoice_items(*)')
      .eq('proformainvoiceid', invoice.id);
    
    if (itemsJoinError) {
      console.error(`Error fetching items for proforma invoice ${id}:`, itemsJoinError);
      return null;
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
            unitprice: productData.unitprice,
            taxrate: productData.taxrate,
            stockquantity: productData.stockquantity,
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
        unitprice: item.unitprice,
        taxrate: item.taxrate,
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
  }

  async createProformaInvoice(proforma: any): Promise<ProformaInvoice> {
    try {
      await beginTransaction();
      
      try {
        const { data: numberData, error: numberError } = await supabase.rpc('generate_proforma_number');
        if (numberError) throw numberError;
        
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
        
        for (const item of proforma.items) {
          const { data: createdItem, error: itemError } = await supabase
            .from('invoice_items')
            .insert({
              productid: item.productId,
              quantity: item.quantity,
              unitprice: item.unitprice,
              taxrate: item.taxrate,
              discount: item.discount || 0,
              totalexcl: item.totalExcl,
              totaltax: item.totalTax,
              total: item.total
            })
            .select()
            .single();
          
          if (itemError) throw itemError;
          
          const { error: linkError } = await supabase
            .from('proforma_invoice_items')
            .insert({
              proformainvoiceid: createdInvoice.id,
              itemid: createdItem.id
            });
          
          if (linkError) throw linkError;
        }
        
        await commitTransaction();
        return await mockDataService.getProformaInvoiceById(createdInvoice.id);
        
      } catch (error) {
        await rollbackTransaction();
        throw error;
      }
    } catch (error) {
      console.error('Error creating proforma invoice:', error);
      throw error;
    }
  }

  async updateProformaStatus(id: string, status: 'draft' | 'sent' | 'approved' | 'rejected'): Promise<{ id: string; status: string }> {
    const { error } = await supabase
      .from('proforma_invoices')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating proforma invoice status ${id}:`, error);
      throw error;
    }
    
    return {
      id,
      status
    };
  }

  async convertProformaToFinal(proformaId: string): Promise<{ proforma: ProformaInvoice | null, finalInvoice: FinalInvoice | null }> {
    try {
      await beginTransaction();
      
      try {
        const proforma = await mockDataService.getProformaInvoiceById(proformaId);
        
        const { data: numberData, error: numberError } = await supabase.rpc('generate_invoice_number');
        if (numberError) throw numberError;
        
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
        
        for (const item of proforma.items) {
          const { error: linkError } = await supabase
            .from('final_invoice_items')
            .insert({
              finalinvoiceid: createdInvoice.id,
              itemid: item.id
            });
          
          if (linkError) throw linkError;
        }
        
        const { error: updateError } = await supabase
          .from('proforma_invoices')
          .update({
            finalinvoiceid: createdInvoice.id,
            status: 'approved'
          })
          .eq('id', proformaId);
        
        if (updateError) throw updateError;
        
        await commitTransaction();
        
        const updatedProforma = await mockDataService.getProformaInvoiceById(proformaId);
        const finalInvoice = await mockDataService.getFinalInvoiceById(createdInvoice.id);
        
        return { proforma: updatedProforma, finalInvoice };
        
      } catch (error) {
        await rollbackTransaction();
        throw error;
      }
    } catch (error) {
      console.error(`Error converting proforma invoice ${proformaId} to final:`, error);
      throw error;
    }
  }

  // Final Invoices
  async getFinalInvoices(): Promise<FinalInvoice[]> {
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('final_invoices')
      .select('*, clients(*)');
    
    if (invoicesError) {
      console.error('Error fetching final invoices:', invoicesError);
      throw invoicesError;
    }
    
    const finalInvoices: FinalInvoice[] = [];
    
    for (const invoice of invoicesData) {
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
              unitprice: productData.unitprice,
              taxrate: productData.taxrate,
              stockquantity: productData.stockquantity,
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
          unitprice: item.unitprice,
          taxrate: item.taxrate,
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
  }

  async getFinalInvoiceById(id: string): Promise<FinalInvoice | null> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('final_invoices')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    if (invoiceError) {
      console.error(`Error fetching final invoice ${id}:`, invoiceError);
      return null;
    }
    
    const { data: itemsJoinData, error: itemsJoinError } = await supabase
      .from('final_invoice_items')
      .select('*, invoice_items(*)')
      .eq('finalinvoiceid', invoice.id);
    
    if (itemsJoinError) {
      console.error(`Error fetching items for final invoice ${id}:`, itemsJoinError);
      return null;
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
            unitprice: productData.unitprice,
            taxrate: productData.taxrate,
            stockquantity: productData.stockquantity,
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
        unitprice: item.unitprice,
        taxrate: item.taxrate,
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
  }

  async markFinalInvoiceAsPaid(id: string): Promise<FinalInvoice | null> {
    try {
      await beginTransaction();
      
      const { data, error } = await supabase
        .from('final_invoices')
        .update({ status: 'paid', paymentdate: new Date().toISOString().split('T')[0] })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        await rollbackTransaction();
        throw error;
      }
      
      await commitTransaction();
      return data as FinalInvoice;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      await rollbackTransaction();
      return null;
    }
  }

  // Delivery Notes
  async getDeliveryNotes(): Promise<DeliveryNote[]> {
    const { data: notesData, error: notesError } = await supabase
      .from('delivery_notes')
      .select('*, clients(*)');
    
    if (notesError) {
      console.error('Error fetching delivery notes:', notesError);
      throw notesError;
    }
    
    const deliveryNotes: DeliveryNote[] = [];
    
    for (const note of notesData) {
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
              unitprice: productData.unitprice,
              taxrate: productData.taxrate,
              stockquantity: productData.stockquantity,
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
          unitprice: item.unitprice,
          taxrate: item.taxrate,
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
  }

  async getDeliveryNoteById(id: string): Promise<DeliveryNote | null> {
    const { data: note, error: noteError } = await supabase
      .from('delivery_notes')
      .select('*, clients(*)')
      .eq('id', id)
      .single();
    
    if (noteError) {
      console.error(`Error fetching delivery note ${id}:`, noteError);
      return null;
    }
    
    const { data: itemsJoinData, error: itemsJoinError } = await supabase
      .from('delivery_note_items')
      .select('*, invoice_items(*)')
      .eq('deliverynoteid', note.id);
    
    if (itemsJoinError) {
      console.error(`Error fetching items for delivery note ${id}:`, itemsJoinError);
      return null;
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
            unitprice: productData.unitprice,
            taxrate: productData.taxrate,
            stockquantity: productData.stockquantity,
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
        unitprice: item.unitprice,
        taxrate: item.taxrate,
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
  }

  async createDeliveryNote(deliveryNote: any): Promise<DeliveryNote> {
    try {
      await beginTransaction();
      
      try {
        const { data: numberData, error: numberError } = await supabase.rpc('generate_delivery_note_number');
        if (numberError) throw numberError;
        
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
        
        for (const item of deliveryNote.items) {
          const { data: createdItem, error: itemError } = await supabase
            .from('invoice_items')
            .insert({
              productid: item.productId,
              quantity: item.quantity,
              unitprice: item.unitprice || 0,
              taxrate: item.taxrate || 0,
              discount: item.discount || 0,
              totalexcl: item.totalExcl || 0,
              totaltax: item.totalTax || 0,
              total: item.total || 0
            })
            .select()
            .single();
          
          if (itemError) throw itemError;
          
          const { error: linkError } = await supabase
            .from('delivery_note_items')
            .insert({
              deliverynoteid: createdNote.id,
              itemid: createdItem.id
            });
          
          if (linkError) throw linkError;
        }
        
        await commitTransaction();
        return await mockDataService.getDeliveryNoteById(createdNote.id);
        
      } catch (error) {
        await rollbackTransaction();
        throw error;
      }
    } catch (error) {
      console.error('Error creating delivery note:', error);
      throw error;
    }
  }

  // Update delivery note
  updateDeliveryNote = async (id: string, data: any) => {
    // In a real app, this would call the API to update the delivery note
    const notes = this.getDeliveryNotes();
    const index = notes.findIndex(note => note.id === id);
    
    if (index === -1) {
      throw new Error("Delivery note not found");
    }
    
    const updatedNote = {
      ...notes[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    notes[index] = updatedNote;
    localStorage.setItem('deliveryNotes', JSON.stringify(notes));
    
    return updatedNote;
  };

  // Mark delivery note as delivered
  markDeliveryNoteAsDelivered = async (id: string) => {
    // In a real app, this would call the API to update the delivery note status
    const notes = this.getDeliveryNotes();
    const index = notes.findIndex(note => note.id === id);
    if (!Array.isArray(notes)) {
      throw new Error("Invalid delivery notes data: not an array");
    }
    if (index === -1) {
      throw new Error("Delivery note not found");
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
  };

  // Update final invoice
  updateFinalInvoice = async (id: string, data: any) => {
    // In a real app, this would call the API to update the invoice
    const invoices = this.getFinalInvoices();
    const index = invoices.findIndex(invoice => invoice.id === id);
    
    if (index === -1) {
      throw new Error("Invoice not found");
    }
    
    const updatedInvoice = {
      ...invoices[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    invoices[index] = updatedInvoice;
    localStorage.setItem('finalInvoices', JSON.stringify(invoices));
    
    return updatedInvoice;
  };

  // Update proforma invoice
  updateProformaInvoice = async (id: string, data: any) => {
    // In a real app, this would call the API to update the proforma
    const proformas = this.getProformaInvoices();
    const index = proformas.findIndex(proforma => proforma.id === id);
    
    if (index === -1) {
      throw new Error("Proforma invoice not found");
    }
    
    const updatedProforma = {
      ...proformas[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    proformas[index] = updatedProforma;
    localStorage.setItem('proformaInvoices', JSON.stringify(proformas));
    
    return updatedProforma;
  };

  // Delete proforma invoice
  deleteProformaInvoice = async (id: string) => {
    // In a real app, this would call the API to delete the proforma
    const proformas = this.getProformaInvoices();
    const filteredProformas = proformas.filter(proforma => proforma.id !== id);
    
    if (filteredProformas.length === proformas.length) {
      throw new Error("Proforma invoice not found");
    }
    
    localStorage.setItem('proformaInvoices', JSON.stringify(filteredProformas));
    
    return { success: true };
  };

  // Undo approved proforma status
  undoApprovedProforma = async (id: string) => {
    // In a real app, this would call the API to update the proforma status
    const proformas = this.getProformaInvoices();
    const index = proformas.findIndex(proforma => proforma.id === id);
    
    if (index === -1) {
      throw new Error("Proforma invoice not found");
    }
    
    const updatedProforma = {
      ...proformas[index],
      status: 'sent',
      updatedAt: new Date().toISOString()
    };
    
    proformas[index] = updatedProforma;
    localStorage.setItem('proformaInvoices', JSON.stringify(proformas));
    
    return updatedProforma;
  };

  // Undo convert to final invoice
  undoConvertToFinal = async (id: string) => {
    // In a real app, this would call the API to undo the conversion
    const proformas = this.getProformaInvoices();
    const proformaIndex = proformas.findIndex(proforma => proforma.id === id);
    
    if (proformaIndex === -1) {
      throw new Error("Proforma invoice not found");
    }
    
    const proforma = proformas[proformaIndex];
    
    if (!proforma.finalInvoiceId) {
      throw new Error("Proforma invoice is not converted to final invoice");
    }
    
    // Remove the final invoice
    const finalInvoices = this.getFinalInvoices();
    const finalInvoicesFiltered = finalInvoices.filter(invoice => invoice.id !== proforma.finalInvoiceId);
    
    // Update the proforma
    const updatedProforma = {
      ...proforma,
      finalInvoiceId: undefined,
      status: 'approved',
      updatedAt: new Date().toISOString()
    };
    
    proformas[proformaIndex] = updatedProforma;
    
    localStorage.setItem('finalInvoices', JSON.stringify(finalInvoicesFiltered));
    localStorage.setItem('proformaInvoices', JSON.stringify(proformas));
    
    return { proforma: updatedProforma };
  };
}

export const mockDataService = new MockDataService();
