import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { ListComponent } from './list/list.component';

export const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    title: 'Home page',
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
    title: 'favorites',
  }
];
