import { Injectable, inject } from '@angular/core';
import { FIRESTORE } from '../../app.config';
import { AuthService } from './auth.service';
import { collection, orderBy, query } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private firestore = inject(FIRESTORE);

  constructor() { }

  private getStudents() {
    const studentsCollection = query(
      collection(this.firestore, 'Students'),
      orderBy('created', 'desc')
    )
  }
}
