// La foto (bytea) nunca se selecciona en listados ni detalles: pesa y se sirve aparte
// desde GET /productos/:id/foto. Solo se expone si existe (`tieneFoto`) y `updatedAt`
// para que el frontend invalide la caché del navegador al cambiarla.
export const SELECT_PRODUCTO = {
  id: true,
  codigo: true,
  nombre: true,
  descripcion: true,
  fotoMime: true,
  estado: true,
  updatedAt: true,
} as const;

interface ProductoConMime {
  fotoMime: string | null;
}

export function toProductoDto<T extends ProductoConMime>(producto: T) {
  const { fotoMime, ...resto } = producto;
  return { ...resto, tieneFoto: fotoMime !== null };
}
