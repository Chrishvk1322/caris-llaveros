import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Paginated } from './pagination';

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  tieneFoto: boolean;
  updatedAt: string;
}

@Service()
export class ProductoService {
  private readonly http = inject(HttpClient);

  listar(page: number, limit: number, q?: string) {
    return this.http.get<Paginated<Producto>>(`${environment.apiBaseUrl}/productos`, {
      params: { page, limit, ...(q ? { q } : {}) },
    });
  }

  /** Buscador de "Realizar venta": solo productos activos, tope fijo en el backend. */
  buscar(q: string) {
    return this.http.get<Producto[]>(`${environment.apiBaseUrl}/productos/buscar`, {
      params: q ? { q } : {},
    });
  }

  crear(datos: FormData) {
    return this.http.post<Producto>(`${environment.apiBaseUrl}/productos`, datos);
  }

  actualizar(id: string, datos: FormData) {
    return this.http.patch<Producto>(`${environment.apiBaseUrl}/productos/${id}`, datos);
  }

  cambiarEstado(id: string, estado: boolean) {
    return this.http.patch<Producto>(`${environment.apiBaseUrl}/productos/${id}/estado`, { estado });
  }

  /** La foto se sirve por una ruta pública (un <img> no puede mandar el Bearer); `v` invalida la caché al cambiarla. */
  urlFoto(producto: Pick<Producto, 'id' | 'tieneFoto' | 'updatedAt'>): string | null {
    if (!producto.tieneFoto) {
      return null;
    }
    return `${environment.apiBaseUrl}/productos/${producto.id}/foto?v=${encodeURIComponent(producto.updatedAt)}`;
  }
}
