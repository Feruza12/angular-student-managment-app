import { Component, EventEmitter, Input, OnDestroy, Output, inject, OnInit, effect, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Subject, takeUntil, tap } from 'rxjs';

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';

import { Group, GroupFormValue } from '../../../../shared/interfaces/groups';
import { ModalType } from '../../../../shared/interfaces/students';
import { GroupService } from '../../../../shared/services/group.service';

@Component({
  selector: 'app-group-modal',
  standalone: true,
  imports: [NzModalModule, NzFormModule, NzInputModule, ReactiveFormsModule, FormsModule, CommonModule, NzMessageModule],
  templateUrl: './group-modal.component.html',
  styleUrl: './group-modal.component.sass'
})
export class GroupModalComponent implements OnInit, OnDestroy {
  @Input() public isVisible: boolean = false;
  @Input() public action: ModalType = "add";
  @Output() public visibleChanged = new EventEmitter<boolean>();

  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private toast: NzMessageService = inject(NzMessageService);
  private groupService: GroupService = inject(GroupService);
  private selectedGroup: Signal<Group | null> = computed(() => this.groupService.selectedGroup());
  private error: Signal<string | null> = computed(() => this.groupService.error());

  private onDestroy$: Subject<void> = new Subject();

  public isLoading: boolean = false;

  public validateForm: FormGroup<GroupFormValue> = this.formBuilder.group({
    title: ['', [Validators.minLength(1), Validators.required]]
  });


  constructor() {
    effect(() => {
      if (this.selectedGroup()) {
        this.validateForm.patchValue({ ...this.selectedGroup() })
      }
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public ngOnInit(): void {
    this.groupService.addGroup().pipe(
      takeUntil(this.onDestroy$),
      tap({
        next: () => this.handleSuccess()
      }),
    ).subscribe();

    this.groupService.updateGroup().pipe(
      takeUntil(this.onDestroy$),
      tap({
        next: () => this.handleSuccess()
      }),
    ).subscribe();
  }

  public handleSubmit(): void {
    this.isLoading = true;
    if (this.validateForm.valid) {
      if (this.action === 'add') {
        const group = { ...this.validateForm.getRawValue() }
        this.groupService.addGroupSubject$.next(group);

      } else {
        const group = { ...this.validateForm.getRawValue(), id: this.selectedGroup()?.id }
        this.groupService.updateGroupSubject$.next(group);
      }
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public handleClose(): void {
    this.validateForm.reset();
    this.isVisible = false;
    this.visibleChanged.emit(this.isVisible)
  }

  public handleSuccess(): void {
    this.toast.success(`Successfully has been ${this.action}ed`, {
      nzDuration: 5000
    });
    this.handleClose();
    this.isLoading = false;
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
