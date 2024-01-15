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

