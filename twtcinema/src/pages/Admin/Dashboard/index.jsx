import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import styles from './Dashboard.module.scss';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { getAllCount } from '~/apiService/user';
import { getCountMovieMonth, getTotalView } from '~/apiService/movie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClapperboard, faComment, faPlayCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getCountCommentMonth } from '~/apiService/comment';
import { Link } from 'react-router-dom';
import instance from '../../../apiService/instance';

const cs = classNames.bind(styles);

function StatisticDashboard() {
    const [totalUser, setTotalUser] = useState([]);
    const [totalView, setTotalView] = useState(0);
    const [countMovie, setCountMovie] = useState(0);
    const [countComment, setCountComment] = useState(0);
    const [loading, setLoading] = useState(true);
    console.log('>>> stuff:', { totalUser, totalView, countMovie, countComment });

    useEffect(() => {
        const getCount = async () => {
            setLoading(true);
            try {
                await instance.get('/user/upkkk');
                const userByMonth = await getAllCount();
                const movieByMonth = await getCountMovieMonth();
                const commentByMonth = await getCountCommentMonth();
                const totalView = await getTotalView();
                setTotalUser(userByMonth.total);
                setCountMovie(movieByMonth.data);
                setCountComment(commentByMonth.data);
                setTotalView(totalView.count);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(errorMessage);
            }
            setLoading(false);
        };
        getCount();
    }, []);

    return (
        <div className={cs('wrapper')}>
            <div className={cs('box-contain')}>
                <div className={cs('box-item')}>
                    <div className={cs('box-item-info')}>
                        <p>
                            <span>
                                {loading ? <FontAwesomeIcon className={cs('loading')} icon={faSpinner} /> : countMovie}
                            </span>
                            <span>Phim Mới tháng này</span>
                        </p>
                        <FontAwesomeIcon icon={faClapperboard} />
                    </div>
                    <Link to={`/admin/dashboard/movies/month/${new Date().getMonth() + 1}`}>Chi tiết</Link>
                </div>
                <div className={cs('box-item')}>
                    <div className={cs('box-item-info')}>
                        <p>
                            <span>
                                {loading ? (
                                    <FontAwesomeIcon className={cs('loading')} icon={faSpinner} />
                                ) : (
                                    countComment
                                )}
                            </span>
                            <span>Tương tác tháng này</span>
                        </p>
                        <FontAwesomeIcon icon={faComment} />
                    </div>
                    <Link to="/admin/dashboard/movies/comment/month">Chi tiết</Link>
                </div>

                <div className={cs('box-item')}>
                    <div className={cs('box-item-info')}>
                        <p>
                            <span>
                                {loading ? <FontAwesomeIcon className={cs('loading')} icon={faSpinner} /> : totalView}
                            </span>
                            <span>Tổng Số Lượt Xem</span>
                        </p>
                        <FontAwesomeIcon icon={faPlayCircle} />
                    </div>
                    <Link to="/admin/dashboard/movies/">Chi tiết</Link>
                </div>
                {/* <div className={cs('box-item')}></div> */}
            </div>
            
            <h4>Số Lượng Người Dùng Đăng Kí Trên Hệ Thống</h4>
            <LineChart width={1200} height={380} data={totalUser} style={{ margin: '0 auto', fontSize: '1.5rem' }}>
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#f5f5f5" />
                <Legend />
            </LineChart>
        </div>
    );
}

export default StatisticDashboard;
