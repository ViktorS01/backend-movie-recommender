export type MovieType = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  genres: Array<string>;
  releaseYear: number;
  rating?: number;
};
