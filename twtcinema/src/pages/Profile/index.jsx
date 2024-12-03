/* eslint-disable no-unused-vars */
import { Navigate, useNavigate } from 'react-router-dom';
import styles from './Profile.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRightFromBracket,
    faEnvelope,
    faPenToSquare,
    faSpinner,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useRef, useState } from 'react';
import { UpdateIcon } from '~/components/Icon';
import image from '~/assets/Images';
import { changePassword, deleteUserClient, updateUserClient } from '~/apiService/user';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';
import { uploadAvatar } from '../../apiService/user';

const cs = classNames.bind(styles);

function Profile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const refContent = useRef();
    const refIcon = useRef();
    const refIconSent = useRef();

    const refInputPass = useRef();
    const refIconSentPass = useRef();

    const modalRef = useRef();
    const reAuthInput = useRef();
    const confirmBtn = useRef();

    const filterRef = useRef();

    // const refInputEmail = useRef();
    // const refIconEmail = useRef();
    // const refIconSentEmail = useRef();

    const handleEditName = () => {
        refContent.current.setAttribute('contentEditable', true);
        refContent.current.focus();
        refIcon.current.style = 'display : none';
        refIconSent.current.style = 'display : block';
    };

    const handleSendName = async () => {
        if (refContent.current.innerText !== JSON.parse(localStorage.getItem('user')).name) {
            refContent.current.setAttribute('contentEditable', false);
            refIconSent.current.style = 'display : none';
            refIcon.current.style = 'display : block';
            try {
                const res = await updateUserClient({ Name: refContent.current.innerText }, user.email);
                if (res.success) {
                    toast.success(res.message);
                    localStorage.setItem('user', JSON.stringify({ ...user, name: res.data.Name }));
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                toast.error(error.message);
            }
        } else {
            refContent.current.setAttribute('contentEditable', false);
            refIconSent.current.style = 'display : none';
            refIcon.current.style = 'display : block';
        }
    };

    //Password
    const handleConfirmUpdate = async () => {
        let success = false;
        let result;
        try {
            result = await changePassword({
                oldPassword: reAuthInput.current.value,
                newPassword: refInputPass.current.value,
                email: user.email,
            });
            success = result.success;
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
        if (success) {
            toast.success('Cập nhật mật khẩu thành công');
            modalRef.current.classList.remove(cs('open'));
            reAuthInput.current.value = '';
            refInputPass.current.value = '';
            confirmBtn.current.removeEventListener('click', handleConfirmUpdate);
        }
    };

    const handleSendPassW = async () => {
        modalRef.current.classList.add(cs('open'));
        confirmBtn.current.addEventListener('click', handleConfirmUpdate);
    };

    //Delete
    const handleConfirmDelete = async () => {
        let success = false;
        let result;
        try {
            result = await deleteUserClient({
                email: user.email,
                password: reAuthInput.current.value,
            });
            success = result.success;
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
        if (success) {
            toast.success('Xóa người dùng thành công');
            modalRef.current.classList.remove(cs('open'));
            reAuthInput.current.value = '';
            confirmBtn.current.removeEventListener('click', handleConfirmDelete);
            localStorage.removeItem('user');
            navigate('/movie');
        }
    };

    const handleDelete = async () => {
        modalRef.current.classList.add(cs('open'));
        confirmBtn.current.addEventListener('click', handleConfirmDelete);
    };

    const handleUploadImg = async (e) => {
        const image = e.target.files[0];
        if (image) {
            setLoading(true);
            filterRef.current.classList.add(cs('filter'));
            const formData = new FormData();
            formData.append('file', image);
            try {
                const res = await uploadAvatar(formData, user.id);
                if (res.success) {
                    toast.success(res.message);
                    localStorage.setItem('user', JSON.stringify({ ...user, avatar: res.url }));
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

    const getUserAvatar = () => {
        return user?.avatar || image.avatar;
    };

    if (!user) return <Navigate to="/movie" />;
    return (
        <div className={cs('wrapper')}>
            <h4 className={cs('header')}>Thông Tin Cá Nhân</h4>
            <div className={cs('container')}>
                <div className={cs('info')}>
                    <h4 className={cs('title')}>Thông tin người dùng</h4>
                    <div className={cs('content')}>
                        <div className={cs('infoUser')}>
                            <p className={cs('contentTitle')}>
                                <FontAwesomeIcon
                                    className={cs('iconTitle')}
                                    style={{ marginBottom: '2px' }}
                                    icon={faUser}
                                />
                                Tên
                            </p>
                            <p className={cs('usernamemail')}>
                                <span ref={refContent}> {user?.name}</span>
                                <i ref={refIcon} onClick={handleEditName}>
                                    <FontAwesomeIcon className={cs('iconEdit')} icon={faPenToSquare} />
                                </i>

                                <i ref={refIconSent} onClick={handleSendName} className={cs('iconAfter')}>
                                    <UpdateIcon className={cs('iconSent')} />
                                </i>
                            </p>
                        </div>
                        <div className={cs('infoUser')}>
                            <p className={cs('contentTitle')}>
                                <FontAwesomeIcon className={cs('iconTitle')} icon={faEnvelope} />
                                Email
                            </p>

                            <p className={cs('usernamemail')}>
                                <span>{user?.email}</span>
                            </p>
                        </div>

                        <div className={cs('infoUser')}>
                            <p className={cs('contentTitle')}>Thay đổi mật khẩu</p>
                            <input
                                ref={refInputPass}
                                className={cs('infoInput')}
                                type="password"
                                placeholder="Nhập mật khẩu mới của bạn"
                            />
                            <i ref={refIconSentPass} onClick={handleSendPassW}>
                                <UpdateIcon className={cs('iconSent')} />
                            </i>
                        </div>

                        <div className={cs('delete')}>
                            {deleteLoading ? (
                                <Spinner animation="border" role="status"></Spinner>
                            ) : (
                                <button className={cs('deleteBtn')} onClick={handleDelete}>
                                    Xóa tài khoản
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={cs('picture')}>
                    <h4 className={cs('title')}>Ảnh đại diện</h4>
                    <div className={cs('pictureContain')}>
                        {loading && <FontAwesomeIcon className={cs('iconLoading')} icon={faSpinner} />}
                        <img src={getUserAvatar()} className={cs('imageProfile')} alt="Ảnh đại diện" />
                        <div ref={filterRef}></div>
                    </div>

                    <div className={cs('uploadContain')}>
                        <button className={cs('uploadBtn')}>
                            <FontAwesomeIcon className={cs('iconUpload')} icon={faArrowRightFromBracket} />
                            Cập nhật ảnh mới
                        </button>
                        <input
                            className={cs('chooseFile')}
                            onChange={handleUploadImg}
                            type="file"
                            accept="image/*"
                        ></input>
                    </div>
                </div>
            </div>

            {/* Xem lai cai useref de fowrd cai ref.current.value */}

            {/* Modal form */}
            <div ref={modalRef} className={cs('modal')} onClick={(e) => e.target.classList.remove(cs('open'))}>
                <div className={cs('modalContain')} onClick={(e) => e.stopPropagation()}>
                    <h4 className={cs('modalHeader')}>Nhập mật khẩu cũ của bạn để xác nhận</h4>
                    <input
                        ref={reAuthInput}
                        className={cs('inputConfirm')}
                        placeholder="Nhập mật khẩu..."
                        type="password"
                    />
                    <button ref={confirmBtn} className={cs('modalBtn')}>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
