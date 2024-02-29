import { Component, OnDestroy, OnInit, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';

import { NzMessageModule, NzMessageRef, NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import { GroupService } from '../../shared/services/group.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ModalType } from '../../shared/interfaces/students';
import { ActionGroupModalParams, Group } from '../../shared/interfaces/groups';
import { StudentService } from '../../shared/services/student.service';
import { GroupModalComponent } from './components/group-modal/group-modal.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [HeaderComponent, NzTableModule, NzDividerModule, NzButtonModule, NzInputModule, FormsModule, CommonModule, NzMessageModule, NzPopconfirmModule, GroupModalComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.sass'
})
export class GroupsComponent implements OnDestroy {
  private groupsService: GroupService = inject(GroupService);
  private studentService: StudentService = inject(StudentService);
  private toast: NzMessageService = inject(NzMessageService);

  public groups: Signal<Group[]> = computed(() => {
    try {
      return this.groupsService.groups();
    } catch (e) {
      this.toast.error(typeof e === 'string' ? e : 'Error', {
        nzDuration: 5000
      })
      return []
    }
  });
  public studentCount: Signal<Record<string, number>> = this.studentService.studentCount;
  public loading: Signal<boolean> = this.groupsService.loading;
  private error: Signal<string | null> = this.groupsService.error;

  public actionModal: WritableSignal<ModalType> = signal("add");
  public isShowGroupModal: boolean = false;

  private onDestroy$: Subject<void> = new Subject();

  constructor() {
    effect(() => {
      if (this.error()) {
        this.toast.error(this.error() || '', {
          nzDuration: 5000
        })
      }
    })
  }

  public showGroupModal({ action, group }: ActionGroupModalParams): void {
    this.isShowGroupModal = true;
    this.actionModal.set(action);
    if (group) {
      this.groupsService.selectGroup(group)
    }
  }

  public deleteGroup({ id, title }: Pick<Group, "title" | "id">): void | NzMessageRef {
    if (this.studentCount()[title]) {
      return this.toast.error('Can not be deleted! This group has students', {
        nzDuration: 5000
      })
    }

    this.groupsService.deleteGroup().pipe(takeUntil(this.onDestroy$)).subscribe();
    return this.groupsService.deleteGroupSubject$.next(id);
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
