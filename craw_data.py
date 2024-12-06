import threading
import time
import requests
import re
from collections import deque
import concurrent.futures
from bs4 import BeautifulSoup
import pandas as pd
def get_html(url):
    try:
        response = requests.get("https://phimmoichille.com"+url, timeout=100, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        return url,response.text
    except requests.exceptions.RequestException as e:
        print(f"Đã xảy ra lỗi với URL {url}: {e}")
        return url,None
def check_url(url):
    pattern = r"^https://phimmoichille.com/phim/[a-zA-Z0-9-]+(?<!/)$"
    if re.match(pattern, url):
        return True
    else:
        return False
def crawl_data(url, htmlbody):
    try:
        link = "https://phimmoichille.com"+url
        if not check_url(link):
            return None
        # Phân tích cú pháp HTML của trang
        soup = BeautifulSoup(htmlbody, 'html.parser')
        data = {'url': link}
        h1_tag = soup.find('h1')
        if h1_tag:
            title_tag = h1_tag.find('span', class_='title')
            if title_tag:
                movie_title = title_tag.get_text(strip=True)
                data['Tên phim'] = movie_title
        
        # Tìm tất cả các div có class "dinfo"
        dinfo_divs = soup.find_all('div', class_='dinfo')
        poster_div = soup.find('div', class_='poster')
        if poster_div:
            poster_url = poster_div.find('img', {'itemprop': 'image'})['src']
            data['poster_url'] = poster_url
        
        info_film_div = soup.find('div', class_='tabs-content', id='info-film')
        if info_film_div:
            content_paragraph = info_film_div.find('p')
            if content_paragraph:
                movie_content = content_paragraph.get_text(strip=True)
                data['Nội dung'] = movie_content

        # Duyệt qua tất cả các div có class "dinfo"
        for dinfo_div in dinfo_divs:
            # Tìm tất cả các phần tử <dl> trong mỗi div class="dinfo"
            items = dinfo_div.find_all('dl', class_='col')
            
            # Duyệt qua các mục <dt> và lấy giá trị tương ứng ở <dd>
            for item in items:
                dt = item.find_all('dt')
                dd = item.find_all('dd')
                
                for d, value in zip(dt, dd):
                    label = d.get_text(strip=True)
                    content = value.get_text(strip=True)

                    # Trích xuất các thông tin cần thiết
                    if label == "Thời lượng:":
                        data["Thời lượng"] = content
                    if label == "Số tập:":
                        data["Số tập"] = content
                    elif label == "Ngôn ngữ:":
                        data["Ngôn ngữ"] = content
                    elif label == "Năm sản xuất:":
                        data["Năm sản xuất"] = content
                    elif label == "Quốc gia:":
                        data["Quốc gia"] = content
                    elif label == "Thể loại:":
                        data["Thể loại"] = content
        
        return data
    
    except requests.exceptions.RequestException as e:
        return None
def extract_links(html):
    pattern = rf'/phim/[a-zA-Z0-9-]+(?<!/)'
    links = re.findall(pattern, html)
    return list(set(links))


# Hàm sẽ được thực thi trong luồng 1
def modify_shared_resource(lock, share_data):
    while True :
        if share_data['blob'] is not None:
            links = extract_links(share_data['blob'])
            with lock:
                share_data['blob'] = None
            # Thêm các liên kết chưa duyệt vào hàng đợi
            for link in links:
                if link not in share_data['visited']:
                    with lock:
                        share_data['queue'].append(link)



def runbfs(lock, share_data):
    myData = []
    while True:
        while share_data['queue']:
            with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
                # Danh sách lưu các futures
                futures = []
                while share_data['queue']:
                    with lock:
                        current_url = share_data['queue'].popleft()
                    if current_url in share_data['visited']: 
                        continue
                    futures.append(executor.submit(get_html, current_url))
                for future in concurrent.futures.as_completed(futures):
                    url, html_content = future.result()
                    with lock:
                        share_data['visited'].add(url) 
                    print(len(myData))
                    if len(myData) < 420:
                        data = crawl_data(url,html_content)
                        if data:
                            myData.append(data)
                    else :
                        if share_data['tick'] == False:
                            df = pd.DataFrame(myData)
                            df.to_csv('data.csv', index=False, encoding='utf-8')
                            print(f"Đã lưu dữ liệu vào file")
                            share_data['tick'] = True
                            exit(0)
                    with lock:
                        share_data['blob'] = html_content



# Tạo khóa
lock = threading.Lock()


share_data = {
    'visited' : set(),
    'queue' : deque(["/",
 "/the-loai/the-thao--am-nhac",
 "/the-loai/gia-dinh--hoc-duong",
 "/the-loai/co-trang--than-thoai",
 "/the-loai/tv-show",
 "/the-loai/khoa-hoc--vien-tuong",
 "/the-loai/bi-an--sieu-nhien",
 "/the-loai/kinh-di--ma",
 "/the-loai/phieu-luu--hanh-dong",
 "/the-loai/phim-hoat-hinh",
 "/the-loai/hinh-su--chien-tranh",
 "/the-loai/hai-huoc",
 "/the-loai/tai-lieu--kham-pha",
 "/the-loai/chinh-kich",
 "/the-loai/vo-thuat--kiem-hiep",
 "/the-loai/tam-ly--tinh-cam",
 "/phim-le",
 "/phim-thuyet-minh",
 "/phim-chieu-rap"]),
    'blob' : None,
    'tick' : False
}


thread1 = threading.Thread(target=modify_shared_resource, args=(lock, share_data))
thread1.daemon = True
thread2 = threading.Thread(target=runbfs, args=(lock,  share_data))
thread2.daemon = True
thread1.start()
thread2.start()

thread1.join()
thread2.join()

print("Cả hai luồng đã hoàn thành!")

