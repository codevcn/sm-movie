import instance from './instance';

export const getAll = () => {
    const url = '/user/get-all-user';
    return instance.get(url);
};

export const getAllCount = () => {
    const url = '/user/get-user-all-year';
    return instance.get(url);
};

export const getDetail = (email) => {
    const url = '/user/get-detail/' + email;
    return instance.get(url);
};

export const getFavoritesMovies = (id) => {
    const url = '/user/get-favorites-movie/' + id;
    return instance.get(url);
};

export const updateUserClient = (data, email) => {
    const url = '/user/update-user/' + email;
    return instance.put(url, data);
};

export const deleteUserClient = (data, user_id) => {
    const url = '/user/delete-user-client/' + user_id;
    return instance.put(url, data);
};

export const changePassword = (data) => {
    const url = '/user/change-password';
    return instance.put(url, data);
};

export const deleteUser = (id) => {
    const url = '/user/delete/' + id;
    return instance.delete(url);
};

export const editUser = (data, userEmail) => {
    const url = '/user/edit-user/' + userEmail;
    return instance.put(url, data);
};

export const addFavouriteMovie = (movie_id, user_id) => {
    const url = `/user/add-favourite`;
    return instance.post(url, { movie_id, user_id });
};

export const addHistoryMovie = (episodeId, userId) => {
    const url = `/user/add-history`;
    return instance.post(url, { episodeId, userId });
};

export const rateAMovie = (movie_id, user_id, rating) => {
    return instance.post('/user/rate-a-movie', { movie_id, user_id, rating });
};

export const getRating = (movie_id, user_id) => {
    return instance.post('/user/get-rating', { movie_id, user_id });
};

export const uploadAvatar = (formData, user_id) => {
    return instance.post('/user/upload-avatar/' + user_id, formData);
};

export const uploadImage = (formData) => {
    return instance.post('/user/upload-image', formData);
};
