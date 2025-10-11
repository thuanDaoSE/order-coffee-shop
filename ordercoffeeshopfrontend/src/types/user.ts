
export interface User {
  id: string;
  email: string;
  fullname: string;
  role: 'CUSTOMER' | 'BARISTA' | 'ADMIN';
  phone?: string;
}