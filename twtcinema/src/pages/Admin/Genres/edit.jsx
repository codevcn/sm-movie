/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import styles from './Genres.module.scss';
import classNames from 'classnames/bind';
import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDetail, editGenres } from '~/apiService/genres';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';

const cs = classNames.bind(styles);

const EditGenres = () => {
    const { id } = useParams();
    const naviagte = useNavigate();
    const [genre, setGenre] = useState();

    const { register, handleSubmit } = useForm();

    const Onsubmit = async (data) => {
        try {
            const res = await editGenres(data, id);
            toast.success(res.message);
            naviagte('/admin/dashboard/genres');
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    };

    useEffect(() => {
        const getGenres = async () => {
            try {
                const res = await getDetail(id);
                if (res.success) {
                    setGenre(res.data);
                }
            } catch (error) {
                console.error('>>> error:', error);
            }
        };
        getGenres();
    }, []);

    return (
        <div className={cs('genres')}>
            <h3 className="text-center mt-4 mb-3 fs-1 fw-bold">Sửa thể loại</h3>
            <Form className={cs('genres_form')} onSubmit={handleSubmit(Onsubmit)}>
                <Form.Group className="mb-3">
                    <Form.Label style={{ marginRight: '15px' }}>Tên thể loại</Form.Label>
                    {genre ? (
                        <Form.Control required type="text" {...register('Name', { value: genre.Name })} />
                    ) : (
                        <Spinner animation="border" role="status"></Spinner>
                    )}
                </Form.Group>
                <button type="submit" className={cs('movie_btn_submit')}>
                    Lưu thông tin
                </button>
            </Form>
        </div>
    );
};

export default EditGenres;
