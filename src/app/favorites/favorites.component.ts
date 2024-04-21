import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { FavoriteImage } from '../type';
import { ImgContainerComponent } from '../img-container/img-container.component';
import { FavoriteService } from '../services/favorite.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, CommonModule, ImgContainerComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: FavoriteImage[] = [];
  private favoritesSubscription: Subscription;

  constructor(private favoriteService: FavoriteService) {
    this.favoritesSubscription = this.favoriteService
      .getFavoritesObservable()
      .subscribe((favorites) => {
        this.favorites = favorites;
      });
  }

  ngOnInit(): void {
    this.favoriteService.updateFavorites();
  }

  ngOnDestroy(): void {
    this.favoritesSubscription.unsubscribe(); 
  }
}
