import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faRotate, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadEpisode } from '../../../apiService/episode';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Spinner from 'react-bootstrap/Spinner';
import 'plyr-react/plyr.css';
import './Upload-episode.scss';
import { useNavigate } from 'react-router-dom';

//https://res.cloudinary.com/doe8ogwij/video/upload/v1732879138/web-xem-phim/videos/akyz0w1cjjxjx6njp2rl.mp4
export const UploadEpisode = ({ movieType, movieId }) => {
    const [video, setVideo] = useState();
    const [uploadStatus, setUploadStatus] = useState();
    const naviagte = useNavigate();

    const pickVideo = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
        }
    };

    const handleUploadEpisode = async () => {
        if (!video) {
            toast.warn('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', video);
        formData.append('movie_id', movieId);
        formData.append('ep_num', 1);

        setUploadStatus('loading');
        let url = null;
        try {
            const data = await uploadEpisode(formData);
            url = data.url;
        } catch (error) {
            toast.error('Tải lên tập phim thất bại!');
        }
        if (url) {
            toast.success('Tải lên tập phim thành công!');
            setTimeout(() => {
                naviagte('/admin/dashboard/movies');
            }, 1000);
        }
        setUploadStatus('done');
    };

    return (
        <div className="upload-video-section">
            <h2 className="upload-title">Tải phim lên</h2>
            <input type="file" hidden id="upload-video-input" onChange={pickVideo} accept="video/*" />
            <label className={`video-picker ${video ? '' : 'cur-pointer'}`} htmlFor={video ? '' : 'upload-video-input'}>
                {video ? (
                    <>
                        <div className="file-displayer">
                            <div className="file-icon-wrapper">
                                <svg viewBox="0 0 57 69" className="file-icon">
                                    <path
                                        d="M36.7 0H0v69h57V20L36.7 0zM38 7.9L49 18.5H38V7.8zM4.7 64.4V4.6h28.8v18.6h18.9v41.2H4.7z"
                                        fillRule="nonzero"
                                    ></path>
                                </svg>
                            </div>
                            <div className="file-info">
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="upload-video-file-name-tooltip">
                                            <span className="file-name">{video.name}</span>
                                        </Tooltip>
                                    }
                                >
                                    <span className="file-name">{video.name}</span>
                                </OverlayTrigger>
                            </div>
                        </div>
                        <label
                            className={`change-file-btn ${video ? 'cur-pointer' : ''}`}
                            htmlFor={video ? 'upload-video-input' : ''}
                        >
                            <FontAwesomeIcon icon={faRotate} />
                            <span>Đổi file</span>
                        </label>
                    </>
                ) : (
                    <>
                        <div className="upload-icon-wrapper">
                            <div className="spinner"></div>
                            <FontAwesomeIcon icon={faCloudArrowUp} className="upload-icon" />
                        </div>
                        <div className="upload-guide-text">Chọn một file từ thiết bị của bạn</div>
                    </>
                )}
            </label>
            <button className="upload-video-submit-btn" onClick={handleUploadEpisode}>
                {uploadStatus && uploadStatus === 'loading' ? (
                    <Spinner animation="border" role="status"></Spinner>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faFileArrowUp} />
                        <span>{'Tải lên tập ' + (movieType.toLowerCase() === 'movie' ? 'phim' : '1')}</span>
                    </>
                )}
            </button>
        </div>
    );
};
