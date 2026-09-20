import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TiendaService, Tienda } from '../../core/tienda';
import { PromocionService, Promocion } from '../../core/promocion';
import { Paginador } from '../../shared/paginador/paginador';

const LIMITE_PAGINA = 10;

@Component({
  imports: [ReactiveFormsModule, Paginador],
  selector: 'app-promociones',
  templateUrl: './promociones.html',
})
export class Promociones {
  private readonly fb = inject(FormBuilder);
  private readonly promocionService = inject(PromocionService);
  private readonly tiendaService = inject(TiendaService);

  readonly promociones = signal<Promocion[]>([]);
  readonly tiendas = signal<Tienda[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = LIMITE_PAGINA;

  readonly editandoId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    tiendaId: ['', Validators.required],
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    limiteCanjes: [1, [Validators.required, Validators.min(1)]],
    descripcion: [''],
  });

  constructor() {
    this.cargar();
    this.tiendaService.listarTodas().subscribe((tiendas) => this.tiendas.set(tiendas));
  }

  private cargar(): void {
    this.promocionService.listar(this.page(), this.limit).subscribe((res) => {
      this.promociones.set(res.data);
      this.total.set(res.total);
    });
  }

  irAPagina(page: number): void {
    this.page.set(page);
    this.cargar();
  }

  editar(promocion: Promocion): void {
    this.editandoId.set(promocion.id);
    this.form.setValue({
      tiendaId: promocion.tiendaId,
      titulo: promocion.titulo,
      limiteCanjes: promocion.limiteCanjes,
      descripcion: promocion.descripcion ?? '',
    });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({ tiendaId: '', titulo: '', limiteCanjes: 1, descripcion: '' });
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { tiendaId, titulo, limiteCanjes, descripcion } = this.form.getRawValue();
    const editandoId = this.editandoId();

    const request$ = editandoId
      ? this.promocionService.actualizar(
          editandoId,
          tiendaId,
          titulo,
          limiteCanjes,
          descripcion || undefined,
        )
      : this.promocionService.crear(tiendaId, titulo, limiteCanjes, descripcion || undefined);

    request$.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.loading.set(false);
        this.cargar();
      },
      error: () => {
        this.error.set(
          editandoId ? 'No se pudo actualizar la promoción' : 'No se pudo crear la promoción',
        );
        this.loading.set(false);
      },
    });
  }

  cambiarEstado(promocion: Promocion): void {
    this.promocionService
      .cambiarEstado(promocion.id, !promocion.estado)
      .subscribe(() => this.cargar());
  }
}
