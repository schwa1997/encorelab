import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FavoriteImage } from '../../assets/type';
import { ImgContainerComponent } from '../img-container/img-container.component';
import { FavoriteService } from '../services/favorite.service';
import { ListService } from '../services/list.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ImgContainerComponent],
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
