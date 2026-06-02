import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { apiConfig } from '../config/api.config';
import { VelvetAuthResult, VelvetOperationResult } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'velvet_admin_session';

  readonly token = signal<string | null>(null);
  readonly adminName = signal<string>('Gestor Velvet');
  readonly adminEmail = signal<string>('');
  readonly authenticated = signal(false);

  constructor() {
    const stored = this.readStoredSession();

    if (stored?.token) {
      this.token.set(stored.token);
      this.adminName.set(stored.name || 'Gestor Velvet');
      this.adminEmail.set(stored.email || '');
      this.authenticated.set(true);
    }
  }

  login(email: string, password: string): Observable<VelvetAuthResult> {
    return this.http.post<VelvetAuthResult>(apiConfig.velvetLoginUrl, { email, password }).pipe(
      tap((result) => {
        if (this.succeeded(result)) {
          this.storeSession(result);
        }
      }),
      catchError((error) => {
        console.error('Falha ao autenticar no painel Velvet.', error);
        return of({ success: false, message: 'Nao foi possivel conectar com a API de login.' });
      })
    );
  }

  validate(): Observable<boolean> {
    const token = this.token();

    if (!token) {
      return of(false);
    }

    return this.http.post<VelvetAuthResult>(apiConfig.velvetValidateTokenUrl, { token }).pipe(
      map((result) => {
        const valid = this.succeeded(result);

        if (!valid) {
          this.clearSession();
        }

        return valid;
      }),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): Observable<VelvetOperationResult> {
    const token = this.token();
    this.clearSession();

    if (!token) {
      return of({ success: true, message: 'Sessao encerrada.' });
    }

    return this.http.post<VelvetOperationResult>(apiConfig.velvetLogoutUrl, { token }).pipe(
      catchError(() => of({ success: true, message: 'Sessao local encerrada.' }))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<VelvetOperationResult> {
    const token = this.token();

    if (!token) {
      return of({ success: false, message: 'Sessao administrativa expirada.' });
    }

    return this.http.post<VelvetOperationResult>(apiConfig.velvetChangePasswordUrl, {
      token,
      currentPassword,
      newPassword
    }).pipe(
      catchError((error) => {
        console.error('Falha ao alterar senha administrativa.', error);
        return of({ success: false, message: 'Nao foi possivel alterar a senha agora.' });
      })
    );
  }

  message(result: VelvetAuthResult): string {
    return result.Message ?? result.message ?? '';
  }

  succeeded(result: VelvetAuthResult): boolean {
    return result.Success ?? result.success ?? false;
  }

  private storeSession(result: VelvetAuthResult): void {
    const token = result.Token ?? result.token ?? null;
    const name = result.Name ?? result.name ?? 'Gestor Velvet';
    const email = result.Email ?? result.email ?? '';

    if (!token) {
      return;
    }

    this.token.set(token);
    this.adminName.set(name);
    this.adminEmail.set(email);
    this.authenticated.set(true);

    localStorage.setItem(this.storageKey, JSON.stringify({ token, name, email }));
  }

  private clearSession(): void {
    this.token.set(null);
    this.adminName.set('Gestor Velvet');
    this.adminEmail.set('');
    this.authenticated.set(false);
    localStorage.removeItem(this.storageKey);
  }

  private readStoredSession(): { token: string; name: string; email: string } | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
