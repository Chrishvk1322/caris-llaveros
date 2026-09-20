import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoCanje } from './venta';

export interface ResolucionCanje {
  estado: EstadoCanje;
  canjesRestantes: number;
  limiteCanjes: number;
  promocion: {
    titulo: string;
    descripcion: string | null;
    fechaVencimiento: string | null;
  };
  tienda: string;
  cliente: { nombreCompleto: string; dni: string } | null;
}

export interface VentaBuscada {
  tokenUrl: string;
  estado: EstadoCanje;
  canjesRestantes: number;
  limiteCanjes: number;
  createdAt: string;
  promocion: {
    titulo: string;
    descripcion: string | null;
    fechaVencimiento: string | null;
  };
  tienda: string;
}

export interface BusquedaDni {
  cliente: { nombreCompleto: string; dni: string };
  ventas: VentaBuscada[];
}

const REQUEST_TIMEOUT_MS = 5000;

@Service()
export class CanjeService {
  private readonly http = inject(HttpClient);

  buscarPorDni(dni: string) {
    return this.http
      .get<BusquedaDni>(`${environment.apiBaseUrl}/canje/buscar`, { params: { dni } })
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  resolverEstado(token: string) {
    return this.http
      .get<ResolucionCanje>(`${environment.apiBaseUrl}/canje/${token}`)
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }

  aplicarPin(token: string, pin: string) {
    return this.http
      .post<Pick<ResolucionCanje, 'estado' | 'canjesRestantes' | 'limiteCanjes'>>(
        `${environment.apiBaseUrl}/canje/${token}/aplicar`,
        { pin },
      )
      .pipe(timeout(REQUEST_TIMEOUT_MS));
  }
}
