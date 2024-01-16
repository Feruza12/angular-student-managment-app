import { Component, EventEmitter, Input, Output, Signal, computed, effect, inject } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { StudentFormValue } from '../../../../shared/interfaces/students';
import { StudentService } from '../../../../shared/services/student.service';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-add-student-modal',
  standalone: true,
  imports: [NzModalModule, NzFormModule, NzInputModule, ReactiveFormsModule, FormsModule, CommonModule, NzMessageModule],
  templateUrl: './add-student-modal.component.html',
  styleUrl: './add-student-modal.component.sass'
})
export class AddStudentModalComponent {
  @Input() public isVisible: boolean = false;
  @Output() public visibleChanged = new EventEmitter<boolean>();

  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private studentService: StudentService = inject(StudentService);
  private toast: NzMessageService = inject(NzMessageService)

  private error: Signal<string | null> = computed(() => this.studentService.error())


  public isAddLoading: boolean = false;

  public validateForm: FormGroup<StudentFormValue> = this.fb.group({
    firstName: ['', [Validators.minLength(1), Validators.required]],
    lastName: ['', [Validators.minLength(1), Validators.required]],
    group: [0, [Validators.min(0), Validators.required]]
  });


  constructor() {
    effect(() => {
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public handleAdd(): void {
    this.isAddLoading = true;

    if (this.validateForm.valid) {
      const student = { ...this.validateForm.getRawValue() }

      this.studentService.addStudent$.next(student);

      this.isVisible = false;
      this.visibleChanged.emit(this.isVisible)
      this.isAddLoading = false;
      this.validateForm.reset();
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public handleCancel(): void {
    this.validateForm.reset();
    this.isVisible = false;
    this.visibleChanged.emit(this.isVisible)
  }
}
