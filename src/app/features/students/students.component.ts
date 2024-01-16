import { Component, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { StudentService } from '../../shared/services/student.service';
import { Student } from '../../shared/interfaces/students';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AddStudentModalComponent } from './components/add-student-modal/add-student-modal.component';
import { EditStudentModalComponent } from './components/edit-student-modal/edit-student-modal.component';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NzTypographyModule, NzTableModule, NzDividerModule, NzButtonModule, NzInputModule, FormsModule, CommonModule, NzMessageModule, NzPopconfirmModule, AddStudentModalComponent, EditStudentModalComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.sass'
})
export class StudentsComponent {
  private studentsService: StudentService = inject(StudentService)
  private toast: NzMessageService = inject(NzMessageService)

  public students: Signal<Student[]> = computed(() => this.studentsService.students())
  public loading: Signal<boolean> = computed(() => this.studentsService.loading())
  private error: Signal<string | null> = computed(() => this.studentsService.error())

  public isShowAddStudentModal: boolean = false;
  public isShowUpdateStudentModal: boolean = false;

  constructor() {
    effect(() => {
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public showAddStudentModal(): void {
    this.isShowAddStudentModal = true;
  }

  public showUpdateStudentModal(student: Student): void {
    this.studentsService.selectStudent$.next(student);
    this.isShowUpdateStudentModal = true;
  }

  public deleteStudent(id: string): void {
    this.studentsService.deleteStudent$.next(id);
  }

}
