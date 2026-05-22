import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-floating-actions',
  templateUrl: './floating-actions.component.html',
  styleUrl: './floating-actions.component.scss'
})
export class FloatingActionsComponent {
  readonly themeService = inject(ThemeService);
}
