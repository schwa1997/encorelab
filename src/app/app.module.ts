import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ListComponent } from './list/list.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ImgContainerComponent } from './img-container/img-container.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    MatIconModule,
    ImgContainerComponent,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: '',
        component: ListComponent,
        title: 'Home page',
      },
      {
        path: 'favorites',
        component: FavoritesComponent,
        title: 'favorites',
      },
    ]),
  ],
  declarations: [
    AppComponent,
    ListComponent,
    FavoritesComponent,
    ImgContainerComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
