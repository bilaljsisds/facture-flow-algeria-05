
import { useState, useEffect } from 'react';
import { CompanyInfo } from '@/types/company';
import { fetchCompanyInfo } from '@/components/exports/CompanyInfoHeader';
import { toast } from '@/components/ui/use-toast';

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCompanyInfo = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCompanyInfo();
        setCompanyInfo(data);
      } catch (error) {
        console.error('Error fetching company info:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load company information.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    getCompanyInfo();
  }, []);

  return { companyInfo, isLoading };
};
