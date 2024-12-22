/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import styles from './Movies.module.scss';
import classNames from 'classnames/bind';
import { deleteComment, getCommentByMovie, getCommentMonth } from '~/apiService/comment';
import { toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';

const cs = classNames.bind(styles);

function CommentMovie() {
    const { id } = useParams();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const getCommentByid = async () => {
        setLoading(true);
        try {
            if (id === 'month') {
                const allComment = await getCommentMonth();
                console.log('>>> all comm:', allComment);
                setComments(allComment.data);
            } else {
                const allComment = await getCommentByMovie(id);
                setComments(allComment.data);
            }
        } catch (error) {
            console.error('>>> error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
        setLoading(false);
    };
    useEffect(() => {
        getCommentByid();
    }, [id]);

    // const handleDeleteComment = async (id) => {
    //     try {
    //         await deleteComment(id);
    //         getCommentByid();
    //         toast.success('Xóa bình luận thành công');
    //     } catch (error) {
    //         console.error('>>> error:', error);
    //         const msg = error.response?.data?.message || 'Có lỗi xảy ra';
    //         toast.error(msg);
    //     }
    // };

    return (
        <div className={cs('admin_container', 'movie')}>
            <>
                {loading && (
                    <div className="mt-5">
                        <Spinner animation="border" role="status"></Spinner>
                    </div>
                )}

                {comments && comments.length > 0 ? (
                    <>
                        <h3 className="text-center mb-3 mt-5 fs-1 fw-bold">Danh sách bình luận</h3>
                        <Table striped bordered hover className="mt-2">
                            <thead>
                                <tr>
                                    <th className="text-center align-middle">STT</th>
                                    <th className="text-center align-middle">Tên người dùng</th>
                                    <th className="text-center align-middle">Email</th>
                                    <th className="text-center align-middle">Nội dung</th>
                                    <th className="text-center align-middle">Thời gian tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments &&
                                    comments.map((comment, index) => (
                                        <tr key={index}>
                                            <td className="text-center align-middle">{index + 1}</td>
                                            <td className="text-center align-middle">{comment.User.Name}</td>
                                            <td className="text-center align-middle">{comment.User.Email}</td>
                                            <td className="text-center align-middle">{comment.Content}</td>
                                            <td className="text-center align-middle">{comment.CreatedAt}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </>
                ) : (
                    !loading && (
                        <h2 style={{ textAlign: 'center', color: '#fe2c55', marginTop: '20px' }}>
                            Hiện chưa có bình luận nào
                        </h2>
                    )
                )}
            </>
        </div>
    );
}

export default CommentMovie;
