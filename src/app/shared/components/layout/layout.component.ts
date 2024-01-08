import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.sass'],
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzButtonModule, CommonModule, NzTypographyModule, SidebarComponent],
})
export class LayoutComponent {
  public isCollapsed = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  userEmail: string = this.authService.user()?.email ?? 'no email found';

  constructor() {
    effect(() => {
      if (!this.authService.user()) {
        this.router.navigate(['sign-in']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

}
