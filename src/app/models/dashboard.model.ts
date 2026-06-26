import { OrderStatus } from './order.model';

export interface DashboardSummary {
  ordersByStatus: Record<OrderStatus, number>;
}
