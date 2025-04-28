
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

// Mock user data (would normally come from an API)
const mockUsers = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: UserRole.ADMIN, active: true },
  { id: '2', name: 'Accountant User', email: 'accountant@example.com', role: UserRole.ACCOUNTANT, active: true },
  { id: '3', name: 'Sales User', email: 'sales@example.com', role: UserRole.SALESPERSON, active: true },
  { id: '4', name: 'Viewer User', email: 'viewer@example.com', role: UserRole.VIEWER, active: true },
  { id: '5', name: 'Inactive User', email: 'inactive@example.com', role: UserRole.VIEWER, active: false },
];

const UserDetail = () => {
  const { id } = useParams();
  const isNewUser = id === 'new';
  
  // Get user data
  const user = isNewUser ? null : mockUsers.find(u => u.id === id);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isNewUser ? 'New User' : `Edit User: ${user?.name}`}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            {isNewUser 
              ? 'Create a new system user' 
              : 'Edit user details and permissions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            This is a demonstration application. <br />
            User management functionality would be implemented here in a production environment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetail;
