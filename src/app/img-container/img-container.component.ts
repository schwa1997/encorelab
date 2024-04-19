import { Component, Input, OnInit } from '@angular/core';
import { FavoriteService } from '../services/favorite.service';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-img-container',
  standalone: true,
  imports: [RouterModule,MatIconModule,CommonModule],
  templateUrl: './img-container.component.html',
  styleUrl: './img-container.component.css',
})
export class ImgContainerComponent implements OnInit {
  @Input() id!: string;
  @Input() author!: string;
  @Input() description!: string;
  @Input() download_url!: string;
  @Input() height!: number;
  @Input() width!: number;
  @Input() expirationDate!: Date;
  isFavorite = false;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit() {
    this.isFavorite = this.favoriteService.verifyFavoriteById(this.id);
  }

  handleFavorite() {
    if (!this.isFavorite) {
      this.favoriteService.addToFavorite(this.id);
      this.favoriteService.favorites$.subscribe((favorites) => {
        this.isFavorite = this.favoriteService.verifyFavoriteById(this.id);
      });
    } else {
      this.favoriteService.deleteFavorite(this.id);
      this.favoriteService.favorites$.subscribe((favorites) => {
        this.isFavorite = this.favoriteService.verifyFavoriteById(this.id);
      });
    }
  }
  handleClick() {
    const imageUrl = `https://picsum.photos/id/${this.id}/${this.width}/${this.height}.jpg`;
    window.open(imageUrl, '_blank');
  }
}
