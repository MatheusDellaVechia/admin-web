import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AttachmentService } from '../../services/attachment.service';
import { Order, OrderStatus, StatusHistoryItem } from '../../models/order.model';
import { Attachment } from '../../models/attachment.model';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  history: StatusHistoryItem[] = [];
  attachments: Attachment[] = [];

  loadingOrder = false;
  loadingHistory = false;
  loadingAttachments = false;
  loadingStatusUpdate = false;
  uploadingFile = false;

  orderError: string | null = null;
  statusSuccess: string | null = null;
  statusError: string | null = null;
  uploadError: string | null = null;
  uploadSuccess: string | null = null;
  downloadError: string | null = null;
  downloadingId: string | null = null;

  selectedStatus: OrderStatus | '' = '';
  showConfirm = false;
  attachmentRequiredError: string | null = null;

  get selectedStatusLabel(): string {
    return this.selectedStatus ? this.statusLabels[this.selectedStatus] : '';
  }

  get hasPdfAttachment(): boolean {
    return this.attachments.some((a) => a.contentType === 'application/pdf');
  }

  readonly allStatuses = Object.values(OrderStatus);
  readonly statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.AGUARDANDO_PAGAMENTO]: 'Aguardando Pagamento',
    [OrderStatus.PAGO]: 'Pago',
    [OrderStatus.EM_TRANSPORTE]: 'Em Transporte',
    [OrderStatus.CONCLUIDO]: 'Concluído',
    [OrderStatus.CANCELADO]: 'Cancelado',
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private attachmentService: AttachmentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
      this.loadAttachments(id);
    }
  }

  loadOrder(id: string) {
    this.loadingOrder = true;
    this.orderError = null;
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.selectedStatus = order.status;
        this.history = order.statusHistory ?? [];
        this.loadingOrder = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.orderError = 'Erro ao carregar pedido.';
        this.loadingOrder = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadAttachments(id: string) {
    this.loadingAttachments = true;
    this.attachmentService.listAttachments(id).subscribe({
      next: (attachments) => {
        this.attachments = attachments;
        this.loadingAttachments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingAttachments = false;
        this.cdr.detectChanges();
      },
    });
  }

  onStatusChange(status: string) {
    this.selectedStatus = status as OrderStatus;
    this.attachmentRequiredError = null;

    if (status === OrderStatus.EM_TRANSPORTE && !this.hasPdfAttachment) {
      this.attachmentRequiredError =
        'É necessário anexar a nota fiscal (PDF) antes de mover o pedido para Em Transporte.';
      this.showConfirm = false;
      return;
    }

    this.showConfirm = status !== '' && status !== this.order?.status;
  }

  confirmStatusUpdate() {
    if (!this.order || !this.selectedStatus) return;
    this.loadingStatusUpdate = true;
    this.statusError = null;
    this.statusSuccess = null;
    this.orderService.updateStatus(this.order.id, this.selectedStatus as OrderStatus).subscribe({
      next: () => {
        this.loadingStatusUpdate = false;
        this.showConfirm = false;
        this.statusSuccess = 'Status atualizado. O cliente será notificado por e-mail.';
        this.cdr.detectChanges();
        this.loadOrder(this.order!.id);
        setTimeout(() => { this.statusSuccess = null; this.cdr.detectChanges(); }, 5000);
      },
      error: () => {
        this.statusError = 'Erro ao atualizar status. Tente novamente.';
        this.loadingStatusUpdate = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelStatusUpdate() {
    this.selectedStatus = this.order?.status ?? '';
    this.showConfirm = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.uploadError = 'Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.';
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.uploadError = null;
    this.uploadSuccess = null;
    this.uploadingFile = true;
    this.attachmentService.uploadAttachment(this.order!.id, file).subscribe({
      next: (attachment) => {
        this.attachments = [...this.attachments, attachment];
        this.uploadingFile = false;
        this.uploadSuccess = 'Arquivo anexado com sucesso.';
        input.value = '';

        if (this.selectedStatus === OrderStatus.EM_TRANSPORTE && this.attachmentRequiredError && this.hasPdfAttachment) {
          this.attachmentRequiredError = null;
          this.showConfirm = this.selectedStatus !== this.order?.status;
        }

        this.cdr.detectChanges();
        setTimeout(() => { this.uploadSuccess = null; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        this.uploadError = 'Erro ao fazer upload. Tente novamente.';
        this.uploadingFile = false;
        input.value = '';
        this.cdr.detectChanges();
      },
    });
  }

  downloadAttachment(attachment: Attachment) {
    this.downloadError = null;
    this.downloadingId = attachment.id;
    this.attachmentService.downloadFile(this.order!.id, attachment.id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        if (attachment.contentType === 'application/pdf') {
          window.open(objectUrl, '_blank');
          setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        } else {
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = attachment.filename;
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
        this.downloadingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.downloadError = 'Erro ao baixar o anexo. Tente novamente.';
        this.downloadingId = null;
        this.cdr.detectChanges();
      },
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
