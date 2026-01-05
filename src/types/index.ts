// ================================
// TYPE DEFINITIONS
// Sistema de Gestión Comercial
// ================================

// ========== ROLES & AUTH ==========

export type Role = 'OWNER' | 'EMPLOYEE' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

// ========== PRODUCTS ==========

export interface Product {
  id: string;
  name: string;
  code?: string;
  price: number;
  cost?: number; // Sensitive - visibility depends on config
  stock: number;
  minStock?: number;
  isActive: boolean;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

// ========== STOCK ==========

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  quantity: number; // Can be positive or negative
  reason: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

// ========== CLIENTS ==========

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number; // Positive = owes money, Negative = credit balance
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

// ========== SALES ==========

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'CREDIT'; // CREDIT = FIADO

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  number: number; // Sequential sale number
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  clientId?: string;
  clientName?: string;
  cashRegisterId: string;
  userId: string;
  userName: string;
  notes?: string;
  createdAt: Date;
}

// ========== CASH REGISTER ==========

export type ExpenseCategory = 'FREIGHT' | 'SUPPLIES' | 'SERVICES' | 'OTHER';

export interface Expense {
  id: string;
  cashRegisterId: string;
  amount: number;
  category?: ExpenseCategory;
  paymentMethod: 'CASH' | 'TRANSFER';
  notes?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface CashRegister {
  id: string;
  openingAmount: number;
  openingNotes?: string;
  openedBy: string;
  openedByName: string;
  openedAt: Date;
  
  // Closing data (null if still open)
  closingAmount?: number; // Actual cash counted
  expectedAmount?: number; // Calculated expected
  difference?: number; // closingAmount - expectedAmount
  closingNotes?: string;
  closedBy?: string;
  closedByName?: string;
  closedAt?: Date;
  
  // Aggregates
  totalCash: number;
  totalTransfer: number;
  totalCard: number;
  totalCredit: number;
  totalExpensesCash: number;
  totalExpensesTransfer: number;
  salesCount: number;
  
  isClosed: boolean;
}

// ========== PAYMENTS (for credit accounts) ==========

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  notes?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

// ========== ACCOUNT MOVEMENTS ==========

export type MovementType = 'SALE' | 'PAYMENT';

export interface AccountMovement {
  id: string;
  clientId: string;
  type: MovementType;
  referenceId: string; // Sale ID or Payment ID
  referenceNumber?: number; // Sale number if applicable
  amount: number; // Positive for debits (sales), negative for credits (payments)
  balance: number; // Running balance after this movement
  notes?: string;
  createdAt: Date;
}

// ========== BUSINESS CONFIG ==========

export interface BusinessConfig {
  // Business info
  businessName: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  
  // Operational settings
  requireCashRegisterForSales: boolean;
  allowNegativeStock: boolean;
  employeeCanEditPrices: boolean;
  employeeCanAdjustStock: boolean;
  showCostsToEmployee: boolean;
  showCostsToAccountant: boolean;
  allowCreditOverpayment: boolean; // Allow payments that exceed debt
}

// ========== UI STATE ==========

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

// ========== REPORT FILTERS ==========

export interface SalesReportFilters {
  startDate: Date;
  endDate: Date;
  paymentMethod?: PaymentMethod;
  clientId?: string;
}

export interface SalesReportData {
  totalAmount: number;
  salesCount: number;
  averageTicket: number;
  byPaymentMethod: {
    method: PaymentMethod;
    total: number;
    count: number;
  }[];
  sales: Sale[];
}

export interface DebtorsReportData {
  clients: {
    id: string;
    name: string;
    phone?: string;
    balance: number;
    lastActivityAt?: Date;
  }[];
  totalDebt: number;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========== CART (POS) ==========

export interface CartItem {
  productId: string;
  productName: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number; // To track if price was modified
  subtotal: number;
  availableStock: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  clientId?: string;
  clientName?: string;
  paymentMethod?: PaymentMethod;
}
