/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import classNames from 'classnames/bind';
import styles from './Comment.module.scss';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import moment from 'moment/moment';
import 'moment/locale/vi';
import image from '~/assets/Images';
import Wrapper from '~/components/Popper';
import { deleteComment, getCommentByMovie, postComment, updateComment } from '~/apiService/comment';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const cs = classNames.bind(styles);

function Comment({ MovieId }) {
    moment.locale('vi');
    const [menu, setMenu] = useState(false);
    const [cmtValueInput, setCmtValueInput] = useState('');
    const [comments, setComments] = useState();
    const [cmtId, setCmtId] = useState();
    const [showUpdateBtn, setShowUpdateBtn] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));

    const getComment = async () => {
        try {
            const res = await getCommentByMovie(MovieId);
            setComments(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getComment();
    }, [MovieId]);

    //add comment
    const sendComment = async () => {
        const trimmed_cmt = cmtValueInput.trim();
        if (trimmed_cmt) {
            let success = false;
            try {
                await postComment({
                    UserId: user.id,
                    MovieId: MovieId,
                    Content: trimmed_cmt,
                });
                success = true;
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(errorMessage);
            }
            if (success) {
                toast.success('Bình luận thành công!');
                getComment();
                setCmtValueInput('');
            }
        }
    };

    //update comment
    const handleUpdateContent = async (id, content) => {
        const elementContent = document.getElementById(id);
        if (content != elementContent.innerText) {
            try {
                await updateComment(id, { Content: elementContent.innerText });
                getComment();
                setShowUpdateBtn(null);
                toast.success('Cập nhật bình luận thành công!');
            } catch (error) {
                const msg = error.response?.data?.message || 'Có lỗi xảy ra';
                toast.error(msg);
            }
        } else {
            setShowUpdateBtn(null);
        }
    };

    const handleCancle = (id, content) => {
        const elementContent = document.getElementById(id);
        elementContent.innerText = content;
        setShowUpdateBtn(null);
    };

    //delete comment
    const handleDeleteCmt = async (id) => {
        try {
            await deleteComment(id);
            getComment();
            toast.success('Đã xóa bình luận thành công!');
            // if (id == showUpdateBtn) setShowUpdateBtn(null);
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        }
    };

    return (
        <div className={cs('comment')}>
            <h4 className={cs('titleComment')}>BÌNH LUẬN</h4>
            <div className={cs('contentBox')}>
                {user ? (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendComment();
                        }}
                        style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                        <img src={user.avatar || image.avatar} alt="" className={cs('avatarImg')} />
                        <input
                            type="text"
                            className={cs('InputComment')}
                            placeholder="Nhập bình luận..."
                            required={true}
                            onInvalid={(e) => e.target.setCustomValidity('Hãy nhập bình luận của bạn')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            value={cmtValueInput}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                if (!inputValue.startsWith(' ')) {
                                    setCmtValueInput(e.target.value);
                                }
                            }}
                        />
                        <button className={cs('btnSend')}>Đăng</button>
                    </form>
                ) : (
                    <h2 className={cs('textNote')}>
                        Bạn cần <Link to="/login">đăng nhập </Link> để comments
                    </h2>
                )}
            </div>

            {comments && comments.length > 0 ? (
                <>
                    <ul className={cs('containComment')}>
                        {comments.map((comment, index) => (
                            <li key={comment.Id} className={cs('commentItem')}>
                                <img
                                    src={comment.User.Avatar || image.avatar}
                                    alt="Ảnh đại diện"
                                    className={cs('avatarImg')}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className={cs('commentItem-wrap')}>
                                        <h2>{comment.User.Name}</h2>
                                        <p
                                            className={cs('contentComment')}
                                            contentEditable={comment.Id == showUpdateBtn}
                                            suppressContentEditableWarning={true}
                                            id={comment.Id}
                                            style={
                                                comment.Id == showUpdateBtn
                                                    ? {
                                                          outline: '2px solid rgba(22, 24, 35, 0.2)',
                                                          borderRadius: '10px',
                                                          padding: '2px 10px',
                                                      }
                                                    : {}
                                            }
                                        >
                                            {comment.Content}
                                        </p>
                                        {comment.Id == showUpdateBtn && (
                                            <button
                                                style={{
                                                    display: 'block',
                                                    backgroundColor: 'rgba(22, 24, 35, 0.1)',
                                                    color: 'black',
                                                    marginLeft: '10px',
                                                }}
                                                onClick={() => handleCancle(comment.Id, comment.Content)}
                                            >
                                                Hủy
                                            </button>
                                        )}

                                        {comment.Id == showUpdateBtn && (
                                            <button
                                                style={{ display: 'block' }}
                                                onClick={() => handleUpdateContent(comment.Id, comment.Content)}
                                            >
                                                Cập nhật
                                            </button>
                                        )}
                                    </div>
                                    <span className={cs('timeComment')}>
                                        {moment(comment.CreatedAt).fromNow().replace('vài giây trước', 'vừa xong')}
                                    </span>
                                </div>
                                {user && comment.User.Id == user.id && (
                                    <div>
                                        <Tippy
                                            interactive
                                            visible={menu && comment.Id == cmtId}
                                            offset={[0, -2]}
                                            delay={[0, 700]}
                                            placement="bottom"
                                            render={(attrs) => (
                                                <div className={cs('more-options')} tabIndex="-1" {...attrs}>
                                                    <Wrapper className={cs('menu-popper')}>
                                                        <button
                                                            className={cs('btn')}
                                                            onClick={() => {
                                                                setMenu(false);
                                                                setShowUpdateBtn(comment.Id);
                                                            }}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setMenu(false);
                                                                handleDeleteCmt(comment.Id);
                                                            }}
                                                            className={cs('btn')}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </Wrapper>
                                                </div>
                                            )}
                                            onClickOutside={() => setMenu(false)}
                                        >
                                            <i
                                                onClick={() => {
                                                    setMenu((menu) => !menu);
                                                    setCmtId(comment.Id);
                                                }}
                                                className={cs('iconSend')}
                                            >
                                                <FontAwesomeIcon className={cs('ellipsisIcon')} icon={faEllipsis} />
                                            </i>
                                        </Tippy>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <h4 className={cs('noMore')}>Đã hết kết quả</h4>
                </>
            ) : (
                <h2 style={{ textAlign: 'center', color: '#fe2c55', marginTop: '20px' }}>Hiện chưa có bình luận nào</h2>
            )}
        </div>
    );
}

export default Comment;
