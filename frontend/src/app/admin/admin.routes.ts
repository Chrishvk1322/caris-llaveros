import { Routes } from '@angular/router';
import { authGuard } from '../core/auth-guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: 'qr',
        loadComponent: () => import('./qr/qr').then((m) => m.Qr),
      },
      {
        path: 'tiendas',
        loadComponent: () => import('./tiendas/tiendas').then((m) => m.Tiendas),
      },
      {
        path: 'promociones',
        loadComponent: () => import('./promociones/promociones').then((m) => m.Promociones),
      },
      {
        path: 'productos',
        loadComponent: () => import('./productos/productos').then((m) => m.Productos),
      },
      {
        path: 'ventas',
        loadComponent: () => import('./ventas/ventas').then((m) => m.Ventas),
      },
      {
        path: 'ventas/nueva',
        loadComponent: () =>
          import('./ventas/realizar-venta/realizar-venta').then((m) => m.RealizarVenta),
      },
      {
        path: 'ventas/:id',
        loadComponent: () =>
          import('./ventas/venta-detalle/venta-detalle').then((m) => m.VentaDetalle),
      },
      { path: '', redirectTo: 'tiendas', pathMatch: 'full' },
    ],
  },
];
