import { Platform } from 'react-native';

// API base URL'i (bilgisayarın IP adresi)
export const API_BASE_URL = 'http://172.20.10.2:3001';

// API servisi
const api = {
  // Kullanıcı girişi
  login: async (tcNo: string, password: string) => {
    try {
      console.log('Login attempt:', { tcNo });
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tc_no: tcNo, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Giriş başarısız');
      }
      
      const data = await response.json();
      console.log('Login successful:', data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Kullanıcı kaydı
  register: async (userData: {
    ad: string;
    soyad: string;
    tc_no: string;
    telefon: string;
    email: string;
    password: string;
    rol: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Bordro listeleme
  getPayrolls: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payrolls`);
      return await response.json();
    } catch (error) {
      console.error('Get payrolls error:', error);
      throw error;
    }
  },

  // Bordro ekleme
  addPayroll: async (payrollData: {
    user_id: number;
    payroll_date: string;
    amount: number;
    description: string;
    pdf_path: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payrolls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payrollData),
      });
      return await response.json();
    } catch (error) {
      console.error('Add payroll error:', error);
      throw error;
    }
  },

  // İşçi listesini çek
  getWorkers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workers`);
      return await response.json();
    } catch (error) {
      console.error('Get workers error:', error);
      throw error;
    }
  },
};

export default api; 