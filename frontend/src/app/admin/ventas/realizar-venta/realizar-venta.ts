import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { Producto, ProductoService } from '../../../core/producto';
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
  private readonly productoService = inject(ProductoService);
  private readonly ventaService = inject(VentaService);
  private readonly consulta$ = new Subject<string>();

  readonly promociones = signal<Promocion[]>([]);
  readonly resultado = signal<VentaGenerada | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly busquedaProducto = new FormControl('', { nonNullable: true });
  readonly resultadosProducto = signal<Producto[]>([]);
  readonly buscandoProducto = signal(false);
  readonly listaAbierta = signal(false);
  readonly productoSeleccionado = signal<Producto | null>(null);

  readonly form = this.fb.nonNullable.group({
    promocionId: ['', Validators.required],
    productoId: ['', Validators.required],
    nombreCompleto: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.minLength(6)]],
    detalle: [''],
  });

  constructor() {
    this.promocionService.listarTodas().subscribe((promociones) => this.promociones.set(promociones));

    this.busquedaProducto.valueChanges.pipe(takeUntilDestroyed()).subscribe((q) => {
      this.listaAbierta.set(true);
      this.consulta$.next(q);
    });

    this.consulta$
      .pipe(
        debounceTime(200),
        tap(() => this.buscandoProducto.set(true)),
        switchMap((q) => this.productoService.buscar(q.trim()).pipe(catchError(() => of([] as Producto[])))),
        takeUntilDestroyed(),
      )
      .subscribe((productos) => {
        this.resultadosProducto.set(productos);
        this.buscandoProducto.set(false);
      });
  }

  urlFoto(producto: Producto): string | null {
    return this.productoService.urlFoto(producto);
  }

  abrirLista(): void {
    this.listaAbierta.set(true);
    this.consulta$.next(this.busquedaProducto.value);
  }

  cerrarLista(): void {
    this.listaAbierta.set(false);
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado.set(producto);
    this.form.controls.productoId.setValue(producto.id);
    this.busquedaProducto.setValue('', { emitEvent: false });
    this.listaAbierta.set(false);
  }

  cambiarProducto(): void {
    this.productoSeleccionado.set(null);
    this.form.controls.productoId.setValue('');
  }

  realizarVenta(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { promocionId, productoId, nombreCompleto, dni, detalle } = this.form.getRawValue();
    this.ventaService
      .realizarVenta(promocionId, productoId, nombreCompleto, dni, detalle || undefined)
      .subscribe({
        next: (venta) => {
          this.resultado.set(venta);
          this.loading.set(false);
          this.form.reset();
          this.productoSeleccionado.set(null);
        },
        error: () => {
          this.error.set('No se pudo registrar la venta');
          this.loading.set(false);
        },
      });
  }
}
