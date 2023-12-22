import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AUTH } from '../../app.config';

import { authState } from 'rxfire/auth';
import { Credentials } from '../interfaces/credentials';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { from, defer } from 'rxjs';

export type AuthUser = User | null ;

interface AuthState {
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(AUTH);

  private user$ = authState(this.auth); //user observable
  private state = signal<AuthState>({
    user: null,
  });

  user = computed(() => this.state().user);

  constructor() {
    this.user$.pipe(takeUntilDestroyed()).subscribe((user) =>
      this.state.update((state) => ({
        ...state,
        user,
      }))
    );
  }

  login(credentials: Credentials) {
    return from(
      defer(() => signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      ))
    )
  }

  signUp(credentials: Credentials) {
    return from(
      defer(() => createUserWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      ))
    )
  }
  resetPassword(email: string){
    return from(
      defer(()=> sendPasswordResetEmail(
        this.auth,
        email
      ))
    )
  }
  logout() {
    signOut(this.auth);
  }
}
