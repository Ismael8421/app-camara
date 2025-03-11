import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'reportes',
        pathMatch: 'full'
    },
    {
        path: 'reportes',
        loadComponent: () => import('./components/camera/camera.component').then(m => m.CameraComponent)
    },
    {
        path: 'galeria',
        loadComponent: () => import('./components/gallery/gallery.component').then(m => m.GalleryComponent)
    },
    {
        path: '**',
        redirectTo: 'reportes'
    }
];