import instance from './instance';

export const getCommentByMovie = (id) => {
    const url = '/comment/get-comment/' + id;
    return instance.get(url);
};

export const getCountCommentMonth = () => {
    const url = '/comment/get-count-comment-month';
    return instance.get(url);
};

export const getCommentMonth = () => {
    const url = '/comment/get-comment-month';
    return instance.get(url);
};

export const getCountComments = (movie_id) => {
    const url = '/comment/get-count-comment/' + movie_id;
    return instance.get(url);
};

export const postComment = (data) => {
    const url = '/comment/post-comment';
    return instance.post(url, data);
};

export const updateComment = (comment_id, data) => {
    const url = '/comment/update-comment/' + comment_id;
    return instance.put(url, data);
};

export const deleteComment = (comment_id) => {
    const url = '/comment/delete-comment/' + comment_id;
    return instance.delete(url);
};
