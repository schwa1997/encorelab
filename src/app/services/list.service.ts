import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  EMPTY,
  Observable,
  catchError,
  forkJoin,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import { Image, MaxIdValue } from '../type';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private baseUrl = 'https://picsum.photos/id';
  constructor(private http: HttpClient) {}

  loadImages(
    currentImageID: number,
    loadImageCount: number
  ): Observable<{ images: Image[]; currentId: number }> {
    const startId = currentImageID + 1;
    let loadedImagesCount = 0;
    const imageRequests: Observable<Image>[] = [];

    for (let i = startId; loadedImagesCount < loadImageCount; i++) {
      const id = i.toString();
      const imageUrl = `${this.baseUrl}/${id}/info`;
      const imageRequest = this.http.get<Image>(imageUrl).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          return of(null); // Return null if there's an error
        }),
        mergeMap((image) => {
          if (image === null) {
            // If image is null, load another image to fill the gap
            return this.loadNextImage(i).pipe(
              catchError((error) => {
                console.error('Error fetching next image:', error);
                return EMPTY;
              })
            );
          }
          return of(image);
        })
      );
      imageRequests.push(imageRequest);
      loadedImagesCount++;
    }

    return forkJoin(imageRequests).pipe(
      map((imagesArray: Image[]) => ({
        images: imagesArray.filter((image) => image !== null),
        currentId: Number(imagesArray[imagesArray.length - 1].id), // Subtract 1 to get the last loaded image ID
      }))
    );
  }

  loadNextImage(id: number): Observable<Image> {
    const nextImageUrl = `${this.baseUrl}/${id + 1}/info`;
    return this.http.get<Image>(nextImageUrl);
  }

  getPhotoInfoById(id: string): Observable<Image> {
    const imageUrl = `${this.baseUrl}/${id}/info`;
    return this.http.get<Image>(imageUrl).pipe(
      catchError(async (error) => {
        console.error('An error occurred while fetching image:', error);
        throw error;
      }),
      tap((image: Image) => {
        const description = this.generateDescription(imageUrl);
        console.log('description', description);
        return { ...image, description };
      })
    );
  }

  loadImagesByAuthorName(
    currentImageID: number,
    loadImageCount: number,
    author: string
  ): Observable<{ images: Image[]; currentId: number }> {
    const startId = currentImageID + 1;
    let loadedImagesCount = 0;
    const imageRequests: Observable<Image>[] = [];

    for (let i = startId; loadedImagesCount < loadImageCount; i++) {
      const id = i.toString();
      const imageUrl = `${this.baseUrl}/${id}/info`;
      const imageRequest = this.http.get<Image>(imageUrl).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          return of(null); // Return null if there's an error
        }),
        mergeMap((image) => {
          if (image === null) {
            // If image is null, load another image to fill the gap
            return this.loadNextImage(i).pipe(
              catchError((error) => {
                console.error('Error fetching next image:', error);
                return EMPTY;
              })
            );
          }
          return of(image);
        })
      );
      imageRequests.push(imageRequest);
      loadedImagesCount++;
    }

    return forkJoin(imageRequests).pipe(
      map((imagesArray: Image[]) => ({
        images: imagesArray.filter((image) => image !== null),
        currentId: startId + loadedImagesCount - 1, // Subtract 1 to get the last loaded image ID
      }))
    );
  }

  generateDescription(imageUrl: string): Observable<string> {
    const params = new HttpParams()
      .set('imageUrl', imageUrl)
      .set('useEmojis', 'true')
      .set('useHashtags', 'true')
      .set('limit', '1');

    return this.http
      .get<any>('https://image-caption-generator2.p.rapidapi.com/v2/captions', {
        params,
      })
      .pipe(
        map((response) => {
          // Assuming the response has a data property containing the caption
          const caption = response[0]?.caption || 'ahdsfdja';
          console.log('caption', caption);
          return caption;
        }),
        catchError((error) => {
          throw 'Error generating caption: ' + error.message;
        })
      );
  }

  loadImagesByAuthor(
    currentImageID: number,
    loadImageCount: number,
    author: string
  ): Observable<{ images: Image[]; currentId: number }> {
    const startId = currentImageID + 1;
    let loadedImagesCount = 0;
    const imageRequests: Observable<Image>[] = [];

    for (let i = startId; loadedImagesCount < loadImageCount; i++) {
      const id = i.toString();
      const imageUrl = `${this.baseUrl}/${id}/info`;
      const imageRequest = this.http.get<Image>(imageUrl).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          return of(null); // Return null if there's an error
        }),
        mergeMap((image) => {
          if (
            image === null ||
            !image.author.toLowerCase().includes(author.toLowerCase())
          ) {
            // If image is null, load another image to fill the gap
            return this.loadNextImage(i).pipe(
              catchError((error) => {
                console.error('Error fetching next image:', error);
                return EMPTY;
              })
            );
          }
          if (image.author.toLowerCase().includes(author.toLowerCase())) {
            console.log('image.author.toLowerCase().includes', image);
          }
          return of(image);
        })
      );
      imageRequests.push(imageRequest);
      loadedImagesCount++;
    }

    return forkJoin(imageRequests).pipe(
      map((imagesArray: Image[]) => ({
        images: imagesArray.filter((image) => image !== null),
        currentId: startId + loadedImagesCount - 1, // Subtract 1 to get the last loaded image ID
      }))
    );
  }
  searchImagesByAuthor(
    author: string
  ): Observable<{ images: Image[]; count: number }> {
    let loadedImagesCount = 0;
    const imageRequests: Observable<Image>[] = [];

    for (let i = 0; i < MaxIdValue; i++) {
      const id = i.toString();
      const imageUrl = `${this.baseUrl}/${id}/info`;
      const imageRequest = this.http.get<Image>(imageUrl).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          return of(null); // Return null if there's an error
        }),
        mergeMap((image) => {
          if (
            image === null ||
            !image.author.toLowerCase().includes(author.toLowerCase())
          ) {
            return of(null as unknown as Image);
          }
          if (image.author.toLowerCase().includes(author.toLowerCase())) {
            console.log('image.author.toLowerCase().includes', image);
          }
          return of(image);
        })
      );
      imageRequests.push(imageRequest);
      loadedImagesCount++;
    }

    return forkJoin(imageRequests).pipe(
      map((imagesArray: Image[]) => ({
        images: imagesArray.filter((image) => image !== null),
        count: loadedImagesCount, // Subtract 1 to get the last loaded image ID
      }))
    );
  }
}
