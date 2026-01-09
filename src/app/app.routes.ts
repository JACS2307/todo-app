import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    children: [
      {
        path: 'tasks',
        loadComponent: () =>
          import('./components/tasks/tasks.component').then(
            (m) => m.TasksComponent
          ),
        title: 'Mis Tareas',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./components/category/category.component').then(
            (m) => m.CategoryComponent
          ),
        title: 'Mis Tareas',
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home/tasks',
    pathMatch: 'full',
  },
];
