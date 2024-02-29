import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Student, StudentFormValue, ModalType, GroupSelect } from '../../../../shared/interfaces/students';
import { StudentService } from '../../../../shared/services/student.service';
import { GroupService } from '../../../../shared/services/group.service';

@Component({
  selector: 'app-student-modal',
  standalone: true,
  imports: [NzModalModule, NzFormModule, NzInputModule, ReactiveFormsModule, FormsModule, CommonModule, NzMessageModule, NzSelectModule],
  templateUrl: './student-modal.component.html',
  styleUrl: './student-modal.component.sass'
})
export class StudentModalComponent {
  @Input() public isVisible: boolean = false;
  @Input() public action: ModalType = "add";
  @Output() public visibleChanged = new EventEmitter<boolean>();

  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private studentService: StudentService = inject(StudentService);
  private groupService = inject(GroupService)
  private toast: NzMessageService = inject(NzMessageService)

  public groups: Signal<GroupSelect[]> = computed(() => this.groupService.groups().map(group => ({ name: group.title, value: group.title })));
  private student: Signal<Student | null> = this.studentService.selectedStudent;
  private error: Signal<string | null> = this.studentService.error;
  private updatedStudent: Signal<boolean> = computed(() => this.studentService.status() === 'updated');
  private addedStudent: Signal<boolean> = computed(() => this.studentService.status() === 'added');

  public isLoading: boolean = false;

  public validateForm: FormGroup<StudentFormValue> = this.fb.group({
    firstName: ['', [Validators.minLength(1), Validators.required]],
    lastName: ['', [Validators.minLength(1), Validators.required]],
    group: ['', [Validators.minLength(1), Validators.required]]
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
      if(this.updatedStudent() || this.addedStudent()){
        this.handleSuccess();
      }
    })
  }


  public handleSubmit(): void {
    if (this.validateForm.valid) {
      this.isLoading = true;
      if (this.action === 'add') {
        const student = { ...this.validateForm.getRawValue() }
        this.studentService.addStudent(student);
      } else {
        const student = { ...this.validateForm.getRawValue(), id: this.student()?.id }
        this.studentService.updateStudent(student);
      }    

    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public handleClose(): void {
    this.validateForm.reset();
    this.isVisible = false;
    this.visibleChanged.emit(this.isVisible)
  }

  public handleSuccess(): void {
    this.toast.success(`Successfully has been ${this.action}ed`, {
      nzDuration: 5000
    });
    this.handleClose();
    this.isLoading = false;
  }


}
