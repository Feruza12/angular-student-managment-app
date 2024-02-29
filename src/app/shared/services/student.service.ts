import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Observable, Subject, defer, throwError } from 'rxjs';
import { tap, exhaustMap, shareReplay, catchError, map, concatMap, debounceTime, switchMap } from 'rxjs/operators';

import { Firestore, collection, orderBy, query, addDoc, updateDoc, serverTimestamp, deleteDoc, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';


import { FIRESTORE } from '../../app.config';
import { Student } from '../interfaces/students';


@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore: Firestore = inject(FIRESTORE);

  public addStudentSubject$ = new Subject<Partial<Student>>();
  public updateStudentSubject$ = new Subject<Partial<Student>>();
  public deleteStudentSubject$ = new Subject<string>();

  public students: WritableSignal<Student[]> = signal([]);
  public selectedStudent: WritableSignal<Student | null> = signal(null);
  public loading: WritableSignal<boolean> = signal<boolean>(false);
  public status: WritableSignal<string> = signal<string>('');
  public error: WritableSignal<string | null> = signal(null);

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



  constructor() {
    this.loading.set(true)

    toSignal(this.fetchStudents().pipe(
      tap({
        next: (students) => {
          this.loading.set(false),
            this.students.set(students)
        }
      }),
      shareReplay(1),
      catchError(this.handleError),
    ))

    toSignal(this.updateStudentSubject$.pipe(
      switchMap((student) => this.updateStudentRequest(student)),
      tap(() => this.status.set('updated')),
      catchError(this.handleError)
    ))

    toSignal(this.addStudentSubject$.pipe(
      switchMap((student) => this.addStudentRequest(student)),
      tap(() => this.status.set('added')),
      catchError(this.handleError),
    ))

    toSignal(this.deleteStudentSubject$.pipe(
      exhaustMap((id) => this.deleteStudentSubjectRequest(id)),
      tap(() => this.status.set('deleted')),
      catchError(this.handleError)))
  }

  public addStudent(student: Partial<Student>) {
    this.addStudentSubject$.next(student);
  }

  public updateStudent(student: Partial<Student>) {
    this.updateStudentSubject$.next(student);
  }

  public deleteStudent(id: string) {
    this.deleteStudentSubject$.next(id);
  }

  public selectStudent(student: Student) {
    this.status.set('idle');
    return this.selectedStudent.set(student);
  }

  private fetchStudents(): Observable<Student[]> {
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

  private deleteStudentSubjectRequest(id: string): Observable<void> {
    const decRef = doc(this.fireStore, 'students', id)
    return defer(() => deleteDoc(decRef))
  }

  private handleError(err: any): Observable<never> {
    let errorMessage = '';

    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message
        }`;
    }
    console.error(errorMessage);
    this.error.set(errorMessage);
    return throwError(() => errorMessage);
  }
}
