/* eslint-disable eqeqeq */
import styles from './Genres.module.scss';
import classNames from 'classnames/bind';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { createGenres } from '~/apiService/genres';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const cs = classNames.bind(styles);

const CreateGenres = () => {
    const naviagte = useNavigate();

    const { register, handleSubmit, reset } = useForm();

    const Onsubmit = async (data) => {
        console.log('>>> data creating:', data);
        try {
            const res = await createGenres(data);
            toast.success(res.message);
            reset();
            naviagte('/admin/dashboard/genres');
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    };

    return (
        <div className={cs('genres')}>
            <h3 className="text-center mt-4 mb-3 fs-1 fw-bold">Thêm thể loại mới</h3>
            <Form className={cs('genres_form')} onSubmit={handleSubmit(Onsubmit)}>
                <Form.Group className="mb-3">
                    <Form.Label>Tên thể loại</Form.Label>
                    <Form.Control required type="text" {...register('Name')} />
                </Form.Group>
                <button type="submit" className={cs('movie_btn_submit')}>
                    Thêm thể loại
                </button>
            </Form>
        </div>
    );
};

export default CreateGenres;
