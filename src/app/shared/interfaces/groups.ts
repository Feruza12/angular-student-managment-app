import { FormControl } from '@angular/forms';
import { ModalType } from './students';

export interface Group {
    id: string;
    title: string;
    createdAt: Date;
}

export interface GroupState {
    loading: boolean;
    error: string | null;
    selectedGroup: Group | null;
}

export interface ActionGroupModalParams {
    action: ModalType;
    group: null | Group;
}

export interface GroupFormValue {
    title: FormControl<string>;
}