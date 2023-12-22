import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { EMPTY, Subject, catchError, finalize, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzMessageModule } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, NzGridModule, NzTypographyModule, NzSpaceModule, RouterModule, NzMessageModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.sass'
})
export class SignInComponent implements OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService)
  private fb = inject(NonNullableFormBuilder)
  private toast = inject(NzMessageService)

  private loadingState = signal<boolean>(false)

  onDestroy$: Subject<void> = new Subject();

  isLoading = computed(() => this.loadingState())

  validateForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(6), Validators.required]],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      const credentials = { ...this.validateForm.getRawValue() }

      this.loadingState.set(true)

      this.authService.login(credentials).pipe(
        takeUntil(this.onDestroy$),
        catchError((error) => {
          this.toast.error(error.message, {
            nzDuration: 5000
          })
          console.error('An error occurred:', error);

          return EMPTY;

        }),
        finalize(() => {
          this.loadingState.set(false)
        }))
        .subscribe()
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

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
