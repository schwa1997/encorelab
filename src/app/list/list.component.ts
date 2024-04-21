import {
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  OnInit,
} from '@angular/core';
import { Image, MaxIdValue } from '../type';
import { ListService } from '../services/list.service';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ImgContainerComponent } from '../img-container/img-container.component';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    MatIconModule,
    CommonModule,
    ImgContainerComponent,
    MatIconModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit {
  images: Image[] = [];
  //loadding parameters
  isLoading: boolean = false;
  loadImageCount: number = 1;
  nextImageId: number = 0;
  //search parameters
  searchType: string = 'id';
  searchTerm: string = '';
  searchCount: number = 0;
  isError: boolean = false;
  searchDisabled: boolean = true;
  //screen parameters
  screenWidth: number = 0;
  screenHeight: number = 0;

  //use the ListService
  constructor(
    private listService: ListService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    }
    this.loadImageCount = this.calculateLoadCount();
    this.loadImages();

    //
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.loadImageCount = this.calculateLoadCount();
      }
    }, 0);
  }

  // 滚动事件处理函数

  @HostListener('window:resize', ['$event'])
  onResize(event?: any): void {
    console.log('onresize');
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this.loadImageCount = this.calculateLoadCount();
      //when the small screen changes to big screen and not enough photo displayed on screen
      if (this.nextImageId <= this.loadImageCount) {
        this.loadImages();
      }
    }
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    if (this.isScrolledToBottom()) {
      console.log('at the bottom');
      if (this.searchDisabled) {
        console.log(
          'load more,this.nextImageId, this.loadImageCount',
          this.nextImageId,
          this.loadImageCount
        );
        this.loadImages();
      }
      console.log('search is abled');
    }
  }

  // 判断是否滚动到页面底部
  private isScrolledToBottom(): boolean {
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const scrollBottomThreshold = 100; // 设置一个阈值，表示距离底部多少像素时开始加载更多图片

    return (
      this.screenHeight + scrollPosition >=
      documentHeight - scrollBottomThreshold
    );
  }

  // 加载图像数据
  private loadImages(): void {
    console.log(
      'this.nextImageId, this.loadImageCount',
      this.nextImageId,
      this.loadImageCount
    );
    if (!this.isLoading) {
      this.isLoading = true;
      this.listService
        .loadImages(this.nextImageId, this.loadImageCount)
        .subscribe({
          next: (response: { images: Image[]; currentId: number }) => {
            this.images.push(...response.images);
            this.nextImageId = response.currentId;
            console.log('response.currentId', response.currentId);
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
      this.nextImageId = 0;
      this.loadImages();
      console.log('start reload');
    } else {
      this.nextImageId = 0;
      this.initSearch();
      console.log('start search');
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
      console.log('Search by author:', this.searchTerm);

      this.listService.searchImagesByAuthor(this.searchTerm).subscribe({
        next: (response: { images: Image[]; count: number }) => {
          // Assign the response images to the images array
          this.searchCount = response.count;
          this.images = response.images;
          console.log(
            'author',
            this.searchTerm,
            this.images,
            'count',
            response.count
          );
          // Increment to get the next ID
        },
        error: (error) => {
          console.error('Error fetching images by author:', error);
          this.isError = true;
        },
        complete: () => {
          // This is the complete handler, you can add any additional logic here if needed
        },
      });
    }
  }

  validateId(idString: string): boolean {
    const id = parseInt(idString, 10);
    return !isNaN(id) && id >= 0 && id <= MaxIdValue;
  }

  calculateLoadCount(): number {
    const componentWidth = 288; // 假设每个组件的宽度为 96px
    const componentHeight = 288;
    const gap = 8; // 组件之间的间距为 2px

    const componentsPerRow = Math.floor(
      this.screenWidth / (componentWidth + gap)
    );

    const componentsPerColumn =
      Math.floor(this.screenHeight / (componentHeight + gap)) + 1;

    let loadImageCount: number;
    if (componentsPerRow == 0) {
      loadImageCount = (componentsPerRow + 1) * componentsPerColumn;
    } else {
      loadImageCount = componentsPerRow * componentsPerColumn;
    }
    return loadImageCount;
  }
}
