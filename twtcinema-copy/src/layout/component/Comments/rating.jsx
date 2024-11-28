import { Rating } from 'react-simple-star-rating';
import classNames from 'classnames/bind';
import styles from './Rating.module.scss';

const cs = classNames.bind(styles);

export const RatingSection = ({ value }) => {
    const greaterThan0 = value && value > 0;
    return (
        <div className={cs('rating-section')}>
            <h2>Ratings</h2>
            <div className={cs('rating-container')}>
                <Rating size={25} initialValue={greaterThan0 ? value : 0} allowFraction fillColor="#fe2c55" />
                <div>({greaterThan0 ? `Bạn đã đánh giá ${value} sao` : 'Bạn chưa đánh giá'})</div>
            </div>
        </div>
    );
};
