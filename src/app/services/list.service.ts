import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  EMPTY,
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import { Image, MaxIdValue } from '../type';
import { response } from 'express';

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

  getImageById(id: string): Observable<Image> {
    const imageUrl = `${this.baseUrl}/${id}/info`;
    return this.http.get<Image>(imageUrl).pipe(
      catchError(async (error) => {
        console.error('An error occurred while fetching image:', error);
        throw error;
      }),
      tap((image: Image) => {
        this.generateDescriptionByAI(imageUrl).subscribe(
          (response) => {
            // 设置图像描述
            image.description = response;
          },
          (error) => {
            console.error('Error fetching image description:', error);
          }
        );
        console.log('description', image.description);
        return { ...image };
      })
    );
  }

  // generateDescription(imageUrl: string): Observable<string> {
  //   const params = new HttpParams()
  //     .set('imageUrl', imageUrl)
  //     .set('useEmojis', 'true')
  //     .set('useHashtags', 'true')
  //     .set('limit', '1');

  //   return this.http
  //     .get<any>('https://image-caption-generator2.p.rapidapi.com/v2/captions', {
  //       params,
  //     })
  //     .pipe(
  //       map((response) => {
  //         // Assuming the response has a data property containing the caption
  //         const caption = response[0]?.caption || 'ahdsfdja';
  //         console.log('caption', caption);
  //         return caption;
  //       }),
  //       catchError((error) => {
  //         throw 'Error generating caption: ' + error.message;
  //       })
  //     );
  // }
  generateDescription(imageUrl: string): string {
    // 在这里实现根据图像URL生成描述的逻辑
    // 这里只是一个简单的示例，你可以使用更复杂的逻辑来生成描述
    const descriptions = [
      'This is a beautiful picture.',
      'This photo is very interesting.',
      'This image showcases the beauty of nature.',
      'This is an amazing picture.',
      'This image reminds me of the warmth of summer.',
    ];

    const randomIndex = Math.floor(Math.random() * descriptions.length);
    return descriptions[randomIndex];
  }

  generateDescriptionByAI(imageUrl: string): Observable<string> {
    const openaiUrl =
      'https://api.openai.com/v1/engines/text-davinci-003/completions';
    const apiKey = 'sk-pgt1rUcnAV5JlbEHwO8HpJzWCcKU5y0qdtN7wRvHQxveDefi';

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    const prompt = `Describe the image: ${imageUrl}`;

    const requestBody = {
      prompt: prompt,
      max_tokens: 50, // Adjust as needed
      temperature: 0.7, // Adjust as needed
      stop: '\n',
      echo: true,
    };

    return from(
      this.http
        .post<any>(openaiUrl, requestBody, { headers: headers })
        .pipe(map((response) => response.choices[0].text.trim()))
    );
  }

  getImagesByAuthor(author: string): Observable<{ images: Image[] }> {
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
      }))
    );
  }
}
