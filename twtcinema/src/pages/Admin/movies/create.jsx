/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import styles from './Movies.module.scss';
import classNames from 'classnames/bind';
import { Col, Form, Row, Button, Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createMovie } from '~/apiService/movie';
import { getAll } from '~/apiService/genres';

import { UploadEpisode } from './upload-episode';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getAllCountries } from '../../../apiService/country';
import { uploadImage } from '../../../apiService/user';

const cs = classNames.bind(styles);

const PickGenresModal = ({ setTypedData, setShowModal, showModal, genres, typedData }) => {
    const handleGenreToggle = (genreId) => {
        setTypedData((pre) => {
            const isSelected = pre.genreIds.includes(genreId);
            return {
                ...pre,
                genreIds: isSelected
                    ? pre.genreIds.filter((id) => id !== genreId) // Bỏ chọn thể loại
                    : [...pre.genreIds, genreId], // Thêm thể loại
            };
        });
    };

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} className={cs('pick-genres-modal')}>
            <Modal.Header closeButton>
                <Modal.Title>Chọn Thể Loại</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cs('genres-list')}>
                    {genres.map(({ Id, Name }) => (
                        <Form.Check key={Id} className={cs('form-group-checkbox')}>
                            <Form.Check.Input
                                type="checkbox"
                                checked={typedData.genreIds.includes(Id)}
                                onChange={() => handleGenreToggle(Id)}
                                id={`genre-input-${Id}`}
                            />
                            <Form.Check.Label htmlFor={`genre-input-${Id}`}>{Name}</Form.Check.Label>
                        </Form.Check>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button className={cs('bottom-btn')} variant="secondary" onClick={() => setShowModal(false)}>
                    Đóng
                </Button>
                <Button className={cs('bottom-btn')} variant="primary" onClick={() => setShowModal(false)}>
                    Xác Nhận
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const CreateMovie = () => {
    const [genres, setGenres] = useState([]);
    const [countries, setCountries] = useState([]);
    const [posTer, setPosTer] = useState();
    const [editInfoStatus, setEditInfoStatus] = useState();
    const [movieInfo, setMovieInfo] = useState({ type: 'MOVIE', id: null });
    const [typedData, setTypedData] = useState({ genreIds: [] });
    const [openPickGenres, setOpenPickGenres] = useState();

    const { register, handleSubmit } = useForm();

    const validateData = (data) => {
        const { Name, Type, Genres, Language, CountryId, Overview, ReleaseDate, PosterPath } = data;
        if (
            Name &&
            Type &&
            Genres &&
            Genres.length > 0 &&
            Language &&
            CountryId &&
            Overview &&
            ReleaseDate &&
            PosterPath
        ) {
            return true;
        }
        return false;
    };

    const Onsubmit = async (data) => {
        console.log('>>> posTer:', posTer);
        console.log('>>> data:', data);
        console.log('>>> typed data:', typedData);

        const { ...movie_info } = data;
        movie_info.PosterPath = posTer;
        const pickedGenreIds = typedData.genreIds;

        if (!validateData({ ...movie_info, Genres: pickedGenreIds })) {
            toast.error('Vui lòng không bỏ trống bất kì trường nào!');
            return;
        }

        setEditInfoStatus('loading');
        try {
            const res = await createMovie({ movie_info, genre_ids: pickedGenreIds });
            console.log('>>> create movie res:', res);
            setMovieInfo((pre) => ({ ...pre, id: res.movie.Id }));
            toast.success(res.message);
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
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
                console.error('>>> error:', error);
            }
        };
        const getCountries = async () => {
            try {
                const { data } = await getAllCountries();
                setCountries(data);
            } catch (error) {
                console.error('>>> error:', error);
            }
        };
        getGenres();
        getCountries();
    }, []);

    const handleUploadImg = async (e) => {
        const image = e.target.files[0];
        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            try {
                const res = await uploadImage(formData);
                setPosTer(res.url);
            } catch (error) {
                toast.error('Tải lên bìa phim không thành công!');
            }
        }
    };

    const writeTextForPickedGenres = (genreIds) => {
        if (genreIds.length > 0 && genres.length > 0) {
            return genreIds.map((genreId, index) => `${genres.find(({ Id }) => Id === genreId).Name}`).join(', ');
        } else {
            return 'Bạn chưa chọn thể loại!';
        }
    };

    return (
        <div className={cs('movie')}>
            <h3 className="text-center mb-3 mt-5 fs-1 fw-bold">Thêm phim mới</h3>
            <Form className={cs('movie_form')} onSubmit={handleSubmit(Onsubmit)}>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên phim</Form.Label>
                            <Form.Control required type="text" {...register('Name')} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Danh mục</Form.Label>
                            <Form.Select {...register('Type', { onChange: changeType })}>
                                <option value="MOVIE">Phim Lẻ</option>
                                <option value="SERIES">Phim Dài Tập</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Thể Loại</Form.Label>
                            <div className={cs('pick-genres-input-container')}>
                                <Form.Control
                                    required
                                    type="text"
                                    value={writeTextForPickedGenres(typedData.genreIds)}
                                    readOnly
                                    onClick={() => setOpenPickGenres(true)}
                                />
                                <button type="button" onClick={() => setOpenPickGenres(true)}>
                                    Chọn thể loại
                                </button>
                            </div>
                        </Form.Group>
                        <PickGenresModal
                            genres={genres}
                            openPickGenres={openPickGenres}
                            setShowModal={setOpenPickGenres}
                            showModal={openPickGenres}
                            setTypedData={setTypedData}
                            typedData={typedData}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngôn ngữ</Form.Label>
                            <Form.Control required type="text" {...register('Language')} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Quốc gia</Form.Label>
                            <Form.Select {...register('CountryId')}>
                                {countries.map(({ Id, Name }) => (
                                    <option key={Id} value={Id}>
                                        {Name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Tóm tắt phim</Form.Label>
                            <Form.Control required as="textarea" type="text" {...register('Overview')} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày phát hành</Form.Label>
                            <Form.Control required type="date" {...register('ReleaseDate')} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh đại diện</Form.Label>
                            {posTer && <img className={cs('movie_backdrop_path')} src={posTer} alt="Ảnh đại diện" />}
                            <Form.Control
                                required
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

            {movieInfo.id && <UploadEpisode movieType={movieInfo.type} movieId={movieInfo.id} />}
        </div>
    );
};

export default CreateMovie;
