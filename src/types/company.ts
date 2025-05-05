
export interface CompanyInfo {
  id?: string;
  businessName: string;      // Raison sociale
  address: string;           // Adresse complète
  taxId: string;             // N° d'identification fiscale (NIF)
  commerceRegNumber: string; // N registre de commerce
  phone: string;             // Téléphone
  email: string;             // e-mail
  createdAt?: string;
  updatedAt?: string;
}
