import styles from './Upload-Video.module.scss';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const cs = classNames.bind(styles);

export const UploadVideo = ({ setMovieURL }) => {
    const [video, setVideo] = useState();

    const pickVideo = (e) => {
        setVideo(e.target.files[0]);
    };

    return (
        <div className={cs('upload-video-section')}>
            <h2 className={cs('upload-title')}>Tải phim lên</h2>
            <input type="file" hidden id="upload-video-input" onChange={pickVideo} />
            <label className={cs('video-uploader')} htmlFor="upload-video-input">
                <div className={cs('upload-icon-wrapper')}>
                    <div className={cs('spinner')}></div>
                    <FontAwesomeIcon icon={faCloudArrowUp} className={cs('upload-icon')} />
                </div>
                <div className={cs('upload-guide-text')}>Choose a file from your device</div>
            </label>
            <button className={cs('submit-btn')}>Tải lên</button>
        </div>
    );
};
