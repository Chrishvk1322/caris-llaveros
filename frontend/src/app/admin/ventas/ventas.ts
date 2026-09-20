import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VentaService, VentaResumen } from '../../core/venta';
import { Paginador } from '../../shared/paginador/paginador';

const LIMITE_PAGINA = 10;

@Component({
  imports: [RouterLink, Paginador, DatePipe],
  selector: 'app-ventas',
  templateUrl: './ventas.html',
})
export class Ventas {
  private readonly ventaService = inject(VentaService);

  readonly ventas = signal<VentaResumen[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = LIMITE_PAGINA;

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.ventaService.listar(this.page(), this.limit).subscribe((res) => {
      this.ventas.set(res.data);
      this.total.set(res.total);
    });
  }

  irAPagina(page: number): void {
    this.page.set(page);
    this.cargar();
  }
}
