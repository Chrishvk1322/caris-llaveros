import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VentaDetalle as VentaDetalleModel, VentaService } from '../../../core/venta';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-venta-detalle',
  templateUrl: './venta-detalle.html',
})
export class VentaDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly ventaService = inject(VentaService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  readonly venta = signal<VentaDetalleModel | null>(null);
  readonly reactivando = signal(false);
  readonly confirmandoReactivar = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.ventaService.obtenerDetalle(this.id).subscribe((venta) => this.venta.set(venta));
  }

  pedirConfirmacion(): void {
    this.confirmandoReactivar.set(true);
  }

  cancelarConfirmacion(): void {
    this.confirmandoReactivar.set(false);
  }

  reactivar(): void {
    this.reactivando.set(true);
    this.error.set(null);
    this.ventaService.reactivar(this.id).subscribe({
      next: (venta) => {
        this.venta.set(venta);
        this.reactivando.set(false);
        this.confirmandoReactivar.set(false);
      },
      error: () => {
        this.error.set('No se pudo reactivar el canje');
        this.reactivando.set(false);
      },
    });
  }
}
