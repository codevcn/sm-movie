import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faRotate, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadVideo } from '../../../apiService/video';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Spinner from 'react-bootstrap/Spinner';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import './Upload-Video.scss';

//https://res.cloudinary.com/doe8ogwij/video/upload/v1732879138/web-xem-phim/videos/akyz0w1cjjxjx6njp2rl.mp4
export const UploadVideo = ({ setMovieURL, movieURL }) => {
    const [video, setVideo] = useState();
    const [uploadStatus, setUploadStatus] = useState();

    const pickVideo = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
        }
    };

    const handleUploadVideo = async () => {
        if (!video) {
            toast.warn('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', video);

        setUploadStatus('loading');
        let url = null;
        try {
            const data = await uploadVideo(formData);
            url = data.url;
        } catch (error) {
            toast.error('Failed to upload video.');
        }
        if (url) {
            toast.success('Upload successful!');
            setMovieURL(url);
        }
        setUploadStatus('done');
    };

    if (movieURL) {
        const videoSrc = {
            type: 'video',
            sources: [
                {
                    src: movieURL,
                    type: 'video/mp4',
                },
            ],
        };

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

        return (
            <div className="upload-video-section">
                <h2 className="upload-title">Phim đã tải lên</h2>
                <div id="video-player-wrapper">
                    <Plyr source={videoSrc} options={plyrOptions} />
                </div>
            </div>
        );
    }

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
            <button className="upload-video-submit-btn" onClick={handleUploadVideo}>
                {uploadStatus && uploadStatus === 'loading' ? (
                    <Spinner animation="border" role="status"></Spinner>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faFileArrowUp} />
                        <span>Tải video lên hệ thống</span>
                    </>
                )}
            </button>
        </div>
    );
};
