import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Signal, computed, effect, inject } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Subject, takeUntil, tap } from 'rxjs';

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
export class StudentModalComponent implements OnInit, OnDestroy {
  @Input() public isVisible: boolean = false;
  @Input() public action: ModalType = "add";
  @Output() public visibleChanged = new EventEmitter<boolean>();

  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private studentService: StudentService = inject(StudentService);
  private groupService = inject(GroupService)
  private toast: NzMessageService = inject(NzMessageService)

  public groups: Signal<GroupSelect[]> = computed(() => this.groupService.groups().map(group => ({ name: group.title, value: group.title })));

  private student: Signal<Student | null> =  this.studentService.selectedStudent;

  private onDestroy$: Subject<void> = new Subject();

  private error: Signal<string | null> = this.studentService.error;


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
    })
  }

  public ngOnInit(): void {
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

    this.groupService.getGroups().pipe(
      takeUntil(this.onDestroy$)
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
    this.toast.success(`Successfully has been ${this.action}ed`, {
      nzDuration: 5000
    });
    this.handleClose();
    this.isLoading = false;
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
