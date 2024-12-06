import requests
import pandas as pd
from bs4 import BeautifulSoup

# Bước 1: Đọc file CSV để lấy danh sách id, url và số tập
df = pd.read_csv('data_4.csv')  # Giả sử file có các cột id, url, so_tap
id = df['id']
urls = df['url']
so_tap = df['TotalEpisodes']

def get_video_url(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    # Trích xuất URL từ phần HTML mong muốn
    button = soup.find('ul', class_='buttons two-button')
    if button:
        link = button.find('a', class_='btn-see btn btn-danger btn-stream-link')
        if link:
            return link['href']
    return None
def get_episode_links(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    # Tìm phần div chứa các tập phim
    episodes_div = soup.find('div', class_='episodes')
    episode_links = []
    if episodes_div:
        # Lấy tất cả các link tập phim trong div
        links = episodes_div.find_all('a', href=True)
        for link in links:
            episode_links.append(link['href'])
    return episode_links
for url, tap in zip(urls, so_tap):
    # Lấy link chính từ URL ban đầu
    main_link = get_video_url(url)
    
    if main_link:
        # Bước 3: Gửi request đến link chính và lấy danh sách các tập phim
        full_url = f"https://phimmoichille.com{main_link}"  # Thay 'example.com' bằng domain chính xác
        episode_links = get_episode_links(full_url)
        
        # Lọc ra các tập phim theo số lượng
        for i, link in enumerate(episode_links[:tap]):
            print(f"Link tập {i+1}: {link}")