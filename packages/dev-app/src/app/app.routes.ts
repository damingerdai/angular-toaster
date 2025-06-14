import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'getting-started',
                loadComponent: () => import('./pages/getting-started/getting-started.component').then(m => m.GettingStartedComponent)
            }
        ]
    },

];
