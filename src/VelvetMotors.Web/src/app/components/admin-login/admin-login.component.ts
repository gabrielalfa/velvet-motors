import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly email = signal('admin@velvetmotors.com.br');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  login(): void {
    this.errorMessage.set('');

    if (!this.email().trim() || !this.password().trim()) {
      this.errorMessage.set('Informe e-mail e senha para acessar o painel.');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.email(), this.password()).subscribe((result) => {
      this.loading.set(false);

      if (this.authService.succeeded(result)) {
        this.router.navigateByUrl('/admin');
        return;
      }

      this.errorMessage.set(this.authService.message(result) || 'Nao foi possivel entrar no painel.');
    });
  }
}
