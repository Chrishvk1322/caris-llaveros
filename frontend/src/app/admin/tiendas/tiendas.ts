import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TiendaService, Tienda } from '../../core/tienda';
import { Paginador } from '../../shared/paginador/paginador';

const LIMITE_PAGINA = 10;

@Component({
  imports: [ReactiveFormsModule, Paginador],
  selector: 'app-tiendas',
  templateUrl: './tiendas.html',
})
export class Tiendas {
  private readonly fb = inject(FormBuilder);
  private readonly tiendaService = inject(TiendaService);

  readonly tiendas = signal<Tienda[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = LIMITE_PAGINA;

  readonly editandoId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombreComercial: ['', [Validators.required, Validators.minLength(2)]],
    pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.tiendaService.listar(this.page(), this.limit).subscribe((res) => {
      this.tiendas.set(res.data);
      this.total.set(res.total);
    });
  }

  irAPagina(page: number): void {
    this.page.set(page);
    this.cargar();
  }

  editar(tienda: Tienda): void {
    this.editandoId.set(tienda.id);
    this.form.setValue({ nombreComercial: tienda.nombreComercial, pin: '' });
    this.form.controls.pin.setValidators([Validators.pattern(/^\d{4}$/)]);
    this.form.controls.pin.updateValueAndValidity();
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({ nombreComercial: '', pin: '' });
    this.form.controls.pin.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
    this.form.controls.pin.updateValueAndValidity();
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { nombreComercial, pin } = this.form.getRawValue();
    const editandoId = this.editandoId();

    const request$ = editandoId
      ? this.tiendaService.actualizar(editandoId, nombreComercial, pin || undefined)
      : this.tiendaService.crear(nombreComercial, pin);

    request$.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.loading.set(false);
        this.cargar();
      },
      error: () => {
        this.error.set(editandoId ? 'No se pudo actualizar la tienda' : 'No se pudo crear la tienda');
        this.loading.set(false);
      },
    });
  }

  cambiarEstado(tienda: Tienda): void {
    this.tiendaService.cambiarEstado(tienda.id, !tienda.estado).subscribe(() => this.cargar());
  }
}
