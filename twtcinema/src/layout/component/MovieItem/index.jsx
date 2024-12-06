import { Img } from '~/apiService/instance';
import { Link } from 'react-router-dom';
import styles from './MovieItem.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar,faEye  } from '@fortawesome/free-solid-svg-icons';
import LazyLoad from 'react-lazy-load';

const cs = classNames.bind(styles);

function MovieItem({ movie, className, category }) {
    const movieType = movie.Type.toLowerCase();

    const settingNavLink = () => {
        if (category === 'history') {
            return `/${movieType}/watch/${movie.Id}?ep=${movie.Episode?.EpisodeNumber || 1}`;
        } else {
            return `/${movieType ?? 'tv'}/${movie.Id}`;
        }
    };

    return (
        <Link to={settingNavLink()} className={cs('card', className)}>
            <LazyLoad threshold={0.8}>
                <img src={Img.posterImg(movie.PosterPath)} style={{ width: '100%' }} alt="Bìa phim" />
            </LazyLoad>
            {category === 'history' ? (
                <div className={cs('ep-number')}>{`Tập ${movie.Episode?.EpisodeNumber || 1}`}</div>
            ) : (<>
                {(movie.Rating || movie.AverageRating) && <div className={cs('rate')}>
                    <span>{movie.Rating || movie.AverageRating || 0}</span>
                    <FontAwesomeIcon className={cs('icon-star')} icon={faStar} />
                </div>}
                {movie.Viewed && <div className={cs('view')}>
                    <span>{movie.Viewed || 0}</span>
                    <FontAwesomeIcon className={cs('icon-view')} icon={faEye } />
                </div>}</>
            )}
            <p className={cs('movie-name')}>{movie.Name}</p>
        </Link>
    );
}

export default MovieItem;
