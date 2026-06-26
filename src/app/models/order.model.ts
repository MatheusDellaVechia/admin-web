export enum OrderStatus {
  AGUARDANDO_PAGAMENTO = 'AGUARDANDO_PAGAMENTO',
  PAGO = 'PAGO',
  EM_TRANSPORTE = 'EM_TRANSPORTE',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  items?: OrderItem[];
  statusHistory?: StatusHistoryItem[];
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderListResponse {
  content: Order[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderSummary {
  status: OrderStatus;
  count: number;
}

export interface StatusHistoryItem {
  id: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedAt: string;
  changedBy: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  customerSearch?: string;
  dateFrom?: string;
  dateTo?: string;
}
