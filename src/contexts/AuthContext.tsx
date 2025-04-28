
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

// User roles
export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  SALESPERSON = 'salesperson',
  VIEWER = 'viewer',
}

// User type
export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkPermission: (allowedRoles: UserRole[]) => boolean;
}

// Mock users for demo purposes
const mockUsers = [
  { id: '1', email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: UserRole.ADMIN },
  { id: '2', email: 'accountant@example.com', password: 'account123', name: 'Accountant User', role: UserRole.ACCOUNTANT },
  { id: '3', email: 'sales@example.com', password: 'sales123', name: 'Sales User', role: UserRole.SALESPERSON },
  { id: '4', email: 'viewer@example.com', password: 'viewer123', name: 'Viewer User', role: UserRole.VIEWER },
];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with mock data
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        toast({
          title: 'Login successful',
          description: `Welcome back, ${foundUser.name}!`,
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error || 'Invalid email or password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // For demo, just simulate successful registration
      // In a real app, this would create a new user in the database
      toast({
        title: 'Registration successful',
        description: 'Please login with your new credentials',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error || 'Unable to create account',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  // Check if user has required permissions
  const checkPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
