import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Signal, computed, effect, inject } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { Student, StudentFormValue, StudentModalType } from '../../../../shared/interfaces/students';
import { StudentService } from '../../../../shared/services/student.service';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { Subject, finalize, takeUntil, tap } from 'rxjs';


@Component({
  selector: 'app-student-modal',
  standalone: true,
  imports: [NzModalModule, NzFormModule, NzInputModule, ReactiveFormsModule, FormsModule, CommonModule, NzMessageModule],
  templateUrl: './student-modal.component.html',
  styleUrl: './student-modal.component.sass'
})
export class StudentModalComponent implements OnInit, OnDestroy {
  @Input() public isVisible: boolean = false;
  @Input() public action: StudentModalType = "add";
  @Output() public visibleChanged = new EventEmitter<boolean>();

  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private studentService: StudentService = inject(StudentService);
  private toast: NzMessageService = inject(NzMessageService)
  private student: Signal<Student | null> = computed(() => this.studentService.selectedStudent());

  private onDestroy$: Subject<void> = new Subject();

  private error: Signal<string | null> = computed(() => this.studentService.error())


  public isLoading: boolean = false;

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

  public ngOnInit() {
    this.studentService.addStudent().pipe(
      takeUntil(this.onDestroy$),
      tap({
        next: () => this.handleSuccess()
      }),
    ).subscribe();

    this.studentService.updateStudent().pipe(
      takeUntil(this.onDestroy$),
      tap({
        next: () => this.handleSuccess()
      }),
    ).subscribe();
  }

  public handleSubmit(): void {
    this.isLoading = true;

    if (this.validateForm.valid) {
      if (this.action === 'add') {
        const student = { ...this.validateForm.getRawValue() }
        this.studentService.addStudentSubject$.next(student);

      } else {
        const student = { ...this.validateForm.getRawValue(), id: this.student()?.id }
        this.studentService.updateStudentSubject$.next(student);
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
    this.handleClose();
    this.isLoading = false;
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
