
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { 
  FileText, 
  Users, 
  Package, 
  Truck,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Mock data for dashboard
const mockStats = {
  activeClients: 42,
  proformaInvoices: 18,
  finalInvoices: 24,
  deliveryNotes: 19,
  products: 87,
  recentProformas: [
    { id: 'P-2023-0018', client: 'Algiers Electronics', amount: 15400.00, date: '2023-04-22', status: 'Pending' },
    { id: 'P-2023-0017', client: 'Oran Supplies Co.', amount: 8750.50, date: '2023-04-20', status: 'Approved' },
    { id: 'P-2023-0016', client: 'Constantine Traders', amount: 22300.75, date: '2023-04-18', status: 'Pending' }
  ],
  recentInvoices: [
    { id: 'F-2023-0024', client: 'Annaba Distributors', amount: 12750.00, date: '2023-04-21', status: 'Paid' },
    { id: 'F-2023-0023', client: 'Setif Industries', amount: 19800.25, date: '2023-04-19', status: 'Unpaid' },
    { id: 'F-2023-0022', client: 'Tlemcen Exports', amount: 8430.50, date: '2023-04-17', status: 'Paid' }
  ]
};

const Dashboard = () => {
  const { user, checkPermission } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome, {user?.name}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
          <CardFooter>
            <Link to="/clients" className="text-xs text-primary flex items-center">
              View all clients <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Proforma Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.proformaInvoices}</div>
            <p className="text-xs text-muted-foreground">Active proforma invoices</p>
          </CardContent>
          <CardFooter>
            <Link to="/invoices/proforma" className="text-xs text-primary flex items-center">
              View all proformas <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Final Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.finalInvoices}</div>
            <p className="text-xs text-muted-foreground">Issued final invoices</p>
          </CardContent>
          <CardFooter>
            <Link to="/invoices/final" className="text-xs text-primary flex items-center">
              View all invoices <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.products}</div>
            <p className="text-xs text-muted-foreground">Products in catalog</p>
          </CardContent>
          <CardFooter>
            <Link to="/products" className="text-xs text-primary flex items-center">
              Manage products <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALESPERSON]) && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Commonly used actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALESPERSON]) && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/invoices/proforma/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Create New Proforma Invoice
                  </Link>
                </Button>
              )}
              
              {checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]) && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/invoices/final/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Create New Final Invoice
                  </Link>
                </Button>
              )}
              
              {checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALESPERSON]) && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/delivery-notes/new">
                    <Truck className="mr-2 h-4 w-4" />
                    Create Delivery Note
                  </Link>
                </Button>
              )}
              
              {checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]) && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/clients/new">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Client
                  </Link>
                </Button>
              )}
              
              {checkPermission([UserRole.ADMIN, UserRole.ACCOUNTANT]) && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/products/new">
                    <Package className="mr-2 h-4 w-4" />
                    Add New Product
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Proformas */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Proforma Invoices</CardTitle>
            <CardDescription>Latest created proformas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockStats.recentProformas.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.id}</p>
                    <p className="text-xs text-muted-foreground">{item.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.amount.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/invoices/proforma">View All Proformas</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Final Invoices</CardTitle>
            <CardDescription>Latest issued invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockStats.recentInvoices.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.id}</p>
                    <p className="text-xs text-muted-foreground">{item.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.amount.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })}</p>
                    <div className="flex items-center justify-end gap-1">
                      <span className={`h-2 w-2 rounded-full ${item.status === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      <p className="text-xs text-muted-foreground">{item.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/invoices/final">View All Invoices</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* System notices */}
      <Card className="border-amber-500/20 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-amber-800">
            <AlertCircle className="mr-2 h-5 w-5" />
            System Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800">
          <p>This is a demonstration system with mock data. In a production environment, this would connect to your database backend.</p>
          <p className="mt-2">Login with different demo accounts to explore role-based permissions.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
