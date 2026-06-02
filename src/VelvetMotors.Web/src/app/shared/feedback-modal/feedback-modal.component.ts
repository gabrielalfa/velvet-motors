import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';

export type FeedbackType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-feedback-modal',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './feedback-modal.component.html',
  styleUrl: './feedback-modal.component.scss'
})
export class FeedbackModalComponent {
  @Input() message = '';
  @Input() type: FeedbackType = 'info';
  @Output() closed = new EventEmitter<void>();

  get title(): string {
    if (this.type === 'error') {
      return 'Atenção necessária';
    }

    if (this.type === 'success') {
      return 'Operação concluída';
    }

    return 'Aviso Velvet';
  }

  get icon(): string {
    if (this.type === 'error') {
      return 'lucide:circle-alert';
    }

    if (this.type === 'success') {
      return 'lucide:badge-check';
    }

    return 'lucide:info';
  }

  close(): void {
    this.closed.emit();
  }
}
