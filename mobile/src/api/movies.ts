import client from './client';
import { Movie, Series } from '../types';

export const movieService = {
  getMovies: async (): Promise<Movie[]> => {
    try {
      const response = await client.get('/movies');
      return response.data.movies || [];
    } catch (error) {
      console.error('Fetch movies error:', error);
      return [];
    }
  },

  getSeries: async (): Promise<Series[]> => {
    try {
      const response = await client.get('/series');
      return response.data.series || [];
    } catch (error) {
      console.error('Fetch series error:', error);
      return [];
    }
  }
};
