/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './GridType.module.scss';
import classNames from 'classnames/bind';

import requestApi from '~/apiService';
import MovieItem from '~/layout/component/MovieItem';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const cs = classNames.bind(styles);

function GridType() {
    const user = JSON.parse(localStorage.getItem('user'));
    const { category, type, name, id } = useParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    console.log('>>> params:', { category, type, name, id });
    console.log('>>> init:', { user, movies });

    useEffect(() => {
        async function getList() {
            let result = { data: null };
            setLoading(true);
            switch (category) {
                case 'movie':
                    const moviesData = await requestApi.getTypeMovie(type, { params: {} });
                    result = moviesData;
                    break;
                case 'tv':
                    const tvdData = await requestApi.getTypeTV(type, { params: {} });
                    result = tvdData;
                    break;
                case 'favorite':
                    const favoriteData = await requestApi.getFavoritesList(user.id);
                    result.data = favoriteData.movies;
                    break;
                case 'history':
                    const historyData = await requestApi.getHistoryList(user.id);
                    result.data = historyData.movies;
                    break;
                case 'search':
                    const searchData = await requestApi.getSearch({ params: { keyword: type } });
                    result = searchData;
                    break;
                default:
                    const movies = await requestApi.getGenresMovie(id);
                    result = movies;
            }
            setMovies(result.data);
            setLoading(false);
        }
        getList();
    }, [category, type, id]);

    return (
        <div className={cs('wrapper')}>
            {category !== 'search' ? (
                <h4 className={cs('title')}>
                    {type === 'upcoming'
                        ? 'Phim Mới'
                        : type === 'top_rated'
                        ? 'Đánh Giá Cao'
                        : type === 'popular'
                        ? 'Phổ Biến'
                        : type === 'favorite'
                        ? 'Danh sách yêu thích'
                        : type === 'history'
                        ? 'Xem gần đây'
                        : `Các phim cho thể loại "${name}"`}
                </h4>
            ) : (
                <h4 className={cs('title')}>{`Kết quả của '${type}'`}</h4>
            )}
            {loading ? (
                <div className={cs('wrapiconload')}>
                    <FontAwesomeIcon className={cs('iconLoading')} icon={faSpinner} />
                </div>
            ) : (
                <>
                    <div className={cs('movieList')}>
                        {movies &&
                            movies.length > 0 &&
                            movies.map((movie, index) => (
                                <MovieItem category={category} key={index} movie={movie} className={cs('movieItem')} />
                            ))}
                    </div>
                    <h4 className={cs('noMore')}>Đã hết kết quả</h4>
                </>
            )}
        </div>
    );
}

export default GridType;
