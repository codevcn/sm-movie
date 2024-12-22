/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/iframe-has-title */
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import requestApi from '~/apiService';
import SimilarMovie from '~/layout/component/SimilarMovie';
import { addHistoryMovie } from '~/apiService/user';
import { getMulti } from '~/apiService/genres';
import Comment from '~/layout/component/Comments';
import { updateView } from '~/apiService/movie';
import Skeleton from 'react-loading-skeleton';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import './WatchMovie.scss';
import { getEpisodes } from '../../apiService/episode';
import { EpisodeList, MovieCard, Overview } from '../Detail';
import { toast } from 'react-toastify';

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
    const playingFlag = useRef(0);

    const user = JSON.parse(localStorage.getItem('user'));
    console.log('>>> stuff:', { movieDetail, movieId, playingEp, user });

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
        listeners: {
            play: (e) => {
                playingFlag.current = playingFlag.current + 1;
                if (playingFlag.current === 1) {
                    handleAddHistory();
                    handleAddView();
                }
            },
        },
    };

    const handleSetPlayingEp = (episodes) => {
        if (episodes && episodes.length > 0) {
            for (const ep of episodes) {
                if (ep.EpisodeNumber === parseInt(episodeNumber)) {
                    setPlayingEp(ep);
                }
            }
        }
    };

    useEffect(() => {
        handleSetPlayingEp(episodes);
    }, [episodeNumber, episodes]);

    useEffect(() => {
        playingFlag.current = 0;
    }, [playingEp]);

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
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    }

    const getEpisodesHandler = async () => {
        if (movieId) {
            try {
                const { data } = await getEpisodes(movieId);
                setEpisodes(data);
            } catch (error) {
                console.error('>>> error:', error);
                const msg = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(msg);
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

    const handleAddHistory = async () => {
        try {
            await addHistoryMovie(playingEp.Id, user.id);
        } catch (error) {
            console.error('>>> error:', error);
        }
    };

    useEffect(() => {
        getEpisodesHandler();
        getMovieDetail();
    }, []);

    return (
        <div className="watch-movie-section">
            {playingEp ? (
                <div className="video-player-wrapper">
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
            ) : (
                <Skeleton height={450} />
            )}
            {movieDetail && episodes && (
                <EpisodeList
                    episodes={episodes}
                    type={movieDetail.Type}
                    movieDetail={movieDetail}
                    playingEp={playingEp}
                />
            )}
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
