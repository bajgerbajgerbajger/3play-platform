import client, { API_URL } from './client';
import { Movie, Series } from '../types';

function absoluteUrl(url: string | null | undefined) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = API_URL.replace(/\/api\/?$/, '');
  if (url.startsWith('/')) return `${origin}${url}`;
  return `${origin}/${url}`;
}

export const movieService = {
  getMovies: async (): Promise<Movie[]> => {
    try {
      const response = await client.get('/movies');
      const items: Movie[] = response.data.movies || [];
      return items.map((m) => ({
        ...m,
        posterUrl: absoluteUrl(m.posterUrl),
        backdropUrl: absoluteUrl(m.backdropUrl),
        videoUrl: absoluteUrl(m.videoUrl),
        trailerUrl: absoluteUrl(m.trailerUrl),
      }));
    } catch (error) {
      console.error('Fetch movies error:', error);
      return [];
    }
  },

  getSeries: async (): Promise<Series[]> => {
    try {
      const response = await client.get('/series');
      const items: Series[] = response.data.series || [];
      return items.map((s) => ({
        ...s,
        posterUrl: absoluteUrl(s.posterUrl),
        backdropUrl: absoluteUrl(s.backdropUrl),
        trailerUrl: absoluteUrl(s.trailerUrl),
      }));
    } catch (error) {
      console.error('Fetch series error:', error);
      return [];
    }
  }
};
