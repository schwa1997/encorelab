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
    if (this.isFavorite(id)) {
      console.log('This item is already in favorites.');
      return;
    }
    this.listService.getPhotoInfoById(id).subscribe(
      (item) => {
        if (item) {
          // If item is not null (i.e., image data is found), proceed
          // Set expirationDate
          const itemWithExpiration = {
            ...item,
            expirationDate: new Date(new Date().getTime() + 1 * 60 * 1000), // one month after the current date30 * 24 * 60 * 60 * 1000
          };

          // Add the image to favorites
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

  verifyFavoriteById(id: string) {
    return this.isFavorite(id);
  }

  private isFavorite(id: string): boolean {
    return this.favorites.some((favorite) => favorite.id === id);
  }

  updateFavorites(): FavoriteImage[] {
    const currentTime: number = Date.now(); // 获取当前时间戳
    this.favorites.forEach((item) => {
      // 检查是否存在有效的 expirationDate
      if (!item.expirationDate || item.expirationDate.getTime() < currentTime) {
        console.log(item.id, 'this id expired or has invalid expiration date');
        // 将过期或者无效的项目标记为过期，并删除
        this.deleteFavorite(item.id);
        return; // 立即返回，以避免继续执行后续代码
      }
    });
    const updatedFavorites = [...this.favorites];
    this.favoritesSubject.next(updatedFavorites);
    return updatedFavorites;
  }

  refreshFavorites(): FavoriteImage[] {
    // 发出更新后的收藏图像列表
    const updatedFavorites = [...this.favorites];
    this.favoritesSubject.next(updatedFavorites);
    return updatedFavorites;
  }
}
