/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import styles from './Movies.module.scss';
import classNames from 'classnames/bind';
import { Col, Form, Row } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

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
    const [genres, setGenres] = useState([]);
    const [posTer, setPosTer] = useState(
        'https://firebasestorage.googleapis.com/v0/b/twtcinema.appspot.com/o/images%2FPicture2.png?alt=media&token=acb50eb3-ec9c-40b2-b191-6e250e97b9b2',
    );
    const [editInfoStatus, setEditInfoStatus] = useState();
    const [movieInfo, setMovieInfo] = useState({ type: 'MOVIE', id: null });

    const { showToastMessage } = useContext(AuthContext);
    const storage = getStorage();

    const { register, handleSubmit } = useForm();

    const Onsubmit = async (data) => {
        setEditInfoStatus('loading');
        const { Genres, ...movie_info } = data;
        if (posTer) {
            movie_info.PosterPath = posTer;
        }
        console.log('>>> posTer:', posTer);
        console.log('>>> Genres:', Genres);
        console.log('>>> data:', data);
        console.log('>>> movie_info:', movie_info);

        try {
            const res = await createMovie({ movie_info, genre_ids: [Genres] });
            setMovieInfo((pre) => ({ ...pre, id: res.movie.Id }));
            showToastMessage('success', res.message);
        } catch (error) {
            showToastMessage('error', error);
        }
        setEditInfoStatus('done');
    };

    const changeType = (e) => {
        const type = e.target.value;
        setMovieInfo((pre) => ({ ...pre, type }));
    };

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
                            console.log('>>> error:', error);
                        }
                    });
                },
            );
        }
    };

    return (
        <div className={cs('movie')}>
            <h3 className="text-center mb-3 fs-1 fw-bold">Sửa thông tin cho phim mới</h3>
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
                            <Form.Select {...register('Type', { value: movieInfo.type, onChange: changeType })}>
                                <option value="MOVIE">Phim Lẻ</option>
                                <option value="SERIES">Phim Dài Tập</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
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
                                accept="image/*"
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
                            <span>Thêm phim</span>
                        </>
                    )}
                </button>
            </Form>

            <UploadVideo movieType={movieInfo.type} movieId={movieInfo.id} />
        </div>
    );
};

export default CreateMovie;
