/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import styles from './Users.module.scss';
import classNames from 'classnames/bind';
import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { getDetail, editUser, uploadAvatar } from '~/apiService/user';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';
import image from '~/assets/Images';

const cs = classNames.bind(styles);

const EditUser = () => {
    const [user, setUser] = useState({});
    const [avatar, setAvatar] = useState('');
    const { email } = useParams();
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);

    const userDataString = localStorage.getItem('user');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    const Onsubmit = async (data) => {
        setLoading(true);
        const { ...user_info } = data;
        console.log('>>> user info ready to update:', user_info);
        try {
            if (avatar) {
                user_info.Avatar = avatar;
            }
            await editUser(user_info, email);
            if (user && user.Id === userData.id) {
                localStorage.setItem('user', JSON.stringify({ ...userData, name: user_info.Name }));
            }
            toast.success('Cập nhật thành công');
        } catch (error) {
            toast.success(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);
            try {
                const res = await getDetail(email);
                if (res.success) {
                    setUser(res.data);
                    reset(res.data);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(errorMessage);
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleUploadImg = async (e) => {
        const image = e.target.files[0];
        if (image) {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', image);
            try {
                const res = await uploadAvatar(formData, user.Id);
                if (res.success) {
                    toast.success(res.message);
                    if (user && user.Id === userData.id) {
                        localStorage.setItem('user', JSON.stringify({ ...userData, avatar: res.url }));
                    }
                    setAvatar(res.url);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(errorMessage);
            }
            setLoading(false);
        }
    };

    return (
        <div className={cs('admin_container', 'user')}>
            <h3 className="text-center mt-5 mb-3 fs-1 fw-bold">Sửa người dùng</h3>
            <Form className={cs('genres_form')} onSubmit={handleSubmit(Onsubmit)}>
                <Form.Group className="mb-3">
                    <Form.Label>Avatar người dùng</Form.Label>
                    <img
                        className={cs('user_avatar_Base')}
                        src={avatar || user.Avatar || image.avatar}
                        alt="Ảnh đại diện"
                    />
                    <Form.Control className="mt-4" type="file" style={{ border: 'none' }} onChange={handleUploadImg} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Tên của người dùng</Form.Label>
                    <Form.Control required type="text" {...register('Name', { value: user.Name })} />
                </Form.Group>
                {user && user.Id !== userData.id && (
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Quyền quản trị"
                            {...register('IsAdmin', { value: user.IsAdmin })}
                        />
                    </Form.Group>
                )}
                <button type="submit" className={cs('movie_btn_submit')}>
                    {loading ? <Spinner animation="border" role="status"></Spinner> : <span>Lưu thông tin</span>}
                </button>
            </Form>
        </div>
    );
};

export default EditUser;
