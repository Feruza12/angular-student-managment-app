import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Observable, defer, } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';

import { Firestore, collection, orderBy, query, addDoc, updateDoc, serverTimestamp, deleteDoc, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';

import { FIRESTORE } from '../../app.config';
import { Student } from '../interfaces/students';
import { ErrorService } from './error.service';


@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore: Firestore = inject(FIRESTORE);
  private errorService = inject(ErrorService)
  public selectedStudent: WritableSignal<Student | null> = signal(null);
  public error: WritableSignal<string | null> = signal(null);
  public loading: WritableSignal<boolean> = signal<boolean>(false);

  private students$ = this.fetchStudents().pipe(
    tap(() => this.loading.set(false)),
    shareReplay(1),
    catchError((err) => {
      this.error.set(err)
      return this.errorService.handleError(err)
    }),
  )

  public students: Signal<Student[]> = toSignal(this.students$, { initialValue: [] });

  public studentCount: Signal<Record<string, number>> = computed(() => {
    const studentCount = this.students().reduce((accumulator, student) => {
      if (accumulator.hasOwnProperty(student.group)) {
        return { ...accumulator, [student.group]: accumulator[student.group as keyof typeof accumulator] + 1 };
      } else {
        return { ...accumulator, [student.group]: 1 };
      }
    }, {})

    return studentCount
  })

  constructor() { }

  public addStudent(student: Partial<Student>) {
    return this.addStudentRequest(student).pipe(
      catchError((err) => {
        this.error.set(err)
        return this.errorService.handleError(err)
      }),
    )
  }

  public updateStudent(student: Partial<Student>): Observable<void> {
    return this.updateStudentRequest(student).pipe(
      catchError((err) => {
        this.error.set(err)
        return this.errorService.handleError(err)
      }),
    )
  }

  public deleteStudent(id: string) {
    return this.deleteStudentRequest(id).pipe(
      catchError((err) => {
        this.error.set(err)
        return this.errorService.handleError(err)
      }),
    )
  }

  public selectStudent(student: Student) {
    return this.selectedStudent.set(student);
  }

  private fetchStudents(): Observable<Student[]> {
    this.loading.set(true)

    const studentsCollection = query(
      collection(this.fireStore, 'students'),
      orderBy('createdAt', 'desc')
    )

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>
  }

  private addStudentRequest(student: Partial<Student>): Observable<DocumentReference<DocumentData, DocumentData>> {
    const newStudent = {
      ...student,
      createdAt: serverTimestamp()
    }

    return defer(() => addDoc(collection(this.fireStore, 'students'), newStudent))
  }

  private updateStudentRequest(student: Partial<Student>): Observable<void> {
    const newStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      group: student.group,
    }

    const decRef = doc(this.fireStore, 'students', student.id as string)
    return defer(() => updateDoc(decRef, newStudent))
  }

  private deleteStudentRequest(id: string): Observable<void> {
    const decRef = doc(this.fireStore, 'students', id)
    return defer(() => deleteDoc(decRef))
  }


}
