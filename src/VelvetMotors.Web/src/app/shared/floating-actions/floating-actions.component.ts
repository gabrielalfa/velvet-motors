import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-floating-actions',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './floating-actions.component.html',
  styleUrl: './floating-actions.component.scss'
})
export class FloatingActionsComponent {
  readonly themeService = inject(ThemeService);
}
