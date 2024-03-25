import { Component } from '@angular/core';

import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NzTypographyModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {

}
