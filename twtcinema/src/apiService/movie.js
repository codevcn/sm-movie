import instance from './instance';

export const getCountMovieMonth = () => {
    const url = '/get-count-movie-month';
    return instance.get(url);
};
export const getMovieMonth = () => {
    const url = '/get-movie-month';
    return instance.get(url);
};
export const getTotalView = () => {
    const url = '/get-total-view';
    return instance.get(url);
};
export const createMovie = (data) => {
    const url = '/create';
    return instance.post(url, data);
};

export const editMovie = (data, movie_id) => {
    const url = '/update/' + movie_id;
    return instance.put(url, data);
};

export const updateView = (movie_id) => {
    const url = '/update-viewed/' + movie_id;
    return instance.put(url);
};

export const deleteMovie = (movie_id) => {
    const url = '/delete/' + movie_id;
    return instance.delete(url);
};

export const getNewestMovies = (count) => {
    return instance.get('/newest/' + count);
};
