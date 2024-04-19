export interface FavoriteImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  description: string;
  download_url: string;
  expirationDate: Date ;
}

export interface Image {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  description: string;
  download_url: string;
}

export const MaxIdValue = 1048;
