import styles from './Users.module.scss';
import classNames from 'classnames/bind';
import Table from 'react-bootstrap/Table';
import { useEffect } from 'react';
import { deleteUser, getAll } from '~/apiService/user';
import { useState } from 'react';
import image from '~/assets/Images';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const cs = classNames.bind(styles);

function UsersPage() {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const users = await getAll();
            setUsers(users.data);
        } catch (error) {
            console.error('>>> error:', error);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    // const handleDeleteUser = async (id) => {
    //     if (window.confirm('Are you sure you want to delete')) {
    //         const res = await deleteUser(id);
    //         if (res.success) {
    //             await getUsers();
    //         }
    //     }
    // };

    return (
        <div className={cs('admin_container', 'user')}>
            <h3 className="text-center mb-3 mt-5 fs-1 fw-bold">Danh sách Người dùng</h3>
            <Table striped bordered hover className="mt-2">
                <thead className={cs('')}>
                    <tr>
                        <td className="text-center fw-bold">STT</td>
                        <td className="text-center fw-bold">Avatar</td>
                        <td className="text-center fw-bold">Email</td>
                        <td className="text-center fw-bold">Tên</td>
                        <td className="text-center fw-bold">Quyền hạn</td>
                        <td className="text-center fw-bold">Chức năng</td>
                    </tr>
                </thead>
                <tbody>
                    {users.map(({ Id, Name, Email, Avatar, IsAdmin }, index) => (
                        <tr key={Id}>
                            <td className="text-center align-middle">{index + 1}</td>
                            <td className="text-center align-middle">
                                <img
                                    className={cs('user_avatar_img')}
                                    src={Avatar || image.avatar}
                                    alt="Ảnh đại diện"
                                />
                            </td>
                            <td className="text-center align-middle">{Email}</td>
                            <td className="text-center align-middle">{Name}</td>
                            <td className="text-center align-middle">{IsAdmin === true ? 'Admin' : 'User'}</td>
                            <td className="text-center align-middle">
                                <div className={cs('edit-movie-btn-link')}>
                                    <Link to={`/admin/dashboard/users/edit/${Email}`}>
                                        <button type="button" className={cs('edit-movie-btn')}>
                                            Sửa
                                        </button>
                                    </Link>
                                    {/* <Button variant="danger" onClick={() => handleDeleteUser(Id)}>
                                        Xoá
                                    </Button> */}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default UsersPage;
