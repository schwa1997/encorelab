import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
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

@Injectable({
  providedIn: 'root',
})
export class ListService {
  failedImageIds: { [id: string]: string } = {};
  private baseUrl = 'https://picsum.photos/id';
  constructor(private http: HttpClient) {}
  getImageById(id: string): Observable<Image> {
    const imageUrl = `${this.baseUrl}/${id}/info`;
    return this.http.get<Image>(imageUrl).pipe(
      catchError(async (error) => {
        console.error('An error occurred while fetching image:', error);
        this.failedImageIds[id] = id;
        throw error;
      }),
      tap((image: Image) => {
        image.description = this.generateDescription(imageUrl);
        return { ...image };
      })
    );
  }
  loadImages(
    currentImageID: number,
    loadImageCount: number
  ): Observable<{ images: Image[]; currentId: number }> {
    const startId = currentImageID;
    let loadedImagesCount = 0;
    const imageRequests: Observable<Image>[] = [];

    for (let i = startId; loadedImagesCount < loadImageCount; i++) {
      const id = i.toString();
      if (this.failedImageIds[id]) {
        console.log(`Skipping image ${id}, already failed`);
        continue;
      }
      const imageRequest = this.getImageById(id).pipe(
        catchError((error) => {
          loadedImagesCount--;
          console.error('Error fetching image by id:', id, 'error:', error);
          return of(null);
        }),
        mergeMap((image) => {
          if (image === null) {
            return of(null as unknown as Image);
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

  generateDescription(imageUrl: string): string {
    const descriptions = [
      'This is a beautiful picture.',
      'This photo is very interesting.',
      'This image showcases the beauty of nature.',
      'This is an amazing picture.',
      'This is an amazing aud;sagdfj oiuifafy uafipydsofdisu; yiahsd ajkgsdkgdhgs udsy agdsag ;ldkdslj hadljshdlfdspicture.',
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
      if (this.failedImageIds[id]) {
        //skipping the failedIm
        continue;
      }
      const imageRequest = this.getImageById(id).pipe(
        catchError((error) => {
          console.error('Error fetching image by id:', id, 'error:', error);
          return of(null);
        }),
        mergeMap((image) => {
          if (
            image === null ||
            !image.author.toLowerCase().includes(author.toLowerCase())
          ) {
            return of(null as unknown as Image);
          }
          if (image.author.toLowerCase().includes(author.toLowerCase())) {
          }
          return of(image);
        })
      );
      imageRequests.push(imageRequest);
      loadedImagesCount++;
    }
    console.log('this.failedImageIds', this.failedImageIds);

    return forkJoin(imageRequests).pipe(
      map((imagesArray: Image[]) => ({
        images: imagesArray.filter((image) => image !== null),
      }))
    );
  }
}
