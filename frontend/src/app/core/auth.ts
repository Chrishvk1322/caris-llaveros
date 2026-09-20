import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  accessToken: string;
  usuario: { id: number; email: string; rol: string };
}

const TOKEN_KEY = 'llaveros_token';

@Service()
export class Auth {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(this.readToken() !== null);

  private readToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.readToken();
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password }),
    );
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.isAuthenticated.set(false);
  }
}
