import { Component } from '@angular/core';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [NzTypographyModule ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.sass'
})
export class PageNotFoundComponent {

}
