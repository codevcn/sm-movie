/* eslint-disable react-hooks/exhaustive-deps */
import styles from './Movies.module.scss';
import classNames from 'classnames/bind';
import { Button, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import requestApi from '~/apiService/index';
import { deleteMovie, getMovieMonth } from '~/apiService/movie';
import { Img } from '~/apiService/instance';
import Panigation from '~/layout/component/Panigation';
import CountCmt from './CountComment';
import { toast } from 'react-toastify';

const cs = classNames.bind(styles);

function MoviesPage() {
    const [movies, setMovies] = useState();
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState();
    const [currPage, setCurrPage] = useState(1);
    const [inputValue, setInputValue] = useState('');
    const [type, setCategory] = useState('all');

    const { searchValue, month } = useParams();
    const navigate = useNavigate();
    const inputRef = useRef();

    console.log('>>> stuff:', { movies });

    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (!inputValue.startsWith(' ')) {
            setInputValue(inputValue);
        }
    };

    const getAllMovies = async (currPage) => {
        console.log('>>> get all stuff:', { currPage, type });
        try {
            if (month) {
                const result = await getMovieMonth();
                if (result.success) {
                    setMovies(result.data);
                    setLoading(false);
                }
            } else if (searchValue) {
                const result = await requestApi.getSearch({ params: { keyword: searchValue } });
                if (result.success) {
                    setMovies(result.data);
                    setLoading(false);
                }
            } else {
                const result = await requestApi.getAll(currPage, type);
                if (result.success) {
                    setMovies(result.data);
                    setPages(result.pages);
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('>>> error:', error);
        }
    };

    useEffect(() => {
        getAllMovies(currPage);
    }, [currPage, searchValue, type, month]);

    const handleDeleteMovie = async (id, movieName) => {
        if (window.confirm(`Bạn xác nhận muốn xoá phim "${movieName}"?`)) {
            try {
                const res = await deleteMovie(id);
                if (res.success) {
                    toast.success(res.message);
                }
            } catch (error) {
                console.error('>>> error:', error);
                const msg = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(msg);
            }
            getAllMovies(currPage);
        }
    };

    useEffect(() => {
        if (inputValue) {
            const ref = inputRef.current;
            const enterKey = async (e) => {
                e.preventDefault();
                if (e.keyCode === 13) {
                    navigate(`/admin/dashboard/movies/search/${inputValue}`);
                    setInputValue('');
                }
            };
            ref.addEventListener('keyup', enterKey);
            return () => {
                ref.removeEventListener('keyup', enterKey);
            };
        }
    }, [inputValue]);

    const handleChangeType = (e) => {
        setCurrPage(1);
        setCategory(e.target.value);
    };

    return (
        <div className={cs('admin_container', 'movie')}>
            <h3 className="text-center mb-3 mt-5 fs-1 fw-bold">Danh sách phim</h3>
            <div className={cs('movie_utils')}>
                <Link to="/admin/dashboard/movies/create" className="btn btn-success">
                    Thêm phim mới
                </Link>
                <div className={cs('movie_search-box')}>
                    <input
                        ref={inputRef}
                        placeholder="Nhập tên phim..."
                        value={inputValue}
                        required
                        onChange={handleChange}
                    />
                    <Link
                        to={`/admin/dashboard/movies/search/${inputValue}`}
                        onClick={(e) => {
                            if (!inputValue) e.preventDefault();
                        }}
                    >
                        <button>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </Link>
                </div>
                {!month && !searchValue && (
                    <Form.Select className={cs('movie_select-form')} onChange={(e) => handleChangeType(e)}>
                        <option value="all">-- Tất Cả --</option>
                        <option value="movie">Phim Lẻ</option>
                        <option value="series">Phim Dài Tập</option>
                    </Form.Select>
                )}
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : movies.length < 1 ? (
                <h4 style={{ textAlign: 'center', fontSize: '1.8rem', marginTop: '30px' }}>Không có kết quả nào</h4>
            ) : (
                <>
                    <Table striped bordered hover className="mt-2">
                        <thead>
                            <tr>
                                <th className="text-center ">STT</th>
                                <th className="text-center">Tên phim</th>
                                <th className="text-center">Loại phim</th>
                                <th className="text-center">Ảnh bìa</th>
                                <th className="text-center">Số tập</th>
                                <th className="text-center">Lượt xem</th>
                                <th className="text-center">Ngày phát hành</th>
                                <th className="text-center">Bình luận</th>
                                <th className="text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies &&
                                movies.map((movie, index) => (
                                    <tr key={index}>
                                        <td className="text-center align-middle">{index + 1}</td>
                                        <td className="text-center align-middle">{movie.Name}</td>
                                        <td className="text-center align-middle">
                                            {movie.Type === 'movie' ? 'Phim lẻ' : 'Phim dài tập'}
                                        </td>
                                        <td className="text-center align-middle">
                                            <img
                                                className={cs('movie_img')}
                                                src={Img.baseImg(movie.PosterPath)}
                                                alt=""
                                            />
                                        </td>
                                        <td className="text-center align-middle">{movie.TotalEpisodes ?? 0}</td>
                                        <td className="text-center align-middle">{movie.Viewed ?? 0}</td>
                                        <td className="text-center align-middle">
                                            {new Date(movie.ReleaseDate).toLocaleDateString()}
                                        </td>
                                        <CountCmt movieId={movie.Id} />
                                        <td className="text-center align-middle">
                                            <div className={cs('edit-movie-btn-link')}>
                                                <Link to={`/admin/dashboard/movies/edit/${movie.Id}`}>
                                                    <button type="button" className={cs('edit-movie-btn')}>
                                                        Sửa
                                                    </button>
                                                </Link>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteMovie(movie.Id, movie.Name)}
                                                >
                                                    Xoá
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                    {pages && !searchValue && (
                        <div className="d-flex justify-content-center">
                            <Panigation pages={pages} currPage={currPage} onSetCurrentPage={setCurrPage} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MoviesPage;
