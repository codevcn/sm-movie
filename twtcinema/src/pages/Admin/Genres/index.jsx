/* eslint-disable react-hooks/exhaustive-deps */
import styles from './Genres.module.scss';
import classNames from 'classnames/bind';
import { Button, Table } from 'react-bootstrap';
import { deleteGenres, getAll } from '~/apiService/genres';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Panigation from '~/layout/component/Panigation';
import { toast } from 'react-toastify';

const cs = classNames.bind(styles);

function GenresPage() {
    const [genres, setGenres] = useState();
    const [pages, setPages] = useState(1);
    const [currPage, setCurrPage] = useState(1);
    const [loading, setLoading] = useState(true);
    console.log('>>> genres:', genres);

    const getGenres = async () => {
        try {
            const res = await getAll(currPage, 15);
            if (res.success) {
                toast.success(res.message);
                setGenres(res.data);
                setPages(res.pages);
            }
            setLoading(false);
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    };

    useEffect(() => {
        getGenres();
    }, [currPage]);

    const handleDeleteGenres = async (id, Name) => {
        if (window.confirm(`Bạn xác nhận muốn xoá thể loại "${Name}"?`)) {
            try {
                const res = await deleteGenres(id);
                getGenres();
                toast.success(res.message);
            } catch (error) {
                const msg = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(msg);
            }
        }
    };

    return (
        <div className={cs('admin_container', 'genres')}>
            <h3 className="text-center mb-3 mt-5 fs-1 fw-bold">Danh sách thể loại</h3>
            <Link to="/admin/dashboard/genres/create" className="btn btn-success fs-4 mb-2">
                Thêm thể loại mới
            </Link>
            {loading && <div>Loading...</div>}
            {genres && (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th className="text-center">STT</th>
                                <th className="text-center">Tên thể loại</th>
                                <th className="text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {genres.map(({ Id, Name }, index) => (
                                <tr key={Id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-center">{Name}</td>
                                    <td className="text-center">
                                        <div className={cs('edit-movie-btn-link')}>
                                            <Link to={`/admin/dashboard/genres/edit/${Id}`}>
                                                <button type="button" className={cs('edit-movie-btn')}>
                                                    Sửa
                                                </button>
                                            </Link>
                                            <Button variant="danger" onClick={() => handleDeleteGenres(Id, Name)}>
                                                Xoá
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Panigation pages={pages} currPage={currPage} onSetCurrentPage={setCurrPage} />
                </>
            )}
        </div>
    );
}

export default GenresPage;
