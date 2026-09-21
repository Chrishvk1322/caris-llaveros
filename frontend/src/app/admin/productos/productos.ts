import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Producto, ProductoService } from '../../core/producto';
import { Paginador } from '../../shared/paginador/paginador';

const LIMITE_PAGINA = 10;
const FOTO_MAX_BYTES = 1024 * 1024;
const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

function mensajeDeError(err: unknown, porDefecto: string): string {
  const mensaje = (err as HttpErrorResponse)?.error?.message;
  if (typeof mensaje === 'string') {
    return mensaje;
  }
  return Array.isArray(mensaje) ? mensaje.join('. ') : porDefecto;
}

@Component({
  imports: [ReactiveFormsModule, Paginador],
  selector: 'app-productos',
  templateUrl: './productos.html',
})
export class Productos {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly inputFoto = viewChild<ElementRef<HTMLInputElement>>('inputFoto');

  readonly productos = signal<Producto[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = LIMITE_PAGINA;

  readonly editando = signal<Producto | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly fotoArchivo = signal<File | null>(null);
  readonly fotoPreview = signal<string | null>(null);
  readonly quitarFoto = signal(false);
  readonly errorFoto = signal<string | null>(null);

  readonly busqueda = new FormControl('', { nonNullable: true });

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    descripcion: ['', Validators.maxLength(1000)],
  });

  constructor() {
    this.cargar();
    this.busqueda.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.cargar();
      });
  }

  urlFoto(producto: Producto): string | null {
    return this.productoService.urlFoto(producto);
  }

  /** Foto que se muestra en el formulario: la recién elegida, o la guardada si no se pidió quitarla. */
  fotoActual(): string | null {
    if (this.fotoPreview()) {
      return this.fotoPreview();
    }
    const editando = this.editando();
    return editando && !this.quitarFoto() ? this.urlFoto(editando) : null;
  }

  private cargar(): void {
    this.productoService
      .listar(this.page(), this.limit, this.busqueda.value.trim() || undefined)
      .subscribe((res) => {
        this.productos.set(res.data);
        this.total.set(res.total);
      });
  }

  irAPagina(page: number): void {
    this.page.set(page);
    this.cargar();
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }
    this.errorFoto.set(null);
    if (!FOTO_TIPOS.includes(archivo.type)) {
      this.errorFoto.set('La foto debe ser JPG, PNG o WebP');
      input.value = '';
      return;
    }
    if (archivo.size > FOTO_MAX_BYTES) {
      this.errorFoto.set('La foto no puede pesar más de 1 MB');
      input.value = '';
      return;
    }
    this.limpiarPreview();
    this.fotoArchivo.set(archivo);
    this.fotoPreview.set(URL.createObjectURL(archivo));
    this.quitarFoto.set(false);
  }

  quitarFotoActual(): void {
    this.limpiarPreview();
    this.fotoArchivo.set(null);
    this.quitarFoto.set(true);
    this.errorFoto.set(null);
    const input = this.inputFoto()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  private limpiarPreview(): void {
    const preview = this.fotoPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    this.fotoPreview.set(null);
  }

  editar(producto: Producto): void {
    this.editando.set(producto);
    this.form.setValue({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
    });
    this.reiniciarFoto();
    this.error.set(null);
  }

  cancelarEdicion(): void {
    this.editando.set(null);
    this.form.reset({ codigo: '', nombre: '', descripcion: '' });
    this.reiniciarFoto();
    this.error.set(null);
  }

  private reiniciarFoto(): void {
    this.limpiarPreview();
    this.fotoArchivo.set(null);
    this.quitarFoto.set(false);
    this.errorFoto.set(null);
    const input = this.inputFoto()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    const { codigo, nombre, descripcion } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('codigo', codigo.trim());
    datos.append('nombre', nombre.trim());
    datos.append('descripcion', descripcion.trim());
    const foto = this.fotoArchivo();
    if (foto) {
      datos.append('foto', foto);
    }

    const editando = this.editando();
    if (editando && this.quitarFoto()) {
      datos.append('quitarFoto', 'true');
    }

    const request$ = editando
      ? this.productoService.actualizar(editando.id, datos)
      : this.productoService.crear(datos);

    request$.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.loading.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(
          mensajeDeError(err, editando ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto'),
        );
        this.loading.set(false);
      },
    });
  }

  cambiarEstado(producto: Producto): void {
    this.productoService.cambiarEstado(producto.id, !producto.estado).subscribe(() => this.cargar());
  }
}
