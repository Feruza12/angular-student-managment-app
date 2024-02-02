import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject, defer, merge } from 'rxjs';
import { tap, exhaustMap, switchMap, map } from 'rxjs/operators';

import { Firestore, collection, orderBy, query, addDoc, updateDoc, serverTimestamp, deleteDoc, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';


import { FIRESTORE } from '../../app.config';
import { Student, StudentState } from '../interfaces/students';


@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore: Firestore = inject(FIRESTORE);

  private studentsSubject$: Observable<Student[]> = this.fetchStudents();
  public addStudentSubject$ = new Subject<Partial<Student>>();
  public deleteStudentSubject$ = new Subject<string>();
  public updateStudentSubject$ = new Subject<Partial<Student>>();
  public selectedStudentSubject$ = new Subject<Student>();

  private state: WritableSignal<StudentState> = signal<StudentState>({
    students: [],
    error: null,
    loading: false,
    selectedStudent: null
  });

  public students: Signal<Student[]> = computed(() => this.state().students);
  public loading: Signal<boolean> = computed(() => this.state().loading);
  public error: Signal<string | null> = computed(() => this.state().error);
  public selectedStudent: Signal<Student | null> = computed(() => this.state().selectedStudent);

  constructor() {

  }

  public getStudents(): Observable<Student[]> {
    return this.studentsSubject$.pipe(
      tap({
        next: (students: Student[]) => {
          return this.state.update((state) => ({
            ...state,
            students,
            loading: false
          }))
        },
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }),
        )
      }))
  }

  public addStudent(): Observable<DocumentReference<DocumentData, DocumentData>> {
    this.state.update((state) => ({
      ...state,
      loading: true
    }))

    return this.addStudentSubject$.pipe(
      exhaustMap((student) => this.addStudentRequest(student)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    )
  }

  public updateStudent(): Observable<void> {
    return this.updateStudentSubject$.pipe(
      exhaustMap((student) => this.updateStudentRequest(student)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    )
  }

  public deleteStudent(): Observable<void> {
    return this.deleteStudentSubject$.pipe(
      exhaustMap((id) => this.deleteStudentRequest(id)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    );
  }

  public selectStudent(): Observable<Student> {
    return this.selectedStudentSubject$.pipe(
      tap((student: Student) => this.state.update((state) => ({ ...state, selectedStudent: student })))
    )
  }

  private fetchStudents(): Observable<Student[]> {
    const studentsCollection = query(
      collection(this.fireStore, 'students'),
      orderBy('createdAt', 'desc')
    )

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>
  }

  private addStudentRequest(student: Partial<Student>): Observable<DocumentReference<DocumentData, DocumentData>> {
    console.log("student", student)
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
