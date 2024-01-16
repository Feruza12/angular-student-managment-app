import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {  Observable, Subject, defer } from 'rxjs';
import { tap, exhaustMap } from 'rxjs/operators';

import { Firestore, collection, orderBy, query, addDoc, updateDoc, serverTimestamp, deleteDoc, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';


import { FIRESTORE } from '../../app.config';
import { Student } from '../interfaces/students';

interface StudentState {
  students: Student[];
  error: string | null;
  loading: boolean;
  selectedStudent: Student | null;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore: Firestore = inject(FIRESTORE);

  private students$: Observable<Student[]> = this.getStudents();
  public addStudent$ = new Subject<Partial<Student>>();
  public deleteStudent$ = new Subject<string>();
  public updateStudent$ = new Subject<Partial<Student>>();
  public selectStudent$ = new Subject<Student>();

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
    this.state.update((state) => ({
      ...state,
      loading: true
    }))

    this.students$.pipe(
      takeUntilDestroyed(),
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
      .subscribe();

    this.addStudent$.pipe(
      takeUntilDestroyed(),
      exhaustMap((student) => this.addStudent(student)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }),
        )
      }),
    ).subscribe();

    this.deleteStudent$.pipe(
      takeUntilDestroyed(),
      exhaustMap((id) => this.deleteStudent(id)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    ).subscribe();

    this.updateStudent$.pipe(
      takeUntilDestroyed(),
      exhaustMap((student) => this.updateStudent(student)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    ).subscribe();

    this.selectStudent$.pipe(
      takeUntilDestroyed(),
      tap((student: Student) => this.state.update((state) => ({ ...state, selectedStudent: student })))
    ).subscribe()
  }

  private getStudents(): Observable<Student[]> {
    const studentsCollection = query(
      collection(this.fireStore, 'students'),
      orderBy('createdAt', 'desc')
    )

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>
  }

  private addStudent(student: Partial<Student>): Observable<DocumentReference<DocumentData, DocumentData>> {
    const newStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      group: student.group,
      createdAt: serverTimestamp()
    }

    return defer(() => addDoc(collection(this.fireStore, 'students'), newStudent))
  }

  private updateStudent(student: Partial<Student>) {
    const newStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      group: student.group,
    }

    const decRef = doc(this.fireStore, 'students', student.id as string)
    return defer(() => updateDoc(decRef, newStudent))
  }

  private deleteStudent(id: string): Observable<void> {
    const decRef = doc(this.fireStore, 'students', id)
    return defer(() => deleteDoc(decRef))
  }
}
