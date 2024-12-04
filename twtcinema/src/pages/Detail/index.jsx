/* eslint-disable react-hooks/exhaustive-deps */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { addFavouriteMovie, getFavoritesMovies } from '~/apiService/user';
import { getMulti } from '~/apiService/genres';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import './Detail.scss';
import { Rating } from 'react-simple-star-rating';
import requestApi from '~/apiService';
import { getEpisodes } from '../../apiService/episode';
import { toast } from 'react-toastify';
import { rateAMovie, getRating } from '../../apiService/user';
import Comment from '../../layout/component/Comments';

export const MovieCard = ({ genres, movieDetail, watchNowBtn }) => {
    const navigate = useNavigate();
    const [userFavoriteMovies, setUserFavoriteMovies] = useState();
    const [ratingData, setRatingData] = useState(0);

    const { PosterPath, Country, ReleaseDate, Language, Viewed, Type, Name, Id } = movieDetail;
    const greaterThan0 = ratingData > 0;

    const user = JSON.parse(localStorage.getItem('user'));

    const typeMovie = () => {
        switch (Type.toLowerCase()) {
            case 'movie':
                return 'Phim lẻ';
            default:
                return 'Phim bộ';
        }
    };

    const writeTextForPickedGenres = () => {
        return genres.map(({ Name }) => Name).join(', ');
    };

    const goToWatchMovie = (epNum) => {
        navigate(`/${Type}/watch/${Id}?ep=${epNum}`);
    };

    const handleAddFavoriteMovie = async () => {
        if (user) {
            try {
                const res = await addFavouriteMovie(movieDetail.Id, user.id);
                if (res.success) {
                    toast.success(res.message);
                    getUserFavoritesMovies();
                } else {
                    console.log('>>> res:', res);
                }
            } catch (error) {
                console.error('>>> error:', error);
            }
        } else {
            toast.error('Hãy đăng nhập để thực hiện hành động này');
        }
    };

    const getUserFavoritesMovies = async () => {
        if (user) {
            try {
                const result = await getFavoritesMovies(user.id);
                if (result.success) {
                    setUserFavoriteMovies(result.data);
                }
            } catch (error) {
                console.error('>>> error:', error);
            }
        }
    };

    const getRatingHandler = async () => {
        if (user) {
            try {
                const { rating } = await getRating(Id, user.id);
                setRatingData(rating.Rating);
            } catch (error) {
                console.error('>>> error:', error);
            }
        }
    };

    const handleRating = async (rate) => {
        if (user) {
            try {
                const res = await rateAMovie(Id, user.id, rate);
                toast.success(res.message);
                if (res.success) {
                    getRatingHandler();
                }
            } catch (error) {
                setRatingData(0);
                toast.error(error.message);
            }
        } else {
            toast.error('Bạn phải đăng nhập để thực hiện chức năng này');
        }
    };

    useEffect(() => {
        getUserFavoritesMovies();
        getRatingHandler();
    }, []);

    return (
        <div className="movie-card">
            <div className="movie-poster">
                <img src={PosterPath} alt="Bìa phim" />
            </div>

            <div className="movie-info">
                <h3>{Name}</h3>
                <p>
                    <strong>Thể Loại: </strong>
                    <span>{writeTextForPickedGenres()}</span>
                </p>
                <p>
                    <strong>Ngày công chiếu: </strong>
                    <span>{moment(ReleaseDate, 'ddd, DD MMM YYYY HH:mm:ss [GMT]').format('DD/MM/YYYY HH:mm')}</span>
                </p>
                <p>
                    <strong>Quốc gia: </strong>
                    <span>{Country.Name}</span>
                </p>
                <p>
                    <strong>Ngôn ngữ: </strong>
                    <span>{Language}</span>
                </p>
                <p>
                    <strong>Loại phim: </strong>
                    <span>{typeMovie(Type)}</span>
                </p>
                <p>
                    <strong>Lượt xem: </strong>
                    <span>{Viewed || 0}</span>
                </p>

                <div className="rating">
                    <div className="stars">
                        <Rating
                            onClick={handleRating}
                            transition
                            size={25}
                            initialValue={ratingData}
                            allowFraction
                            fillColor="#fe2c55"
                        />
                    </div>
                    <div className="rating-text">
                        ({greaterThan0 ? `Bạn đã đánh giá ${ratingData} sao` : 'Bạn chưa đánh giá'})
                    </div>
                </div>

                <div className="actions">
                    {watchNowBtn && (
                        <button className="watch-now-btn" onClick={() => goToWatchMovie(1)}>
                            <FontAwesomeIcon icon={faCirclePlay} />
                            <span>Xem ngay</span>
                        </button>
                    )}
                    <button className="add-to-favorite" onClick={handleAddFavoriteMovie}>
                        {userFavoriteMovies && userFavoriteMovies.includes(Id) ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="favorite-icon">
                                    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                                </svg>
                                <span>Đã thích phim</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="favorite-icon">
                                    <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
                                </svg>
                                <span>Thêm vào yêu thích</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const EpisodeList = ({ episodes, movieDetail }) => {
    const navigate = useNavigate();

    const navigateToEp = (epNum) => {
        navigate(`/${movieDetail.Type}/watch/${movieDetail.Id}?ep=${epNum}`);
    };

    return (
        <div className="episode-list">
            <h2 className="episode-list-title">DANH SÁCH TẬP</h2>
            {movieDetail.Type === 'movie' ? (
                <div className="episode-buttons">
                    <button className="episode-button" onClick={() => navigateToEp(1)}>
                        Tập Full
                    </button>
                </div>
            ) : (
                <div className="episode-buttons">
                    {episodes.map(({ EpisodeNumber }) => (
                        <button
                            key={EpisodeNumber}
                            className="episode-button"
                            onClick={() => navigateToEp(EpisodeNumber)}
                        >
                            {`Tập ${EpisodeNumber}`}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Overview = ({ overview }) => {
    return (
        <div className="overview">
            <h4>TÓM TẮT PHIM</h4>
            <div className="overview-text">{overview}</div>
        </div>
    );
};

function InforDetail() {
    const [genres, setGenres] = useState([]);
    const { id } = useParams();
    const [movieDetail, setMovieDetail] = useState();
    const [loading, setLoading] = useState(true);
    const [episodes, setEpisodes] = useState();

    const getEpisodesHandler = async () => {
        try {
            const { data } = await getEpisodes(id);
            setEpisodes(data);
        } catch (error) {
            console.error('>>> error:', error);
        }
    };

    const getGenres = async () => {
        try {
            const { data } = await getMulti(id);
            setGenres(data);
        } catch (error) {
            console.error('>>> error:', error);
        }
    };

    async function getMovieDetail() {
        setLoading(true);
        try {
            const { data } = await requestApi.getDetails(id);
            setMovieDetail((pre) => ({ ...pre, ...data }));
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
        setLoading(false);
    }

    useEffect(() => {
        getEpisodesHandler();
        getGenres();
        getMovieDetail();
    }, [id]);

    return (
        movieDetail && (
            <div className="movie-details">
                <MovieCard movieDetail={movieDetail} genres={genres} watchNowBtn />
                {episodes && (
                    <EpisodeList episodes={episodes} type={movieDetail.Type.toLowerCase()} movieDetail={movieDetail} />
                )}
                <Overview overview={movieDetail.Overview} />
                <Comment MovieId={movieDetail.Id} />
            </div>
        )
    );
}

export default InforDetail;
