import { FormControl, FormGroup } from "@angular/forms";

export interface Credentials {
  email: string;
  password: string;
}

export interface FormValues {
  email: FormControl<string>;
  password: FormControl<string>;
}