import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject, defer } from 'rxjs';
import { map, tap, finalize, exhaustMap } from 'rxjs/operators';

import { Firestore, collection, orderBy, query, addDoc, updateDoc, serverTimestamp, deleteDoc, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';


import { FIRESTORE } from '../../app.config';
import { Student, StudentFormValue } from '../interfaces/students';

interface StudentState {
  students: Student[];
  error: string | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore: Firestore = inject(FIRESTORE);

  private students$: Observable<Student[]> = this.getStudents();
  public addStudent$ = new Subject<Partial<Student>>();
  public deleteStudent$ = new Subject<string>();

  private state: WritableSignal<StudentState> = signal<StudentState>({
    students: [],
    error: null,
    loading: false
  });

  public students: Signal<Student[]> = computed(() => this.state().students);
  public loading: Signal<boolean> = computed(() => this.state().loading);
  public error: Signal<string | null> = computed(() => this.state().error);


  constructor() {
    this.state.update((state) => ({
      ...state,
      loading: true
    }))

    this.students$.pipe(
      takeUntilDestroyed(),
      tap((students: Student[]) => {
        return this.state.update((state) => ({
          ...state,
          students,
          loading: false
        }))
      },
      ))
      .subscribe();

    this.addStudent$.pipe(
      takeUntilDestroyed(),
      exhaustMap((student) => this.addStudent(student)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
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
