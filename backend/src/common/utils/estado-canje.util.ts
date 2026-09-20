export type EstadoCanje = 'PENDIENTE' | 'PARCIAL' | 'AGOTADO';

export interface ResumenCanje {
  estado: EstadoCanje;
  canjesRestantes: number;
}

export function calcularEstadoCanje(canjesRealizados: number, limiteCanjes: number): ResumenCanje {
  const canjesRestantes = Math.max(0, limiteCanjes - canjesRealizados);
  const estado: EstadoCanje =
    canjesRealizados === 0 ? 'PENDIENTE' : canjesRestantes === 0 ? 'AGOTADO' : 'PARCIAL';
  return { estado, canjesRestantes };
}
