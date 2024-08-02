import { Request, Response } from 'express';
import pool from '../boot/database/db_connect'; 
import logger from '../middleware/winston';
import { queryError, success } from '../constants/statusCodes'; 

interface Movie {
  type: string;
  movie_id: number;
  [key: string]: any;
}

const getMovies = async (req: Request, res: Response): Promise<Response> => {
  const { category } = req.query;

  if (category) {
    const result = await getMoviesByCategory(category as string);
    return res.status(success).json({ movies: result });
  } else {
    try {
      const movies = await pool.query('SELECT * FROM movies GROUP BY type, movie_id;');
      
      const groupedMovies = movies.rows.reduce((acc: { [key: string]: Movie[] }, movie: Movie) => {
        const { type } = movie;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(movie);
        return acc;
      }, {});

      return res.status(success).json({ movies: groupedMovies });
    } catch (error) {
      logger.error(error.stack || error.message);
      return res
        .status(queryError)
        .json({ error: 'Exception occurred while fetching movies' });
    }
  }
};

const getMoviesByCategory = async (category: string): Promise<Movie[]> => {
  try {
    const movies = await pool.query('SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;', [category]);
    return movies.rows;
  } catch (error) {
    logger.error(error.stack || error.message);
    throw error;
  }
};

const getTopRatedMovies = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const movies = await pool.query('SELECT * FROM movies ORDER BY rating DESC LIMIT 10;');
    return res.status(success).json({ movies: movies.rows });
  } catch (error) {
    logger.error(error.stack || error.message);
    return res
      .status(queryError)
      .json({ error: 'Exception occurred while fetching top rated movies' });
  }
};

const getSeenMovies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const email = (req.user as { email?: string })?.email;
    
    if (!email) {
      return res.status(queryError).json({ error: 'User email is missing' });
    }

    const movies = await pool.query(
      'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
      [email]
    );
    return res.status(success).json({ movies: movies.rows });
  } catch (error) {
    logger.error(error.stack || error.message);
    return res
      .status(queryError)
      .json({ error: 'Exception occurred while fetching seen movies' });
  }
};

export { getMovies, getTopRatedMovies, getSeenMovies };
