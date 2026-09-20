import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paginated } from './pagination';

export interface Promocion {
  id: string;
  tiendaId: string;
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: string | null;
  estado: boolean;
  limiteCanjes: number;
  tienda?: { id: string; nombreComercial: string };
}

const LIMITE_DROPDOWN = 100;

@Service()
export class PromocionService {
  private readonly http = inject(HttpClient);

  listar(page: number, limit: number) {
    return this.http.get<Paginated<Promocion>>(`${environment.apiBaseUrl}/promociones`, {
      params: { page, limit },
    });
  }

  /** Trae todas (hasta LIMITE_DROPDOWN) para poblar selectores; no reemplaza el listado paginado del CRUD. */
  listarTodas() {
    return this.http
      .get<Paginated<Promocion>>(`${environment.apiBaseUrl}/promociones`, {
        params: { page: 1, limit: LIMITE_DROPDOWN },
      })
      .pipe(map((res) => res.data));
  }

  crear(tiendaId: string, titulo: string, limiteCanjes: number, descripcion?: string) {
    return this.http.post<Promocion>(`${environment.apiBaseUrl}/promociones`, {
      tiendaId,
      titulo,
      limiteCanjes,
      descripcion,
    });
  }

  actualizar(
    id: string,
    tiendaId: string,
    titulo: string,
    limiteCanjes: number,
    descripcion?: string,
  ) {
    return this.http.patch<Promocion>(`${environment.apiBaseUrl}/promociones/${id}`, {
      tiendaId,
      titulo,
      limiteCanjes,
      descripcion,
    });
  }

  cambiarEstado(id: string, estado: boolean) {
    return this.http.patch<Promocion>(`${environment.apiBaseUrl}/promociones/${id}/estado`, {
      estado,
    });
  }
}
