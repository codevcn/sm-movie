import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import { useEffect, useRef, useState } from 'react';
import SlideItems from './SlideItems';
import 'swiper/css';
import styles from './Slide.module.scss';
import classNames from 'classnames/bind';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { moviesForToday } from '../../../apiService/movie';

const cs = classNames.bind(styles);

const MovieSlide = ({ movie, category }) => {
    if (movie) return <SlideItems category={category} movie={movie} />;
    return <div className={cs('slide-item', 'empty')}></div>;
};

function SlideShow({ category }) {
    const [movieLists, setMovieLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const showSuggestion = useRef(false);

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
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    try {
                        const result = await moviesForToday(user.id);
                        const movies = result.data;
                        if (movies && movies.length >= 6) {
                            showSuggestion.current = true; //setLoading sẽ khiến Component re-render
                            let data = movies.slice(0, 6);
                            const devidedMovies = splitArrayIntoChunks(data);
                            setMovieLists(devidedMovies);
                        } else {
                            showSuggestion.current = false; //setLoading sẽ khiến Component re-render
                        }
                    } catch (error) {
                        console.error('>>> error:', error);
                    }
                }
                setLoading(false);
            }
            fetchMovie();
        },
        [category],
    );

    return loading ? (
        <Skeleton className={cs('skeletonItem')} />
    ) : (
        showSuggestion.current && (
            <div className={cs('wrapper')}>
                <h2 className={cs('today-movies')}>Hôm nay xem gì?</h2>
                <Swiper grabCursor={true} spaceBetween={0} loop={true} slidesPerView={1} autoplay={{ delay: 3000 }}>
                    {movieLists.map(({ id, movies }) => (
                        <SwiperSlide key={id}>
                            <div className={cs('slide-items-list')}>
                                <MovieSlide category={category} movie={movies[0]} />
                                <MovieSlide category={category} movie={movies[1]} />
                                <MovieSlide category={category} movie={movies[2]} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        )
    );
}

export default SlideShow;
