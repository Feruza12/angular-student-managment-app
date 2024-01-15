import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { FIRESTORE } from '../../app.config';
import { AuthService } from './auth.service';
import { collection, orderBy, query } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { map, tap, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../interfaces/students';
import { Observable } from 'rxjs';

interface StudentState {
  students: Student[];
  error: string | null;
  loading: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fireStore = inject(FIRESTORE);

  public students$ = this.getStudents().pipe()

  private state = signal<StudentState>({
    students: [],
    error: null,
    loading: false
  });

  public students: Signal<Student[]> = computed(() => this.state().students);
  public loading: Signal<boolean> = computed(() => this.state().loading);


  constructor() {
    this.state.update((state) => ({
      ...state,
      loading: true
    }))

    this.students$.pipe(
      takeUntilDestroyed(),
      tap((students: Student[]) => this.state.update((state) => ({
        ...state,
        students,
        loading: false
      }),
      ))
    ).subscribe();
  }


  private getStudents() {
    const studentsCollection = query(
      collection(this.fireStore, 'students'),
      orderBy('createdAt', 'desc')
    )

    return collectionData(studentsCollection) as Observable<Student[]>
  }
}
