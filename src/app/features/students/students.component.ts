import { Component, OnDestroy, OnInit, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
export class StudentsComponent {
  private studentsService: StudentService = inject(StudentService)
  private toast: NzMessageService = inject(NzMessageService)

  public students: Signal<Student[]> = computed(() => {
    try {
      return this.studentsService.students()
    } catch (e) {
      this.toast.error(typeof e === 'string' ? e : 'Error', {
        nzDuration: 5000
      })
      return [];
    }
  })
  public loading: Signal<boolean> = this.studentsService.loading;
  private deleted: Signal<boolean> = computed(() => this.studentsService.status() === 'deleted');
  private error: Signal<string | null> = this.studentsService.error;

  public actionModal: WritableSignal<ModalType> = signal("add");
  public isShowStudentModal: boolean = false;


  constructor() {
    effect(() => {
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }

      if (this.deleted()) {
        this.toast.success('Has been deleted!' || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public showStudentModal({ action, student }: ActionStudentModal): void {
    this.isShowStudentModal = true;
    this.actionModal.set(action);
    if (student) {
      this.studentsService.selectStudent(student);
    }
  }

  public deleteStudent(id: string): void {
    this.studentsService.deleteStudent(id)
  }

}
