import { toProductoDto } from './producto.util.js';

describe('toProductoDto', () => {
  const base = { id: 'p1', codigo: 'A-1', nombre: 'Llavero', descripcion: null, estado: true };

  it('marca tieneFoto = true cuando hay tipo MIME guardado', () => {
    expect(toProductoDto({ ...base, fotoMime: 'image/png' }).tieneFoto).toBe(true);
  });

  it('marca tieneFoto = false cuando no hay foto', () => {
    expect(toProductoDto({ ...base, fotoMime: null }).tieneFoto).toBe(false);
  });

  it('no expone fotoMime en la respuesta', () => {
    expect(toProductoDto({ ...base, fotoMime: 'image/png' })).not.toHaveProperty('fotoMime');
  });
});
