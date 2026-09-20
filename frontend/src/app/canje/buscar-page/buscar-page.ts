import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BusquedaDni, CanjeService } from '../../core/canje';
import { Logo } from '../../shared/logo/logo';

type Vista = 'inicial' | 'buscando' | 'resultados' | 'no-encontrado' | 'error-red';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Logo],
  selector: 'app-buscar-page',
  templateUrl: './buscar-page.html',
})
export class BuscarPage {
  private readonly fb = inject(FormBuilder);
  private readonly canjeService = inject(CanjeService);

  readonly vista = signal<Vista>('inicial');
  readonly resultado = signal<BusquedaDni | null>(null);

  readonly form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.minLength(6)]],
  });

  buscar(): void {
    if (this.form.invalid) {
      return;
    }
    this.vista.set('buscando');
    const { dni } = this.form.getRawValue();

    this.canjeService
      .buscarPorDni(dni)
      .pipe(
        catchError((err) => {
          this.vista.set(err?.status === 404 ? 'no-encontrado' : 'error-red');
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        if (!resultado) {
          return;
        }
        this.resultado.set(resultado);
        this.vista.set('resultados');
      });
  }

  buscarOtroDni(): void {
    this.vista.set('inicial');
    this.resultado.set(null);
    this.form.reset({ dni: '' });
  }
}
