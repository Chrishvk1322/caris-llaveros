import { calcularEstadoCanje } from './estado-canje.util.js';

describe('calcularEstadoCanje', () => {
  it('es PENDIENTE sin canjes realizados', () => {
    expect(calcularEstadoCanje(0, 3)).toEqual({ estado: 'PENDIENTE', canjesRestantes: 3 });
  });

  it('es PARCIAL con canjes usados pero no todos', () => {
    expect(calcularEstadoCanje(1, 3)).toEqual({ estado: 'PARCIAL', canjesRestantes: 2 });
  });

  it('es AGOTADO al alcanzar el límite', () => {
    expect(calcularEstadoCanje(3, 3)).toEqual({ estado: 'AGOTADO', canjesRestantes: 0 });
  });

  it('nunca devuelve canjes restantes negativos', () => {
    expect(calcularEstadoCanje(5, 3)).toEqual({ estado: 'AGOTADO', canjesRestantes: 0 });
  });

  it('con límite 1, un solo canje agota la venta', () => {
    expect(calcularEstadoCanje(1, 1)).toEqual({ estado: 'AGOTADO', canjesRestantes: 0 });
  });
});
