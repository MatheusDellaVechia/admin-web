import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderFilters, OrderListResponse, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  filterStatus: OrderStatus | '' = '';
  filterCustomer = '';
  filterDateFrom = '';
  filterDateTo = '';

  loading = false;
  error: string | null = null;

  readonly allStatuses = Object.values(OrderStatus);
  readonly statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.AGUARDANDO_PAGAMENTO]: 'Aguardando Pagamento',
    [OrderStatus.PAGO]: 'Pago',
    [OrderStatus.EM_TRANSPORTE]: 'Em Transporte',
    [OrderStatus.CONCLUIDO]: 'Concluído',
    [OrderStatus.CANCELADO]: 'Cancelado',
  };

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = null;
    const filters: OrderFilters = {};
    if (this.filterStatus) filters.status = this.filterStatus as OrderStatus;
    if (this.filterCustomer.trim()) filters.customerSearch = this.filterCustomer.trim();
    if (this.filterDateFrom) filters.dateFrom = this.filterDateFrom;
    if (this.filterDateTo) filters.dateTo = this.filterDateTo;

    this.orderService.listOrders(this.currentPage, this.pageSize, filters).subscribe({
      next: (response: OrderListResponse) => {
        this.orders = response.content;
        this.currentPage = response.page;
        this.pageSize = response.size;
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar pedidos. Tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadOrders();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterCustomer = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.currentPage = 0;
    this.loadOrders();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
