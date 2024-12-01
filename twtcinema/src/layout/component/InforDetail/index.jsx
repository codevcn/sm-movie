/* eslint-disable react-hooks/exhaustive-deps */
import { Img } from '~/apiService/instance';

import styles from './Infor.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlay, faRemove } from '@fortawesome/free-solid-svg-icons';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '~/context';

import { addFavouriteMovie, getFavoritesMovies } from '~/apiService/user';
import SimilarMovie from '../SimilarMovie';
import { getMulti } from '~/apiService/genres';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';

const cs = classNames.bind(styles);

function InforDetail({ width, movieDetail }) {
    const { showToastMessage } = useContext(AuthContext);
    const [genres, setGenres] = useState([]);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const [userFavoriteMovies, setUserFavoriteMovies] = useState([]);

    const getUserFavoritesMovies = async () => {
        if (user) {
            try {
                const result = await getFavoritesMovies(user.id);
                if (result.success) {
                    setUserFavoriteMovies(result.data);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    useEffect(() => {
        getUserFavoritesMovies();
    }, []);

    const handleAddFavoriteMovie = async () => {
        if (user) {
            const res = await addFavouriteMovie(movieDetail._id, user.id);
            if (res.success) {
                getUserFavoritesMovies();
            } else {
                console.log(res);
            }
        } else {
            showToastMessage('info', 'Hãy đăng nhập để thực hiện hành động này');
        }
    };

    useEffect(() => {
        const getGenres = async () => {
            try {
                const dataGenres = await getMulti(movieDetail.slug);
                setGenres(dataGenres.data);
            } catch (error) {
                console.log(error);
            }
        };
        getGenres();
    }, []);

    return (
        <div>
            <div className={cs('contain')}>
                <img src={Img.posterImg(movieDetail.PosterPath)} className={cs('poster')} alt="" />
                <div className={cs('content')}>
                    <h2 className={cs('title')}>{movieDetail.Name} </h2>
                    <div className={cs('genres')}>
                        {genres.map((genre, index) => (
                            <Link key={index} to={`/genres/${genre.Name}/${genre.Id}`}>
                                <span className={cs('genres-item')}>{genre.Name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className={cs('Infor')}>
                        <div className={width < 740 ? cs('wrapWatchFav') : 'btnOnly'}>
                            {userFavoriteMovies.includes(movieDetail.Id) ? (
                                <button
                                    className={cs('btnFavorite')}
                                    onClick={handleAddFavoriteMovie}
                                    style={{
                                        border: '2px solid var(--primary)',
                                        color: 'var(--primary)',
                                        fontSize: '1.4rem',
                                        backgroundColor: 'white',
                                    }}
                                >
                                    <FontAwesomeIcon
                                        className={cs('icon')}
                                        icon={faRemove}
                                        style={{
                                            marginRight: '10px',
                                            marginBottom: '-1px',
                                            fontSize: '1.6rem',
                                        }}
                                    />
                                    Bỏ yêu thích
                                </button>
                            ) : (
                                <button className={cs('btnFavorite')} onClick={handleAddFavoriteMovie}>
                                    <FontAwesomeIcon className={cs('icon')} icon={faHeart} />
                                    Thêm yêu thích
                                </button>
                            )}

                            {width < 740 && (
                                <button
                                    className={cs('playBtn')}
                                    onClick={() =>
                                        navigate(`/${movieDetail.Category.toLowerCase()}/watch/${movieDetail.Id}`)
                                    }
                                >
                                    <FontAwesomeIcon className={cs('icon')} icon={faPlay} />
                                    Xem Ngay
                                </button>
                            )}
                        </div>

                        <h2 className={cs('titleInfor')}>Thông tin</h2>
                        <span>{`Ngày Phát Hành : ${moment(movieDetail.ReleaseDate).format('DD/MM/YYYY HH:mm')}`}</span>
                        <span>{`Điểm Đánh Giá IMDb : ${movieDetail.IbmPoints}`}</span>
                        <span>{`Quốc Gia Sản Xuất : ${movieDetail.Country.Name}`}</span>
                    </div>
                </div>
            </div>
            <div className={cs('summary')}>
                <h4 className={cs('titleOverview')}>Tóm tắt</h4>
                <p className={cs('overview')}>{movieDetail.Overview}</p>
            </div>
            <div className={cs('Similar')}>
                <h4 className={cs('titleOverview')}>Đề xuất</h4>
                <SimilarMovie category={movieDetail.Category} slug={movieDetail.Slug} />
            </div>
        </div>
    );
}

export default InforDetail;
