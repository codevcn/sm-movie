import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import { useEffect, useState } from 'react';
import requestApi from '~/apiService';
import SlideItems from './SlideItems';
import 'swiper/css';
import styles from './Slide.module.scss';
import classNames from 'classnames/bind';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getNewestMovies } from '../../../apiService/movie';

const cs = classNames.bind(styles);

const MovieSlide = ({ movie, category }) => {
    if (movie) return <SlideItems category={category} movie={movie} />;
    return <div className={cs('slide-item', 'empty')}></div>;
};

function SlideShow({ category }) {
    const [movieLists, setMovieItems] = useState([]);
    const [loading, setLoading] = useState(true);

    SwiperCore.use([Autoplay]);

    function splitArrayIntoChunks(array, chunkSize = 3) {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push({ id: i, movies: array.slice(i, i + chunkSize) });
        }
        return result.reverse(); // reverse() là bởi vì cái slider ban đầu nó bị lật ngược (có thể do thư viện)
    }

    useEffect(
        function () {
            async function fetchMovie() {
                setLoading(true);
                try {
                    if (category === 'movie') {
                        const result = await getNewestMovies(5);
                        const devidedMovies = splitArrayIntoChunks(result.movies);
                        setMovieItems(devidedMovies);
                    } else {
                        const result = await requestApi.getTypeTV('popular', { params: { page: 1 } });
                        setMovieItems(splitArrayIntoChunks(result.data.slice(0, 5)));
                    }
                } catch (error) {
                    console.error('>>> error:', error);
                }
                setLoading(false);
            }
            fetchMovie();
        },
        [category],
    );

    return (
        <div className={cs('wrapper')}>
            <h2 className={cs('today-movies')}>Hôm nay xem gì?</h2>
            <Swiper grabCursor={true} spaceBetween={0} loop={true} slidesPerView={1} autoplay={{ delay: 3000 }}>
                {loading ? (
                    <Skeleton className={cs('skeletonItem')} />
                ) : (
                    movieLists.map(({ id, movies }) => (
                        <SwiperSlide key={id}>
                            <div className={cs('slide-items-list')}>
                                <MovieSlide category={category} movie={movies[0]} />
                                <MovieSlide category={category} movie={movies[1]} />
                                <MovieSlide category={category} movie={movies[2]} />
                            </div>
                        </SwiperSlide>
                    ))
                )}
            </Swiper>
        </div>
    );
}

export default SlideShow;
