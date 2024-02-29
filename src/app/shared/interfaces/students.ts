import { FormControl } from '@angular/forms';

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    group: string;
    createdAt: Date;
}

export interface StudentFormValue {
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    group: FormControl<string>;
}

export type ModalType = "add" | "edit";

export interface ActionStudentModal {
    action: ModalType;
    student: null | Student;
}

export interface GroupSelect {
    value: string;
    name: string;
}