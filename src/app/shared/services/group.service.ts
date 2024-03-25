import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';

import { FIRESTORE } from '../../app.config';
import { DocumentData, DocumentReference, Firestore, addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, catchError, defer, shareReplay, tap } from 'rxjs';
import { Group, GroupState } from '../interfaces/groups';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private fireStore: Firestore = inject(FIRESTORE);
  private errorService: ErrorService = inject(ErrorService)

  private state: WritableSignal<GroupState> = signal<GroupState>({
    error: null,
    loading: false,
    selectedGroup: null
  });

  private groups$ = this.fetchGroupsRequest().pipe(
    tap(() => this.state.update((state) => ({ ...state, loading: false }))),
    shareReplay(1),
    catchError((err) => {
      this.state.update((state) => ({
        ...state,
        error: err
      }));
      return this.errorService.handleError(err)
    })
  );

  public groups: Signal<Group[]> = toSignal(this.groups$, { initialValue: [] });
  public selectedGroup: Signal<Group | null> = computed(() => this.state().selectedGroup);
  public loading: Signal<boolean> = computed(() => this.state().loading);
  public error: Signal<string | null> = computed(() => this.state().error);

  constructor() {}


  public addGroup(group: Partial<Group>): Observable<DocumentReference<DocumentData, DocumentData>> {
    return this.addGroupRequest(group).pipe(
      catchError((err) => {
        this.state.update((state) => ({
          ...state,
          error: err
        }));
        return this.errorService.handleError(err)
      }),)

  }

  public selectGroup(group: Group) {
    return this.state.update((state) => ({ ...state, selectedGroup: group }))
  }

  public updateGroup(group: Partial<Group>): Observable<void> {
    return this.updateGroupRequest(group).pipe(
      catchError((err) => {
        this.state.update((state) => ({
          ...state,
          error: err
        }));
        return this.errorService.handleError(err)
      }),
    )
  }

  public deleteGroup(id: string) {
    return this.deleteGroupRequest(id)
  }

  private fetchGroupsRequest() {
    this.state.update((state) => ({ ...state, loading: true }))

    const studentsCollection = query(
      collection(this.fireStore, 'groups'),
      orderBy('createdAt', 'desc')
    )

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Group[]>
  }

  private addGroupRequest(group: Partial<Group>) {
    const newGroup = {
      ...group,
      createdAt: serverTimestamp()
    }

    return defer(() => addDoc(collection(this.fireStore, 'groups'), newGroup))
  }

  private updateGroupRequest(group: Partial<Group>): Observable<void> {
    const newGroup = {
      title: group.title,
    }

    const decRef = doc(this.fireStore, 'groups', group.id as string)
    return defer(() => updateDoc(decRef, newGroup))
  }

  private deleteGroupRequest(id: string): Observable<void> {
    const decRef = doc(this.fireStore, 'groups', id)
    return defer(() => deleteDoc(decRef))
  }

}
