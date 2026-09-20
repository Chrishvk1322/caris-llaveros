import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paginated } from './pagination';

export interface Tienda {
  id: string;
  nombreComercial: string;
  estado: boolean;
}

const LIMITE_DROPDOWN = 100;

@Service()
export class TiendaService {
  private readonly http = inject(HttpClient);

  listar(page: number, limit: number) {
    return this.http.get<Paginated<Tienda>>(`${environment.apiBaseUrl}/tiendas`, {
      params: { page, limit },
    });
  }

  /** Trae todas (hasta LIMITE_DROPDOWN) para poblar selectores; no reemplaza el listado paginado del CRUD. */
  listarTodas() {
    return this.http
      .get<Paginated<Tienda>>(`${environment.apiBaseUrl}/tiendas`, {
        params: { page: 1, limit: LIMITE_DROPDOWN },
      })
      .pipe(map((res) => res.data));
  }

  crear(nombreComercial: string, pin: string) {
    return this.http.post<Tienda>(`${environment.apiBaseUrl}/tiendas`, { nombreComercial, pin });
  }

  actualizar(id: string, nombreComercial: string, pin?: string) {
    return this.http.patch<Tienda>(`${environment.apiBaseUrl}/tiendas/${id}`, {
      nombreComercial,
      ...(pin ? { pin } : {}),
    });
  }

  cambiarEstado(id: string, estado: boolean) {
    return this.http.patch<Tienda>(`${environment.apiBaseUrl}/tiendas/${id}/estado`, { estado });
  }
}
