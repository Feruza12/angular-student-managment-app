import { ApplicationConfig, InjectionToken, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import en from '@angular/common/locales/en';

import { provideNzIcons } from './icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';


import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

import {
  Firestore,
  getFirestore,
} from 'firebase/firestore';

initializeApp(environment.firebase);

export const AUTH = new InjectionToken('Firebase auth', {
  providedIn: 'root',
  factory: () => {
    const auth = getAuth();
    return auth;
  },
});

export const FIRESTORE = new InjectionToken('Firebase firestore', {
  providedIn: 'root',
  factory: () => {
    const firestore: Firestore = getFirestore();

    return firestore;
  },
});

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNzIcons(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    importProvidersFrom(HttpClientModule),
    provideAnimations()
  ]
};
