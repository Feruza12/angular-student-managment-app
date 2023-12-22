import { Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { SidebarComponent } from '../sidebar/sidebar.component';
@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.sass'],
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzButtonModule, CommonModule, NzTypographyModule, SidebarComponent],
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;
  authService = inject(AuthService);
  private router = inject(Router);
  constructor() {
    effect(() => {
      if (!this.authService.user()) {
        this.router.navigate(['sign-in']);
      }
    });
  }

  ngOnInit() {

  }

}
