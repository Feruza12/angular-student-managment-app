import { Component, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, TitleStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.sass'],
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzButtonModule, CommonModule, NzTypographyModule, SidebarComponent]
})
export class LayoutComponent implements OnInit {
  public isCollapsed = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  public userEmail: string = this.authService.user()?.email ?? 'no email found';

  constructor() {
    effect(() => {
      if (!this.authService.user()) {
        this.router.navigate(['sign-in']);
      }
    });
  }

  ngOnInit() {
  }

  logout(): void {
    this.authService.logout();
  }

}
