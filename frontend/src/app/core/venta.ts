import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Paginated } from './pagination';

export type EstadoCanje = 'PENDIENTE' | 'PARCIAL' | 'AGOTADO';

export interface VentaGenerada {
  id: string;
  tokenUrl: string;
  url: string;
  detalle: string | null;
  cliente: { nombreCompleto: string; dni: string };
}

export interface VentaResumen {
  id: string;
  tokenUrl: string;
  estado: EstadoCanje;
  canjesRealizados: number;
  canjesRestantes: number;
  createdAt: string;
  cliente: { nombreCompleto: string; dni: string };
  promocion: { titulo: string; limiteCanjes: number; tienda: { nombreComercial: string } };
}

export interface VentaDetalle {
  id: string;
  tokenUrl: string;
  estado: EstadoCanje;
  canjesRealizados: number;
  canjesRestantes: number;
  createdAt: string;
  detalle: string | null;
  historialCanjes: { fecha: string }[];
  cliente: { nombreCompleto: string; dni: string };
  promocion: {
    titulo: string;
    descripcion: string | null;
    limiteCanjes: number;
    tienda: { nombreComercial: string };
  };
}

@Service()
export class VentaService {
  private readonly http = inject(HttpClient);

  realizarVenta(promocionId: string, nombreCompleto: string, dni: string, detalle?: string) {
    return this.http.post<VentaGenerada>(`${environment.apiBaseUrl}/ventas`, {
      promocionId,
      nombreCompleto,
      dni,
      detalle,
    });
  }

  listar(page: number, limit: number) {
    return this.http.get<Paginated<VentaResumen>>(`${environment.apiBaseUrl}/ventas`, {
      params: { page, limit },
    });
  }

  obtenerDetalle(id: string) {
    return this.http.get<VentaDetalle>(`${environment.apiBaseUrl}/ventas/${id}`);
  }

  reactivar(id: string) {
    return this.http.patch<VentaDetalle>(`${environment.apiBaseUrl}/ventas/${id}/reactivar`, {});
  }
}
