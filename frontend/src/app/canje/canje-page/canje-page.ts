import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, retry } from 'rxjs';
import { CanjeService, ResolucionCanje } from '../../core/canje';
import { Logo } from '../../shared/logo/logo';

type Vista = 'cargando' | 'agotado' | 'disponible' | 'exito' | 'error-red' | 'no-encontrado';

@Component({
  imports: [Logo, RouterLink],
  selector: 'app-canje-page',
  templateUrl: './canje-page.html',
})
export class CanjePage {
  private readonly route = inject(ActivatedRoute);
  private readonly canjeService = inject(CanjeService);

  private readonly token = this.route.snapshot.paramMap.get('token')!;

  readonly vista = signal<Vista>('cargando');
  readonly estado = signal<ResolucionCanje | null>(null);
  readonly pin = signal('');
  readonly aplicando = signal(false);
  readonly errorAplicar = signal<string | null>(null);

  constructor() {
    this.cargarEstado();
  }

  cargarEstado(): void {
    this.vista.set('cargando');
    this.canjeService
      .resolverEstado(this.token)
      .pipe(
        retry(1),
        catchError((err) => {
          this.vista.set(err?.status === 404 ? 'no-encontrado' : 'error-red');
          return of(null);
        }),
      )
      .subscribe((estado) => {
        if (!estado) {
          return;
        }
        this.estado.set(estado);
        this.vista.set(estado.estado === 'AGOTADO' ? 'agotado' : 'disponible');
      });
  }

  presionar(digito: string): void {
    if (this.pin().length >= 4) {
      return;
    }
    this.pin.set(this.pin() + digito);
  }

  borrar(): void {
    this.pin.set(this.pin().slice(0, -1));
  }

  aplicar(): void {
    if (this.pin().length !== 4 || this.aplicando()) {
      return;
    }
    this.aplicando.set(true);
    this.errorAplicar.set(null);

    this.canjeService
      .aplicarPin(this.token, this.pin())
      .pipe(
        catchError((err) => {
          if (err?.name === 'TimeoutError') {
            this.errorAplicar.set('La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.');
          } else if (err?.status === 429) {
            this.errorAplicar.set('Demasiados intentos fallidos. Espera unos minutos.');
          } else {
            this.errorAplicar.set(err?.error?.message ?? 'PIN incorrecto');
          }
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        this.aplicando.set(false);
        if (resultado) {
          const actual = this.estado();
          if (actual) {
            this.estado.set({ ...actual, ...resultado });
          }
          this.vista.set('exito');
        } else {
          this.pin.set('');
        }
      });
  }
}
