import { Store } from './store';

export interface User {
  id: number;
  email: string;
  fullname: string;
  phone: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  store?: Store | null;
}