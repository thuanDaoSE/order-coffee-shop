
export interface User {
  id: string;
  email: string;
  fullname: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  phone?: string;
}