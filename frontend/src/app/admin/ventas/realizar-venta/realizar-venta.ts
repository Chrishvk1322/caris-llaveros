import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PromocionService, Promocion } from '../../../core/promocion';
import { VentaService, VentaGenerada } from '../../../core/venta';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-realizar-venta',
  templateUrl: './realizar-venta.html',
})
export class RealizarVenta {
  private readonly fb = inject(FormBuilder);
  private readonly promocionService = inject(PromocionService);
  private readonly ventaService = inject(VentaService);

  readonly promociones = signal<Promocion[]>([]);
  readonly resultado = signal<VentaGenerada | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    promocionId: ['', Validators.required],
    nombreCompleto: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.minLength(6)]],
    detalle: [''],
  });

  constructor() {
    this.promocionService.listarTodas().subscribe((promociones) => this.promociones.set(promociones));
  }

  realizarVenta(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { promocionId, nombreCompleto, dni, detalle } = this.form.getRawValue();
    this.ventaService.realizarVenta(promocionId, nombreCompleto, dni, detalle || undefined).subscribe({
      next: (venta) => {
        this.resultado.set(venta);
        this.loading.set(false);
        this.form.reset();
      },
      error: () => {
        this.error.set('No se pudo registrar la venta');
        this.loading.set(false);
      },
    });
  }
}
