import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { AuthService } from '../../../../shared/services/auth.service';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzButtonModule, FormsModule, ReactiveFormsModule, NzGridModule, NzTypographyModule, NzSpaceModule, RouterModule, NzMessageModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.sass'
})
export class SignUpComponent implements OnDestroy {

  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toast = inject(NzMessageService)

  private loadingState = signal<boolean>(false)

  onDestroy$: Subject<void> = new Subject();

  isLoading = computed(() => this.loadingState())

  validateForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(6), Validators.required]],
  });

  submitForm(): void {
    if (this.validateForm.valid) {
      const credentials = { ...this.validateForm.getRawValue() }

      this.loadingState.set(true)

      this.authService.signUp(credentials).pipe(
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
        this.router.navigate(['/'])
      }
    })
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
