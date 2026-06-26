import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogService } from '../../services/log.service';
import { LogEntry, LogListResponse, LogType } from '../../models/log.model';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './log-list.component.html',
  styleUrl: './log-list.component.css',
})
export class LogListComponent implements OnInit {
  logs: LogEntry[] = [];
  currentPage = 0;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  filterType: LogType | '' = '';
  loading = false;
  error: string | null = null;

  readonly allTypes = Object.values(LogType);
  readonly typeLabels: Record<LogType, string> = {
    [LogType.ORDER_STATUS_CHANGED]: 'Status do Pedido Alterado',
    [LogType.EMAIL_SENT]: 'E-mail Enviado',
    [LogType.EMAIL_FAILED]: 'Falha no E-mail',
  };

  constructor(private logService: LogService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.error = null;
    const type = this.filterType || undefined;
    this.logService.getLogs(this.currentPage, this.pageSize, type as LogType | undefined).subscribe({
      next: (response: LogListResponse) => {
        this.logs = response.logs;
        this.currentPage = response.currentPage;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar logs. Tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter() {
    this.currentPage = 0;
    this.loadLogs();
  }

  clearFilter() {
    this.filterType = '';
    this.currentPage = 0;
    this.loadLogs();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR');
  }

  isEmailType(type: LogType): boolean {
    return type === LogType.EMAIL_SENT || type === LogType.EMAIL_FAILED;
  }
}
