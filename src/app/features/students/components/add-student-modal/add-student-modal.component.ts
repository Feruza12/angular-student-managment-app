import { Component } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-add-student-modal',
  standalone: true,
  imports: [NzModalModule],
  templateUrl: './add-student-modal.component.html',
  styleUrl: './add-student-modal.component.sass'
})
export class AddStudentModalComponent {
  isVisible = false;
  isOkLoading = false;

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isOkLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isOkLoading = false;
    }, 3000);
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}
