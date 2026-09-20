import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface QrConfig {
  url: string;
  updatedAt: string;
}

@Service()
export class QrService {
  private readonly http = inject(HttpClient);

  obtener() {
    return this.http.get<QrConfig | null>(`${environment.apiBaseUrl}/qr`);
  }

  guardar(url: string) {
    return this.http.put<QrConfig>(`${environment.apiBaseUrl}/qr`, { url });
  }
}
