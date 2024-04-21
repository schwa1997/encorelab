import { Injectable } from '@angular/core';
import { FavoriteImage } from '../type';
import { BehaviorSubject, Observable } from 'rxjs';
import { ListService } from './list.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  public favorites: FavoriteImage[] = [];
  private favoritesSubject: BehaviorSubject<FavoriteImage[]> =
    new BehaviorSubject<FavoriteImage[]>(this.favorites);
  public favorites$: Observable<FavoriteImage[]> =
    this.favoritesSubject.asObservable();
  constructor(private listService: ListService) {}
  addToFavorite(id: string) {
    if (!this.verifyFavoriteById(id)) {
      this.listService.getImageById(id).subscribe(
        (item) => {
          if (item) {
            const itemWithExpiration = {
              ...item,
              expirationDate: new Date(new Date().getTime() + 1 * 60 * 1000), // 1 mins after current date
            };
            this.favorites.push(itemWithExpiration);
            this.refreshFavorites();
          } else {
            // Handle the scenario where image data is not found
            console.warn(`Image not found for ID: ${id}`);
          }
        },
        (error) => {
          console.error('Error fetching image info:', error);
        }
      );
    } else {
      console.log('This item is already in favorites with the given ID:', id);
    }
  }

  deleteFavorite(id: string) {
    const index = this.favorites.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.favorites.splice(index, 1);
      this.refreshFavorites();
    } else {
      console.error('Unable to find object with the given ID:', id);
    }
  }

  verifyFavoriteById(id: string): boolean {
    return this.favorites.some((favorite) => favorite.id === id);
  }
  refreshFavorites(): FavoriteImage[] {
    const updatedFavorites = [...this.favorites];
    this.favoritesSubject.next(updatedFavorites);
    return updatedFavorites;
  }
  updateFavorites(): void {
    const currentTime: number = Date.now();
    const updatedFavorites: FavoriteImage[] = [];
    this.favorites.forEach((item) => {
      if (!item.expirationDate || item.expirationDate.getTime() < currentTime) {
        console.warn(item.id, 'this id expired or has invalid expiration date');
        return;
      } else {
        updatedFavorites.push(item);
      }
    });
    this.favorites = updatedFavorites;
    this.favoritesSubject.next(updatedFavorites);
  }

  getFavoritesObservable(): BehaviorSubject<FavoriteImage[]> {
    return this.favoritesSubject;
  }
}
