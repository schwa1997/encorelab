import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Image, MaxIdValue } from '../../assets/type';
import { MatIconModule } from '@angular/material/icon';
import { ListService } from '../services/list.service';
import { ImgContainerComponent } from '../img-container/img-container.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterOutlet,
    ImgContainerComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  images: Image[] = [];
  loadImageCount: number = 0;
  initImageCount: number = 0;
  currentId: number = 0;
  isLoading: boolean = false;
  searchType: string = 'id';
  searchTerm: string = '';
  isError: boolean = false;
  searchDisabled: boolean = true;
  constructor(private listService: ListService) {}

  ngOnInit(): void {
    this.initImageCount = this.calculateInitImageCount();
    this.loadImageCount = this.calculateLoadCount();
    this.getInitImages();
    window.addEventListener('scroll', this.onScroll.bind(this), true);
  }

  // 滚动事件处理函数
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    if (this.isScrolledToBottom()) {
      console.log('at the bottom and load more');
      this.loadImages();
    }
  }

  // 判断是否滚动到页面底部
  private isScrolledToBottom(): boolean {
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.offsetHeight;
    const scrollPosition =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const scrollBottomThreshold = 100; // 设置一个阈值，表示距离底部多少像素时开始加载更多图片

    return (
      windowHeight + scrollPosition >= documentHeight - scrollBottomThreshold
    );
  }

  // 加载图像数据
  private loadImages(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.listService
        .loadImages(this.currentId, this.loadImageCount)
        .subscribe({
          next: (response: { images: Image[]; currentId: number }) => {
            this.images.push(...response.images);
            this.currentId = response.currentId;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching images:', error);
            this.isLoading = false;
          },
        });
    }
  }
  toggleSearch() {
    this.searchDisabled = !this.searchDisabled;
    if (this.searchDisabled) {
      this.getInitImages();
    } else {
      this.initSearch();
    }
  }
  initSearch(): void {
    this.searchType = 'id';
    this.searchTerm = '';
  }
  handleSearch(): void {
    if (this.searchType === 'id') {
      const id = parseInt(this.searchTerm, 10);
      if (id > MaxIdValue && id < 0) {
        console.error('is should be between 0 and 1084');
      } else {
        console.log('this.searchTerm', this.searchTerm);
        this.listService.getPhotoInfoById(this.searchTerm).subscribe(
          (response: Image | null) => {
            if (response !== null) {
              this.isError = false;
              this.images = [response]; // Update images if response is not null
            } else {
              console.warn(`Image not found for ID: ${this.searchTerm}`);
            }
          },
          (error) => {
            console.error(`Image not found for ID: ${this.searchTerm}`);
            this.isError = true;
          }
        );
      }
    } else if (this.searchType === 'author') {
      console.log('Search by author:', this.searchTerm); // Log search by author
      this.listService.getPhotoInfoByAuthor(this.searchTerm).subscribe(
        (response: { images: Image[] }) => {
          // Assign the response directly to the images array
          this.images = response.images;
          console.log('author', this.searchTerm, this.images);
        },
        (error) => {
          console.error('Error fetching initial images:', error);
        }
      );
    }
  }

  validateId(idString: string): boolean {
    const id = parseInt(idString, 10);
    return !isNaN(id) && id >= 0 && id <= MaxIdValue;
  }

  private getInitImages(): void {
    this.listService.loadImages(this.currentId, this.initImageCount).subscribe({
      next: (response: { images: Image[]; currentId: number }) => {
        this.images = response.images;
        this.currentId = response.currentId;
      },
      error: (error) => {
        console.error('Error fetching initial images:', error);
      },
    });
  }
  calculateInitImageCount(): number {
    // 获取当前屏幕的宽度
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    console.log(screenWidth);

    // 计算每个组件的宽度
    const componentWidth = 288; // 假设每个组件的宽度为 96px
    const componentHeight = 288;
    const gap = 8; // 组件之间的间距为 2px

    // 计算每行可以容纳的组件数量
    const componentsPerRow = Math.floor(screenWidth / (componentWidth + gap));

    // 假设每个组件的高度也是 96px，则计算每列可以容纳的组件数量
    // 如果高度不是固定的，需要根据实际情况进行调整
    const componentsPerColumn =
      Math.floor(screenHeight / (componentHeight + gap)) + 1;

    // 计算初始页面可以容纳的组件数量
    const initImageCount = componentsPerRow * componentsPerColumn;
    console.log(initImageCount);
    return initImageCount;
  }
  calculateLoadCount(): number {
    // 获取当前屏幕的宽度
    const screenWidth = window.innerWidth;
    const componentWidth = 288; // 假设每个组件的宽度为 288px
    const gap = 8; // 组件之间的间距为 8px
    // 计算每行可以容纳的组件数量
    const componentsPerRow = Math.floor(screenWidth / (componentWidth + gap));

    return componentsPerRow;
  }
}
