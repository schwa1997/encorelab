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
  private favoritesSubscription: Subscription = new Subscription();

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.favoritesSubscription = this.favoriteService.favorites$.subscribe(
      () => {
        this.getFavorites();
        this.checkFavorites();
      }
    );
  }

  ngOnDestroy(): void {
    // 取消订阅以避免内存泄漏
    this.favoritesSubscription.unsubscribe();
  }

  getFavorites() {
    const favorites: FavoriteImage[] = this.favoriteService.favorites;
    this.favorites = favorites;
  }
  checkFavorites() {
    const favorites: FavoriteImage[] = this.favoriteService.updateFavorites();
    this.favorites = favorites;
  }
}
