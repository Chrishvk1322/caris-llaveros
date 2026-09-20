import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/auth';
import { Logo } from '../../shared/logo/logo';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Logo],
  selector: 'app-shell',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/admin/login');
  }
}
