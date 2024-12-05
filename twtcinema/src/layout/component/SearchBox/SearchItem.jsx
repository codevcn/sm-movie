import classNames from 'classnames/bind';
import styles from './Search.module.scss';
import { Link } from 'react-router-dom';
import Image from '~/components/Images';

const cs = classNames.bind(styles);

function SearchItem({ data, onClick }) {
    return (
        //có gạch chéo ở đầu thì chuyển trực tiếp sang trang đó nếu ko có thì nó sẽ tự nối nó vs cái đường dẫn hiện tại
        <Link to={`/${data.Type.toLowerCase()}/${data.Id}`} className={cs('reslutItem')} onClick={onClick}>
            <Image src={data.PosterPath} className={cs('image')} alt="Bìa phim" />
            <h4 className={cs('name')}>{data.Name}</h4>
        </Link>
    );
}

export default SearchItem;
