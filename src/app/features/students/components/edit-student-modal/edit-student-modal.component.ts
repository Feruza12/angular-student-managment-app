import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, Signal, computed, effect, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, NonNullableFormBuilder, FormGroup, Validators } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { StudentService } from '../../../../shared/services/student.service';
import { Student, StudentFormValue } from '../../../../shared/interfaces/students';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-edit-student-modal',
  standalone: true,
  imports: [NzModalModule, NzFormModule, NzInputModule, ReactiveFormsModule, FormsModule, CommonModule, NzMessageModule],
  templateUrl: './edit-student-modal.component.html',
  styleUrl: './edit-student-modal.component.sass'
})
export class EditStudentModalComponent {
  @Input() public isVisible: boolean = false;
  @Output() public visibleChanged = new EventEmitter<boolean>();

  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private studentService: StudentService = inject(StudentService);
  private toast: NzMessageService = inject(NzMessageService)

  private student: Signal<Student | null> = computed(() => this.studentService.selectedStudent());
  private error: Signal<string | null> = computed(() => this.studentService.error())

  public isUpdateLoading: boolean = false;

  public validateForm: FormGroup<StudentFormValue> = this.fb.group({
    firstName: ['', [Validators.minLength(1), Validators.required]],
    lastName: ['', [Validators.minLength(1), Validators.required]],
    group: [0, [Validators.min(0), Validators.required]]
  });

  constructor() {
    effect(() => {
      if (this.student()) {
        this.validateForm.patchValue({ ...this.student() })
      }
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public handleEdit(): void {
    this.isUpdateLoading = true;

    if (this.validateForm.valid) {
      const student = { ...this.validateForm.getRawValue(), id: this.student()?.id}
      this.studentService.updateStudent$.next(student);

      this.isVisible = false;
      this.visibleChanged.emit(this.isVisible)
      this.validateForm.reset();
      this.isUpdateLoading = false;
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
