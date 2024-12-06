from faker import Faker
import random
import pandas as pd

# Khởi tạo Faker
fake = Faker()

# Tạo danh sách các cảm xúc về phim
emotions = [
    "Phim rất hay, tôi thích!", "Phim không tệ, nhưng có vài chỗ chưa hợp lý.",
    "Chán quá, không đáng xem.", "Cảnh quay đẹp, nhưng nội dung yếu.",
    "Phim tuyệt vời, chắc chắn sẽ xem lại!", "Không thể tin được, tôi rất thất vọng.",
    "Cảm động quá, tôi rơi nước mắt.", "Phim rất căng thẳng, không thể rời mắt!",
    "Nội dung khá ổn, nhưng kết thúc không hài lòng.", "Rất vui vì đã xem phim này.",
    "Một bộ phim tuyệt vời, các diễn viên rất tài năng.", "Phim rất hài hước, tôi đã cười suốt.",
    "Kể chuyện quá tốt, thật ấn tượng.", "Không hiểu sao lại có người thích bộ phim này.",
    "Tôi không cảm thấy phim này đặc biệt gì.", "Bộ phim này rất kỳ lạ, khó hiểu nhưng hay.",
    "Tôi không nghĩ bộ phim này xứng đáng với sự nổi tiếng.", "Phim này gây sốc, tôi không thể dừng lại.",
    "Tuyệt vời! Mọi thứ đều hoàn hảo.", "Một bộ phim xuất sắc, rất đáng xem!"
]

# Tạo danh sách các bình luận ngẫu nhiên
comments = []
for _ in range(20):  # Tạo 20 bình luận
    user_id = random.randint(1, 50)  # userId ngẫu nhiên từ 1 đến 50
    movie_id = 1  # MovieId cố định là 1
    content = random.choice(emotions)  # Chọn ngẫu nhiên một cảm xúc từ danh sách emotions
    comments.append({"userId": user_id, "MovieId": movie_id, "content": content})

# Chuyển thành DataFrame để dễ dàng xử lý
df_comments = pd.DataFrame(comments)

# Hiển thị kết quả
print(df_comments)
