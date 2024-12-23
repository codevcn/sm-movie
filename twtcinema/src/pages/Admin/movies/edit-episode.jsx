/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faRotate, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getEpisodes, uploadEpisode, editEpisode, deleteEpisode } from '../../../apiService/episode';
import React from 'react';
import './Edit-episode.scss';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

const EpisodePreview = ({ epSource, epNum }) => {
    const [showModal, setShowModal] = useState(false);

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
        <>
            <Modal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                }}
                size="lg"
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-body-content">
                        <h2 className="mb-3">{'Bản xem trước tập ' + epNum}</h2>
                        {showModal && (
                            <div className="video-player-wrapper">
                                <Plyr
                                    source={{
                                        type: 'video',
                                        sources: [
                                            {
                                                src: epSource,
                                                type: 'video/mp4',
                                            },
                                        ],
                                    }}
                                    options={plyrOptions}
                                />
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowModal(false);
                        }}
                    >
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <label className="preview-ep-btn" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faEye} className="preview-ep-icon" />
                <span>Xem trước video</span>
            </label>
        </>
    );
};

const DeleteEpisode = ({ epId, setEpisodes }) => {
    const deletEpHandler = async () => {
        try {
            await deleteEpisode(epId);
            toast.success('Xóa thành công.');
            setEpisodes((pre) => pre.filter((ep) => ep.Id !== epId));
        } catch (error) {
            console.error('>>> error:', error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    };

    return (
        <label className="preview-ep-btn" onClick={deletEpHandler}>
            <FontAwesomeIcon icon={faTrash} className="preview-ep-icon" />
            <span>Xóa tập phim</span>
        </label>
    );
};

export const UploadEpisodes = ({ movieDetail }) => {
    const [episodes, setEpisodes] = useState([]);
    const [uploadNewEpLoading, setUploadNewEpLoading] = useState(false);
    const [changeVideoLoading, setChangeVideoLoading] = useState(false);
    const uploadInputRef = useRef();

    const episodes_len = (episodes && episodes.length) || 0;
    const nextEpNum = episodes_len > 0 ? episodes[episodes_len - 1].EpisodeNumber + 1 : 1;

    const { Id, TotalEpisodes } = movieDetail;
    const movieType = movieDetail.Type.toLowerCase();
    console.log('>>> stuff:', { movieDetail, episodes, movieType });

    const getEpisodesHandler = async () => {
        if (Id) {
            try {
                const { data } = await getEpisodes(Id);
                setEpisodes(data);
            } catch (error) {
                console.error('>>> error:', error);
            }
        }
    };

    useEffect(() => {
        getEpisodesHandler();
    }, []);

    const uploadNewEpisode = async (e) => {
        const video = e.target.files[0];
        if (video) {
            setUploadNewEpLoading(true);

            const formData = new FormData();
            formData.append('file', video);
            formData.append('movie_id', Id);
            formData.append('ep_num', nextEpNum);

            let data;
            try {
                data = await uploadEpisode(formData);
            } catch (error) {
                console.error('>>> error:', error);
                const msg = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(msg);
            }
            if (data && data.episode) {
                toast.success('Tải lên tập phim thành công!');
                setEpisodes((pre) => [...pre, data.episode]);
            }
            setUploadNewEpLoading(false);
            uploadInputRef.current.value = null;
        }
    };

    const changeVideo = async (e, ep_id) => {
        const video = e.target.files[0];
        if (video) {
            setChangeVideoLoading(true);

            const formData = new FormData();
            formData.append('file', video);

            try {
                const res = await editEpisode(ep_id, formData);
                if (res.success) {
                    toast.success(res.message);
                    setEpisodes((pre) =>
                        [...pre].map((ep) => {
                            if (ep.Id === ep_id) {
                                return { ...ep, Source: res.new_ep_url };
                            }
                            return ep;
                        }),
                    );
                }
            } catch (error) {
                const msg = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(msg);
            }
            setChangeVideoLoading(false);
        }
    };

    return (
        <div className="upload-eps-section">
            <input
                ref={uploadInputRef}
                type="file"
                id="upload-new-ep-input"
                accept="video/*"
                hidden
                onChange={uploadNewEpisode}
            />
            <h2 className="upload-eps-title">Tải lên các tập phim</h2>
            <div className="eps-list">
                {episodes &&
                    episodes.length > 0 &&
                    episodes.map(({ Id, Source, EpisodeNumber }, index) => (
                        <React.Fragment key={Id}>
                            <div key={Id} className="ep-container">
                                <span className="ep-text">Tập</span>
                                <input
                                    type="text"
                                    value={movieType === 'movie' ? 'Full' : EpisodeNumber}
                                    readOnly
                                    className="ep-number-value"
                                />
                                <input
                                    type="file"
                                    id={`change-video-input-${Id}`}
                                    hidden
                                    accept="video/*"
                                    onChange={(e) => changeVideo(e, Id)}
                                />
                                <label className="change-video-btn" htmlFor={`change-video-input-${Id}`}>
                                    {changeVideoLoading ? (
                                        <Spinner animation="border" className="spinner">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faRotate} className="change-video-icon" />
                                            <span>Đổi video</span>
                                        </>
                                    )}
                                </label>
                                <EpisodePreview epSource={Source} epNum={EpisodeNumber} />
                                {episodes_len - 1 === index && <DeleteEpisode epId={Id} setEpisodes={setEpisodes} />}
                            </div>
                        </React.Fragment>
                    ))}

                {(movieType === 'series' || (movieType === 'movie' && episodes_len === 0)) &&
                    episodes_len < TotalEpisodes && (
                        <label className="ep-picker" htmlFor="upload-new-ep-input">
                            <div className="upload-icon-wrapper">
                                {uploadNewEpLoading ? (
                                    <Spinner animation="border" className="spinner">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                ) : (
                                    <FontAwesomeIcon icon={faCloudArrowUp} className="upload-icon" />
                                )}
                            </div>
                            <div className="ep-number-value">
                                {(uploadNewEpLoading ? 'Đang tải lên tập ' : 'Tải lên tập ') + nextEpNum}
                            </div>
                        </label>
                    )}
            </div>
        </div>
    );
};
