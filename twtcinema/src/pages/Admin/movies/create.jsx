/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import styles from './Movies.module.scss';
import classNames from 'classnames/bind';
import { Col, Form, Row } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { createMovie } from '~/apiService/movie';
import { getAll } from '~/apiService/genres';
import { AuthContext } from '~/context';

import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { UploadVideo } from './upload-video';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const cs = classNames.bind(styles);

const CreateMovie = () => {
    const [isTvShow, setIsTvShow] = useState(false);
    const [genres, setGenres] = useState([]);
    const [posTer, setPosTer] = useState(
        'https://firebasestorage.googleapis.com/v0/b/twtcinema.appspot.com/o/images%2FPicture2.png?alt=media&token=acb50eb3-ec9c-40b2-b191-6e250e97b9b2',
    );
    const [movieURL, setMovieURL] = useState(
        'https://res.cloudinary.com/doe8ogwij/video/upload/v1732879138/web-xem-phim/videos/akyz0w1cjjxjx6njp2rl.mp4',
    );
    const [editInfoStatus, setEditInfoStatus] = useState();

    const { showToastMessage } = useContext(AuthContext);
    const naviagte = useNavigate();
    const storage = getStorage();

    const { register, handleSubmit, reset, setValue } = useForm();

    const Onsubmit = async (data) => {
        setEditInfoStatus('loading');
        const { Genres, ...movie_info } = data;
        if (posTer) {
            movie_info.PosterPath = posTer;
        }
        console.log('>>> posTer:', posTer);
        console.log('>>> data:', data);
        console.log('>>> movie_info:', movie_info);

        try {
            const res = await createMovie({ movie_info, genres: Genres });
            naviagte('/admin/dashboard/movies');
            showToastMessage('success', res.message);
            reset();
        } catch (error) {
            showToastMessage('error', error);
        }
        setEditInfoStatus('done');
    };

    const handleChangeCate = (e) => {
        if (e.target.value == 'tv') {
            setIsTvShow(true);
        } else {
            setIsTvShow(false);
        }
    };

    useEffect(() => {
        setValue('Slug', movieURL);
    }, [movieURL]);

    useEffect(() => {
        const getGenres = async () => {
            try {
                const res = await getAll();
                setGenres(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        getGenres();
    }, []);

    const handleUploadImg = (e) => {
        const image = e.target.files[0];
        if (image) {
            const storageRef = ref(storage, `images/${image.name}`);
            const uploadTask = uploadBytesResumable(storageRef, image);
            uploadTask.on(
                'state_changed',
                (snapshot) => {},
                (error) => {
                    console.log(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        try {
                            setPosTer(downloadURL);
                        } catch (error) {
                            console.log(error);
                            // setLoading(false);
                        }
                    });
                },
            );
        }
    };

    return (
        <div className={cs('movie')}>
            <UploadVideo setMovieURL={setMovieURL} movieURL={movieURL} />

            <h3 className="text-center mb-3 fs-1 mt-5 fw-bold">Sửa thông tin cho phim mới</h3>
            <Form className={cs('movie_form')} onSubmit={handleSubmit(Onsubmit)}>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên phim</Form.Label>
                            <Form.Control required type="text" {...register('Name', { value: 'Chú bé trắng' })} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Danh mục</Form.Label>
                            <Form.Select
                                {...register('Type', { value: 'MOVIE' })}
                                onChange={(e) => handleChangeCate(e)}
                            >
                                <option value="MOVIE">Phim Lẻ</option>
                                <option value="SERIES">Phim Dài Tập</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    {isTvShow && (
                        <>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số tập phim</Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        {...register('TotalEpisodes', { value: '1' })}
                                    />
                                </Form.Group>
                            </Col>
                        </>
                    )}
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Thể loại</Form.Label>
                            <Form.Select {...register('Genres', { value: '1' })} className={cs('movie_form_genres')}>
                                {genres.map((genres, index) => (
                                    <option value={genres.Id} key={index}>
                                        {genres.Name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngôn ngữ</Form.Label>
                            <Form.Select {...register('Language', { value: 'en' })}>
                                <option value="en">Tiếng Anh</option>
                                <option value="vi">Tiếng Việt</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Quốc gia</Form.Label>
                            <Form.Control required type="text" {...register('CountryId', { value: '1' })} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>URL phim</Form.Label>
                            <Form.Control required type="text" {...register('Slug', { value: movieURL })} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Tóm tắt phim</Form.Label>
                            <Form.Control
                                required
                                as="textarea"
                                type="text"
                                {...register('Overview', { value: 'Chú bé trắng chơi nền trên tuyết!!!' })}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày phát hành</Form.Label>
                            <Form.Control required type="date" {...register('ReleaseDate', { value: '2024-11-15' })} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Điểm đánh giá</Form.Label>
                            <Form.Control required type="text" {...register('IbmPoints', { value: '9.12' })} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh đại diện</Form.Label>
                            {posTer && <img className={cs('movie_backdrop_path')} src={posTer} alt="Ảnh đại diện" />}
                            <Form.Control
                                // required
                                className="mt-4"
                                type="file"
                                style={{ border: 'none' }}
                                onChange={handleUploadImg}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <button className={cs('edit-video-info-submit-btn')}>
                    {editInfoStatus && editInfoStatus === 'loading' ? (
                        <Spinner animation="border" role="status"></Spinner>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faCircleCheck} />
                            <span>Lưu thông tin phim</span>
                        </>
                    )}
                </button>
            </Form>
        </div>
    );
};

export default CreateMovie;
