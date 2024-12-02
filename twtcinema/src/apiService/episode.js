import instance from './instance';

export const uploadEpisode = async (formData) => {
    return instance.post('/episode/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
