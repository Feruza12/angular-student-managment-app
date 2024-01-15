import { FormControl } from "@angular/forms";

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthFormValues {
  email: FormControl<string>;
  password: FormControl<string>;
}