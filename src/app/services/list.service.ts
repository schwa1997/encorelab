import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  Subject,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Image, MaxIdValue } from '../type';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private baseUrl = 'https://picsum.photos/id';
  public images: Observable<Image>[] = [];
  constructor(private http: HttpClient) {}
  // getInitImages(
  //   initImageNumber: number
  // ): Observable<{ images: Image[]; currentId: number }> {
  //   const startId = 95;
  //   const endId = startId + initImageNumber;

  //   // 获取图像的Observable数组
  //   const images: Observable<Image>[] = [];
  //   for (let i = startId; i < endId; i++) {
  //     const id = i.toString();
  //     const image$ = this.getPhotoInfoById(id).pipe(
  //       tap((image: Image) => {
  //         console.log('Received image by id:', id, 'data:', image);
  //       })
  //     );
  //     images.push(image$);
  //   }

  //   // 返回Observable数组的组合
  //   return forkJoin(images).pipe(
  //     map((imagesArray: Image[]) => {
  //       return { images: imagesArray, currentId: endId };
  //     })
  //   );
  // }
  getInitImages(
    initImageNumber: number
  ): Observable<{ images: Image[]; currentId: number }> {
    const startId = 95;
    const endId = startId + initImageNumber;

    // 获取图像的Observable数组
    const images: Observable<Image|null>[] = [];
    for (let i = startId; i < endId; i++) {
      const id = i.toString();
      const image$ = this.getPhotoInfoById(id).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          // 返回一个空的 Observable，以便跳过当前的操作
          return of(null);
        }),
        tap((image: Image | null) => {
          if (image) {
            console.log('Received image by id:', id, 'data:', image);
          } else {
            console.log('Image not found for id:', id);
          }
        })
      );
      images.push(image$);
    }

    // 返回Observable数组的组合
    return forkJoin(images).pipe(
      map((imagesArray: (Image | null)[]) => {
        const filteredImages = imagesArray.filter(
          (image) => image !== null
        ) as Image[];
        return { images: filteredImages, currentId: endId };
      })
    );
  }
  loadImages(
    currentImageID: number,loadImageCount:number
  ): Observable<{ images: Image[]; currentId: number }> {
    const startId = currentImageID;
    const endId = startId + loadImageCount;

    // 获取图像的Observable数组
    const images: Observable<Image|null>[] = [];
    for (let i = startId; i < endId; i++) {
      const id = i.toString();
      const image$ = this.getPhotoInfoById(id).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          // 返回一个空的 Observable，以便跳过当前的操作
          return of(null);
        }),
        tap((image: Image | null) => {
          if (image) {
            console.log('Received image by id:', id, 'data:', image);
          } else {
            console.log('Image not found for id:', id);
          }
        })
      );
      images.push(image$);
    }

    // 返回Observable数组的组合
    return forkJoin(images).pipe(
      map((imagesArray: (Image | null)[]) => {
        const filteredImages = imagesArray.filter(
          (image) => image !== null
        ) as Image[];
        return { images: filteredImages, currentId: endId };
      })
    );
  }

  
  // loadMoreImages(
  //   currentId: number,
  //   maxId: number
  // ): Observable<{ images: Image[]; currentId: number }> {
  //   const startId = currentId + 1;
  //   const endId = currentId + maxId;

  //   const images: Observable<Image>[] = [];
  //   for (let i = startId; i <= endId; i++) {
  //     const id = i.toString();
  //     const image$ = this.getPhotoInfoById(id).pipe(
  //       tap((image: Image) => {
  //         // console.log('Received image by id:', id, 'data:', image);
  //       })
  //     );
  //     images.push(image$);
  //   }

  //   return forkJoin(images).pipe(
  //     map((imagesArray: Image[]) => {
  //       return { images: imagesArray, currentId: endId };
  //     })
  //   );
  // }
  getAllImages(): Observable<{ images: Image[] }> {
    const observables: Observable<Image | null>[] = [];
    for (let i = 0; i <= 100; i++) {
      const id = i.toString();
      const image$ = this.getPhotoInfoById(id).pipe(
        tap((image: Image | null) => {
          console.log('Received image by id:', id, 'data:', image);
        })
      );
      observables.push(image$);
    }

    return forkJoin(observables).pipe(
      map((imagesArray: (Image | null)[]) => ({
        images: imagesArray.filter((image) => !!image) as Image[],
      }))
    );
  }
  getPhotoInfoById(id: string): Observable<Image> {
    const imageUrl = `${this.baseUrl}/${id}/info`;
    return this.http.get<Image>(imageUrl).pipe(
      catchError(async (error) => {
        console.error('An error occurred while fetching image:', error);
        throw error;
      }),
      switchMap(async (image: Image) => {
        const description = await this.generateDescription();
        return { ...image, description }; //
      })
    );
  }
  getPhotoInfoByAuthor(author: string): Observable<{ images: Image[] }> {
    return this.getAllImages().pipe(
      map((allImages) => {
        return {
          images: allImages.images.filter((image) =>
            image.author.toLowerCase().includes(author.toLowerCase())
          ),
        };
      })
    );
  }

  generateDescription(): string {
    return 'automatic description';
  }
}
