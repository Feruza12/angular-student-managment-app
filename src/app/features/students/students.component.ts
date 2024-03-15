import { Component, OnDestroy, OnInit, Signal, WritableSignal, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';

import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { StudentService } from '../../shared/services/student.service';
import { ActionStudentModal, ModalType, Student } from '../../shared/interfaces/students';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { StudentModalComponent } from './components/student-modal/student-modal.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NzTypographyModule, NzTableModule, NzDividerModule, NzButtonModule, NzInputModule, FormsModule, NzMessageModule, NzPopconfirmModule, StudentModalComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.sass'
})
export class StudentsComponent implements OnInit, OnDestroy {
  private studentsService: StudentService = inject(StudentService)
  private toast: NzMessageService = inject(NzMessageService)

  public isShowStudentModal: boolean = false;

  public students: Signal<Student[]> = this.studentsService.students
  public loading: Signal<boolean> = this.studentsService.loading
  private error: Signal<string | null> = this.studentsService.error
  public actionModal: WritableSignal<ModalType> = signal("add");

  private onDestroy$: Subject<void> = new Subject();

  constructor() {
    effect(() => {
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public ngOnInit(): void {
    this.studentsService.getStudents().pipe(takeUntil(this.onDestroy$)).subscribe();
  }

  public showStudentModal({ action, student }: ActionStudentModal): void {
    this.isShowStudentModal = true;
    this.actionModal.set(action);
    if (student) {
      this.studentsService.selectStudent(student);
    }
  }
  
  public deleteStudent(id: string): void {
    this.studentsService.deleteStudent().pipe(takeUntil(this.onDestroy$)).subscribe();
    this.studentsService.deleteStudentSubject$.next(id);
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
