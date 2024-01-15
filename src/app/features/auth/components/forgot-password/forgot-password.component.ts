import { Component, OnDestroy, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { EMPTY, Subject, catchError, finalize, takeUntil, tap } from 'rxjs';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, NzGridModule, NzTypographyModule, NzSpaceModule, RouterModule, NzMessageModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.sass'
})
export class ForgotPasswordComponent implements OnDestroy {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService)
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder)
  private toast: NzMessageService = inject(NzMessageService)

  private loadingState: WritableSignal<boolean> = signal<boolean>(false)

  private onDestroy$: Subject<void> = new Subject();

  public isLoading: Signal<boolean> = computed(() => this.loadingState())

  public validateForm: FormGroup<{
    email: FormControl<string>;
  }> = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
  });

  public submitForm(): void {
    if (this.validateForm.valid) {
      this.loadingState.set(true)

      const email = this.validateForm.getRawValue().email
      this.authService.resetPassword(email).pipe(
        takeUntil(this.onDestroy$),
        catchError((error) => {
          this.toast.error(error.message, {
            nzDuration: 5000
          })

          console.error('An error occurred:', error);

          return EMPTY;

        }),
        tap(() => {
          this.router.navigate(['/sign-in']);
        }),
        finalize(() => {
          this.loadingState.set(false)
        })
      ).subscribe()
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  constructor() {
    effect(() => {
      if (this.authService.user()) {
        this.router.navigate(['/']);
      }
    });
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
