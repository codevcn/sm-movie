/* eslint-disable react-hooks/exhaustive-deps */
import styles from './ListMovie.module.scss';
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { toast } from 'react-toastify';
import requestApi from '~/apiService';
import MovieItem from '../MovieItem';
import Skeleton from 'react-loading-skeleton';

const cs = classNames.bind(styles);

function ListMovie({ category, type }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    async function getList() {
        try {
            if (category === 'movie') {
                const result = await requestApi.getTypeMovie(type, { params: {} });
                setMovies(result.data.slice(0, 10));
                setLoading(false);
            } else {
                const result = await requestApi.getTypeTV(type, { params: {} });
                setMovies(result.data.slice(0, 10));
                setLoading(false);
            }
        } catch (error) {
            console.error('>>> error:', error);
            const msg = error.reponse?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    }

    useEffect(() => {
        getList();
    }, [category]);

    return (
        <div className={cs('wrapper')}>
            <Swiper grabCursor spaceBetween={10} slidesPerView={'auto'} className={cs('swapper')}>
                {loading
                    ? Array(5)
                          .fill(7)
                          .map((v, i) => (
                              <SwiperSlide key={i} className={cs('swiperitem_ske')}>
                                  <Skeleton className={cs('skeleton-movie-item')} />
                              </SwiperSlide>
                          ))
                    : movies.map((list, index) => (
                          <SwiperSlide key={index} className={cs('swiperitem')}>
                              <MovieItem className={cs('movieItem')} category={category} movie={list} />
                          </SwiperSlide>
                      ))}
            </Swiper>
        </div>
    );
}

export default ListMovie;
