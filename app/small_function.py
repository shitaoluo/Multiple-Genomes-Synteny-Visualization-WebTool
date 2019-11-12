import os
import datetime


def mkdir(path):
    # 去除首位空格
    path = path.strip()
    # 去除尾部 \ 符号
    path = path.rstrip("\\")
    # 判断路径是否存在
    isExists = os.path.exists(path)
    # 判断结果
    if not isExists:
        # 如果不存在则创建目录
        # 创建目录操作函数
        os.makedirs(path)
        return True
    else:
        return False

# 传入外部加入的文件，存储并返回包含其位置的字典
def record_logs(file, upload_dict):
    now_time = datetime.datetime.now().strftime('%Y-%M-%d %H-%M-%S')
    current_path = "data_storage" + "/" + now_time
    mkdir(current_path)  # 创建专属目录
    file_path = os.path.join(current_path, "file.txt")
    file.save(file_path)
    upload_dict["path"] = file_path
    return upload_dict
