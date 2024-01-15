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

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NzTypographyModule, NzTableModule, NzDividerModule, NzButtonModule, NzInputModule, FormsModule, CommonModule, NzPopconfirmModule ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.sass'
})
export class StudentsComponent {
  private studentsService = inject(StudentService)

  public students: Signal<Student[]> = computed(() => this.studentsService.students())
  public loading: Signal<boolean> = computed(() => this.studentsService.loading())
  public editCache: { [key: string]: { edit: boolean; student: Student } } = {};

  constructor() {

  }

  addStudent() {

  }

  deleteStudent(id: string){

  }

  editStudent(id: string): void {
    // this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.students().findIndex(item => item.id === id);
    this.editCache[id] = {
      student: { ...this.students()[index] },
      edit: false
    };
  }

  saveEdit(id: string): void {
    const index = this.students().findIndex(item => item.id === id);
    Object.assign(this.students()[index], this.editCache[id].student);
    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.students().forEach(item => {
      this.editCache[item.id] = {
        edit: false,
        student: { ...item }
      };
    });
  }
}
