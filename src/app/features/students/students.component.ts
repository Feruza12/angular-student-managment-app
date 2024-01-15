import { Component, Signal, computed, inject } from '@angular/core';
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

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NzTypographyModule, NzTableModule, NzDividerModule, NzButtonModule, NzInputModule, FormsModule, CommonModule, NzPopconfirmModule, AddStudentModalComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.sass'
})
export class StudentsComponent {
  private studentsService: StudentService = inject(StudentService)

  public students: Signal<Student[]> = computed(() => this.studentsService.students())
  public loading: Signal<boolean> = computed(() => this.studentsService.loading())
  public editCache: { [key: string]: { edit: boolean; student: Student } } = {};

  public isShowAddStudentModal: boolean = false;
  public isAddLoading: boolean = false;

  constructor() {

  }

  public showAddStudentModal(): void {
    this.isShowAddStudentModal = true;
  }

  deleteStudent(id: string) {
    this.studentsService.deleteStudent$.next(id);
  }

}
