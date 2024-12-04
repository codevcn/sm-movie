import instance from './instance';

export const uploadEpisode = async (formData) => {
    return instance.post('/episode/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getEpisodes = async (movieId) => {
    return instance.get('/episode/get-all/' + movieId);
};

export const getEpisodeData = async (movieId, epNum) => {
    return instance.get(`/episode/get-ep-data/${movieId}/${epNum}`);
};

export const editEpisode = async (ep_id, formData) => {
    return instance.post('/episode/edit-ep/' + ep_id, formData);
};
