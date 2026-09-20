import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import * as QRCode from 'qrcode';
import { QrConfig, QrService } from '../../core/qr';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-qr',
  templateUrl: './qr.html',
})
export class Qr {
  private readonly fb = inject(FormBuilder);
  private readonly qrService = inject(QrService);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');

  readonly guardado = signal<QrConfig | null>(null);
  readonly confirmandoNuevo = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    this.qrService.obtener().subscribe((config) => {
      if (config) {
        this.guardado.set(config);
        this.form.setValue({ url: config.url });
      }
    });

    effect(() => {
      const config = this.guardado();
      const canvas = this.canvasRef()?.nativeElement;
      if (config && canvas) {
        QRCode.toCanvas(canvas, config.url, { width: 280, margin: 2 }).catch(() =>
          this.error.set('No se pudo generar el código QR'),
        );
      }
    });
  }

  intentarGenerar(): void {
    if (this.form.invalid) {
      return;
    }
    // Si ya existe un QR guardado, primero se pide confirmación antes de reemplazarlo.
    if (this.guardado()) {
      this.confirmandoNuevo.set(true);
      return;
    }
    this.guardarQr();
  }

  cancelarNuevo(): void {
    this.confirmandoNuevo.set(false);
  }

  confirmarNuevo(): void {
    this.confirmandoNuevo.set(false);
    this.guardarQr();
  }

  private guardarQr(): void {
    this.loading.set(true);
    this.error.set(null);
    const url = this.form.getRawValue().url.trim();
    this.qrService.guardar(url).subscribe({
      next: (config) => {
        this.guardado.set(config);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo guardar el enlace');
        this.loading.set(false);
      },
    });
  }

  descargar(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      return;
    }
    const enlace = document.createElement('a');
    enlace.download = 'caris-qr.png';
    enlace.href = canvas.toDataURL('image/png');
    enlace.click();
  }
}
