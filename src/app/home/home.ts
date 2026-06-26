import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardSummary } from '../models/dashboard.model';
import { OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  summary: DashboardSummary = {
    ordersByStatus: {
      [OrderStatus.AGUARDANDO_PAGAMENTO]: 0,
      [OrderStatus.PAGO]: 0,
      [OrderStatus.EM_TRANSPORTE]: 0,
      [OrderStatus.CONCLUIDO]: 0,
      [OrderStatus.CANCELADO]: 0,
    },
  };
  loadingSummary = false;

  readonly statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.AGUARDANDO_PAGAMENTO]: 'Aguardando Pagamento',
    [OrderStatus.PAGO]: 'Pago',
    [OrderStatus.EM_TRANSPORTE]: 'Em Transporte',
    [OrderStatus.CONCLUIDO]: 'Concluído',
    [OrderStatus.CANCELADO]: 'Cancelado',
  };

  readonly statusColors: Record<OrderStatus, string> = {
    [OrderStatus.AGUARDANDO_PAGAMENTO]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    [OrderStatus.PAGO]: 'bg-green-50 text-green-700 border-green-200',
    [OrderStatus.EM_TRANSPORTE]: 'bg-blue-50 text-blue-700 border-blue-200',
    [OrderStatus.CONCLUIDO]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    [OrderStatus.CANCELADO]: 'bg-red-50 text-red-700 border-red-200',
  };

  readonly allStatuses = Object.values(OrderStatus);

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.loadingSummary = true;
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loadingSummary = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSummary = false;
        this.cdr.detectChanges();
      },
    });
  }

  getCount(status: OrderStatus): number {
    return this.summary.ordersByStatus[status] ?? 0;
  }
}
