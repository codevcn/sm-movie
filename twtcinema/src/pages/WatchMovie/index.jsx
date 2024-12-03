/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/iframe-has-title */
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import requestApi from '~/apiService';
// import Season from './Season';
import { Img } from '~/apiService/instance';
import SimilarMovie from '~/layout/component/SimilarMovie';
import { addHistoryMovie } from '~/apiService/user';
import { getMulti } from '~/apiService/genres';
import Comment from '~/layout/component/Comments';
import { updateView } from '~/apiService/movie';
import Skeleton from 'react-loading-skeleton';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import './WatchMovie.scss';
import { getEpisodeData, getEpisodes } from '../../apiService/episode';
import { EpisodeList, MovieCard, Overview } from '../Detail';

function WatchMovie() {
    const { type, movieId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const episodeNumber = queryParams.get('ep');
    const [playingEp, setPlayingEp] = useState();
    const [genres, setGenres] = useState();
    const [movieDetail, setMovieDetail] = useState();
    const [loading, setLoading] = useState(true);
    const [episodes, setEpisodes] = useState();
    console.log('>>> movie detail:', { movieDetail, movieId, type, playingEp });

    const user = JSON.parse(localStorage.getItem('user'));
    const plyrOptions = {
        controls: [
            'play-large', // Nút phát ở giữa
            'rewind', // Nút tua lùi
            'play', // Nút phát/tạm dừng
            'fast-forward', // Nút tua tới
            'progress', // Thanh tiến trình
            'current-time', // Thời gian hiện tại
            'duration', // Tổng thời gian
            'mute', // Nút tắt tiếng
            'volume', // Điều chỉnh âm lượng
            'settings', // Menu cài đặt
            'pip', // Picture-in-Picture
            'airplay', // Airplay
            'fullscreen', // Toàn màn hình
        ],
        settings: ['captions', 'quality', 'speed'],
        autoplay: false,
        muted: false,
        hideControls: true,
        tooltips: { controls: true, seek: true },
        seekTime: 10,
    };

    async function getMovieDetail() {
        setLoading(true);
        try {
            const movieDetailData = await requestApi.getDetails(movieId);
            const genresData = await getMulti(movieId);
            setGenres(genresData.data);
            setMovieDetail((pre) => ({ ...pre, ...movieDetailData.data }));
            setLoading(false);
        } catch (error) {
            console.error('>>> error:', error);
        }
    }

    const getEpisodesHandler = async () => {
        if (movieId) {
            try {
                const { data } = await getEpisodes(movieId);
                for (const ep of data) {
                    if (ep.EpisodeNumber === parseInt(episodeNumber)) {
                        setPlayingEp(ep);
                    }
                }
                setEpisodes(data);
            } catch (error) {
                console.error('>>> error:', error);
            }
        }
    };

    const handleAddView = async () => {
        try {
            await updateView(movieId);
        } catch (error) {
            console.error('>>> error:', error);
        }
    };

    useEffect(() => {
        const index = setTimeout(() => {
            handleAddView();
        }, 10000);
        getMovieDetail();
        getEpisodesHandler();
        return () => clearTimeout(index);
    }, []);

    useEffect(() => {
        if (user && movieId) {
            const handleAddHistory = async () => {
                try {
                    await addHistoryMovie(playingEp.Id, user.Id);
                } catch (error) {
                    console.error('>>> error:', error);
                }
            };

            const index = setTimeout(() => {
                handleAddHistory();
            }, 10000);

            return () => clearTimeout(index);
        }
    }, [movieId]);

    return (
        <div className="watch-movie-section">
            {playingEp && (
                <div className="video-player">
                    <Plyr
                        source={{
                            type: 'video',
                            sources: [
                                {
                                    src: playingEp.Source,
                                    type: 'video/mp4',
                                },
                            ],
                        }}
                        options={plyrOptions}
                    />
                </div>
            )}
            {movieDetail && episodes && <EpisodeList episodes={episodes} type={movieDetail.Type} />}
            {movieDetail && genres && genres.length > 0 && (
                <div className="movie-details">
                    <h2 className="movie-details-title">THÔNG TIN PHIM</h2>
                    <MovieCard movieDetail={movieDetail} genres={genres} rating={3.5} />
                    <Overview overview={movieDetail.Overview} />
                </div>
            )}
        </div>
    );
}

export default WatchMovie;
