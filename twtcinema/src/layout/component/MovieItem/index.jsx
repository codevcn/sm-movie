import { Img } from '~/apiService/instance';
import { Link } from 'react-router-dom';
import styles from './MovieItem.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import LazyLoad from 'react-lazy-load';

const cs = classNames.bind(styles);

function MovieItem({ type, movie, className }) {
    return (
        <Link to={`/${type ?? 'tv'}/${movie.Id}`} className={cs('card', className)}>
            <LazyLoad threshold={0.8}>
                <img src={Img.posterImg(movie.PosterPath)} style={{ width: '100%' }} alt="Bìa phim" />
            </LazyLoad>
            <div className={cs('rate')}>
                <span>{movie.Rating || 0}</span>
                <FontAwesomeIcon className={cs('icon')} icon={faStar} />
            </div>
            <p>{movie.Name}</p>
        </Link>
    );
}

export default MovieItem;
