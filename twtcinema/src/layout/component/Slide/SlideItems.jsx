import styles from './Slide.module.scss';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';

const cs = classNames.bind(styles);

function SlideItems({ category, movie }) {
    const Navigate = useNavigate();

    return (
        <div className={cs('slide-item')} style={{ backgroundImage: `url("${movie.PosterPath}")` }}>
            <div className={cs('content')}>
                <h2 className={cs('title')}>{movie.Title || movie.Name}</h2>
                <div className={cs('overview')}>{movie.Overview}</div>
                <button
                    className={cs('watchbtn')}
                    onClick={() => {
                        Navigate(`/${category ?? 'tv'}/${movie.Id}`);
                    }}
                >
                    Xem ngay
                </button>
            </div>
        </div>
    );
}

export default SlideItems;
