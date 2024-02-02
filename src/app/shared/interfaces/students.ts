import { FormControl } from '@angular/forms';

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    group: number;
    createdAt: Date;
}

export interface StudentFormValue {
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    group: FormControl<number>;
}

export type StudentModalType = "add" | "edit";


export interface StudentState {
    students: Student[];
    error: string | null;
    loading: boolean;
    selectedStudent: Student | null;
}

