import { Component } from '@angular/core';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NzTypographyModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {

}
