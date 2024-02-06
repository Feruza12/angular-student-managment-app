import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';

import { FIRESTORE } from '../../app.config';
import { DocumentData, DocumentReference, Firestore, addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable, Subject, defer, exhaustMap, tap } from 'rxjs';
import { Group, GroupState } from '../interfaces/groups';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private fireStore: Firestore = inject(FIRESTORE);

  public groupsSubject$: Observable<Group[]> = this.fetchGroupsRequest();
  public addGroupSubject$ = new Subject<Partial<Group>>();
  public updateGroupSubject$ = new Subject<Partial<Group>>();
  public deleteGroupSubject$ = new Subject<string>();
  public selectedGroupSubject$ = new Subject<Group>();

  private state: WritableSignal<GroupState> = signal<GroupState>({
    groups: [],
    error: null,
    loading: false,
    selectedGroup: null
  });

  public groups: Signal<Group[]> = computed(() => this.state().groups);
  public selectedGroup: Signal<Group | null> = computed(() => this.state().selectedGroup);
  public loading: Signal<boolean> = computed(() => this.state().loading);
  public error: Signal<string | null> = computed(() => this.state().error);

  constructor() { }

  public getGroups() {
    this.state.update((state) => ({
      ...state,
      loading: true
    }))

    return this.groupsSubject$.pipe(
      tap({
        next: (groups: Group[]) => this.state.update((state) => ({
          ...state,
          groups,
          loading: false
        })),
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    )
  }

  public addGroup(): Observable<DocumentReference<DocumentData, DocumentData>> {
    return this.addGroupSubject$.pipe(
      exhaustMap((group) => this.addGroupRequest(group)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    )
  }

  public selectGroup(): Observable<Group> {
    return this.selectedGroupSubject$.pipe(
      tap({
        next: (group) => this.state.update((state) => ({ ...state, selectedGroup: group })),
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    )
  }

  public updateGroup(): Observable<void> {
    return this.updateGroupSubject$.pipe(
      exhaustMap((group) => this.updateGroupRequest(group)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    )
  }

  public deleteGroup() {
    return this.deleteGroupSubject$.pipe(
      exhaustMap((id) => this.deleteGroupRequest(id)),
      tap({
        error: (err: Error) => this.state.update((state) => ({
          ...state,
          error: err.message
        }))
      })
    );
  }

  private fetchGroupsRequest() {
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
