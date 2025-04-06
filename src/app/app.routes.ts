import { Routes } from '@angular/router';

import { DocumentsComponent } from './documents';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'documents',
        component: DocumentsComponent,
      },
      {
        path: '**',
        redirectTo: 'documents',
        pathMatch: 'full',  
      },
    ],
  },
];
