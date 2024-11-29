/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './Detail.module.scss';
import classNames from 'classnames/bind';

import requestApi from '~/apiService';
import { Img } from '~/apiService/instance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import InforDetail from '~/layout/component/InforDetail';
const cs = classNames.bind(styles);

function Detail() {
    const { category, id } = useParams();
    const [movieDetail, setMovieDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        async function getDeTailMovie() {
            const result = await requestApi.getDetails(id);
            setMovieDetail(result.data);
            setLoading(false);
        }
        getDeTailMovie();
    }, [id]);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cs('wrapper')}>
            {loading ? (
                <div className={cs('wrapiconload')}>
                    <FontAwesomeIcon className={cs('iconLoading')} icon={faSpinner} />
                </div>
            ) : (
                <>
                    <div
                        className={cs('backgroudImg')}
                        style={{
                            backgroundImage: `url("${Img.baseImg(
                                'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2ltcGxlJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww',
                            )}")`,
                        }}
                    >
                        {width > 740 && (
                            <Link
                                to={`/${movieDetail.Type || category}/${movieDetail.Id}/watch/${movieDetail.Slug}`}
                                className={cs('playBtn')}
                            >
                                <FontAwesomeIcon className={cs('icon')} icon={faPlayCircle} />
                                <span>Xem Ngay</span>
                            </Link>
                        )}
                    </div>
                    <InforDetail width={width} movieDetail={movieDetail} />
                </>
            )}
        </div>
    );
}

export default Detail;
