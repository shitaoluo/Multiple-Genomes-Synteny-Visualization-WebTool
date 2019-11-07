import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from io import BytesIO
import base64

class Ideogram:
    def __init__(self, block_info, **kwargs):
        self.data = block_info
        # print("data rows: %d" % len(self.data))
        self.start = sorted(list(self.data.start))
        # print("start num: %d" % len(self.start))
        self.end = sorted(list(self.data.end))
        self.block = list(self.data.iloc[:, 0])
        self.chr = list(self.data.iloc[:, 1])
        if kwargs.get("chromosome_info"):
            chromosome_info = kwargs.get("chromosome_info")
            self.total_len = chromosome_info[1]
            self.chromosome_name = chromosome_info[0]

    def draw_ideogramz_for_block(self, position):
        bars = []
        current_height = 0
        limitted_width = 1
        for i in range(0, len(self.data)):
            if i != 0 and current_height <= self.start[i]:
                plan_height = self.start[i] - current_height
                plt.bar(x=position, height=plan_height, bottom=current_height, color='skyblue', width=limitted_width)
                current_height = self.start[i]
            if i == 0 and self.start[i] != 0:
                plan_height = self.start[i]
                plt.bar(x=position, height=plan_height, bottom=current_height, color='lightgreen', width=limitted_width)
                current_height += self.start[i]
            plan_height = self.end[i] - self.start[i]
            plt.bar(x=position, height=plan_height, bottom=current_height, color='r', width=limitted_width,
                    picker=1)
            current_height += plan_height
            if i == (len(self.data) - 1) and current_height < self.total_len:
                plan_height = self.total_len - current_height
                plt.bar(x=position, height=plan_height, bottom=current_height, color='r', width=limitted_width)

    def draw_ideogramz_for_gene(self, position):
        limitted_width = 1
        for i in range(0, len(self.data)):
            # print(self.start[i])
            plan_height = self.end[i] - self.start[i]
            plt.bar(x=position, height=plan_height, bottom=self.start[i], color='slategray', width=limitted_width)

    @staticmethod
    def create_links(chrA, chrB, chrB_positon):
        chrA_len = len(chrA.data)
        chrB_len = len(chrB.data)
        left_pos = chrB_positon - 10 + 0.6
        right_pos = chrB_positon - 1 + 0.4
        if chrA_len != chrB_len:
            return "Error! Orthogroup gene  unequal"
        index = chrA.data.index
        for i in range(0, chrA_len):
            x = [left_pos, right_pos]
            y1 = [chrA.data.loc[index[i], "start"], chrB.data.loc[index[i], "start"]]
            y2 = [chrA.data.loc[index[i], "end"], chrB.data.loc[index[i], "end"]]
            plt.plot(x, y1, color='white')
            plt.plot(x, y2, color='white')
            plt.fill_between(x, y1, y2, color='red')

    @staticmethod
    def auto_to_tail(smaller_df):
        chr_name = smaller_df.iloc[:1].drop_duplicates()
        if len(chr_name) != 1:
            print("please make sure chr unique")
            return
        else:
            chr_name = "Chromosome: " + str(chr_name)
            total_len = max(smaller_df.iloc[:, 3])
            return [chr_name, total_len]



class Validation:
    """ 验证Web收到的数据 """

    def __init__(self):
        self.file_path = ""
        self.specie_names = ""
        self.database = ""
        self.relation_table = ""

    def fill(self, dict_out):
        outside_dict = dict_out.copy()
        if outside_dict.get('path'):
            print("in A branch")
            self.file_path = outside_dict.get('path')
            outside_dict.pop('path')
            outside_dict.pop("manual_data")
            self.specie_names = outside_dict
            self.database = pd.read_csv(self.file_path, sep="\t")
        else:
            self.database = outside_dict.get("manual_data")
            self.specie_names = outside_dict.pop("manual_data")
        return "data has received"

    # 计算出总的染色体对应排列
    def confirm_relationship(self):
        ncols = len(self.database.columns)
        database = self.database[self.database.iloc[:, 0] != 0]
        chrs = database.iloc[:, [i for i in range(2, ncols, 5)]]
        unique_chrs = chrs.drop_duplicates()
        return unique_chrs.values.tolist()



class ChrChose(Validation):
    def __init__(self, database):
        Validation.__init__(self)
        Validation.fill(self, database)
        self.customized_data = ""
        self.species = list(self.specie_names.values())
        self.paragram = []
        self.block_data = []
        self.genes = []

    def load_para(self, para):
        self.paragram = para
        self.block_data = self.block_convert()
        self.genes = self.gene_convert()

    def pick_data(self):
        """按照参数提供的染色体选中相应的数据"""
        speices_num = len(self.database.columns) // 5
        picked_col = [(2 + j * 5) for j in range(0, speices_num)]
        result_df = self.database
        for i in range(0, speices_num):
            result_df = result_df[result_df.iloc[:, picked_col[i]] == self.paragram[i]]
            if result_df.empty:
                return "Error!!! No value passed filter"
            else:
                return result_df

    def split_into_multi(self):
        """将原始的数据按照物种分别拆开"""
        parted_table = {}
        species_num = len(self.specie_names)
        self.customized_data = self.pick_data()
        for i in range(0, species_num):
            single_table = self.customized_data.iloc[:, ([0] + [k for k in range(5 * i + 1, 5 * i + 5)])]  # 缺省一个sign列
            single_table.columns = ['block', 'GeneID', 'chr', 'start', 'end']
            parted_table[self.species[i]] = single_table
        return parted_table

    def block_convert(self):
        parted_table = self.split_into_multi()
        for name, df in parted_table.items():
            df.iloc[:, 4] = df.iloc[:, 3] + df.iloc[:, 4]
            df = df.drop(index=df[df.iloc[:, 0] == 0].index)
            col_label = df.columns
            for index, row in df.iterrows():
                specific_row = df[(df.iloc[:, 0] == row[0]) & (df.iloc[:, 2] == row[2])]
                df.loc[index, col_label[3]] = min(specific_row.iloc[:, 3])
                df.loc[index, col_label[4]] = max(specific_row.iloc[:, 4])
            saved_col = [col_label[i] for i in [0, 2, 3, 4]]  # 舍弃GeneID列
            df = df.loc[:, saved_col].drop_duplicates()
            df = df.to_dict(orient='records')
            parted_table[name] = df
        return parted_table

    def gene_convert(self):
        parted_table = self.split_into_multi()
        for name, df in parted_table.items():
            df.iloc[:, 4] = df.iloc[:, 3] + df.iloc[:, 4]
            df = df.drop(index=df[df.iloc[:, 0] == 0].index)
            # df = df.to_json(orient='records')
            parted_table[name] = df
        return parted_table

    def auto_turn_into_tail(self, novel_name, novel_df):
        virtual_chrs = novel_df.chr.drop_duplicates()
        if len(virtual_chrs) != 1:
            return "please make sure Chr column has only one value"
        else:
            return [novel_name + str(virtual_chrs.values[0]), max(novel_df.end)]

    @staticmethod
    def set_draw_parameters():
        figure = plt.figure(dpi=100)
        ax = figure.add_subplot(1, 1, 1)
        ax.spines['right'].set_color('none')  # 隐藏右边框线
        ax.spines['top'].set_color('none')  # 隐藏上部框线
        ax.spines['left'].set_color('none')  # 隐藏左边框线
        ax.spines['bottom'].set_color('none')  # 隐藏下部框线
        plt.yticks([])
        plt.xticks([])
        #plt.rcParams['savefig.dpi'] = 800
        plt.rcParams['figure.dpi'] = 1080
        plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1)  # 设置图片边缘距离

    def load_couple_bullet(self, **kwargs):
        index = 0
        bullets = []
        if kwargs.get("block"):
            self.set_draw_parameters()  # 设置绘图参数,无边框无座标轴
            for species, data in self.block_data.items():
                if True:  # 此处默认为无外界输入染色体信息，后面再补充相应代码
                    chr_info = self.auto_turn_into_tail(species, data)
                    virtual_chormosome = Ideogram(data, chromosome_info=chr_info)
                # else:
                bullets.append(virtual_chormosome)
            return bullets
        elif kwargs.get("gene"):
            for species, data in self.genes.items():
                if True:  # 此处默认为无外界输入染色体信息，后面再补充相应代码
                    virtual_chormosome = Ideogram(data)
                bullets.append(virtual_chormosome)
            return bullets

def create_picture(session, choosedchrs):
    # task = ChrChose(chosed_chr, test_data)
    session.load_para(choosedchrs)
    ideos = session.load_couple_bullet(block=True)
    genes = session.load_couple_bullet(gene=True)
    i = 1
    for bar in ideos:
        pos = i * 10
        bar.draw_ideogramz_for_block(pos)
        i = i + 1
    i = 0
    for bar in genes:
        pos = (i + 1) * 10
        bar.draw_ideogramz_for_gene(pos)
        if i != 0:
            Ideogram.create_links(genes[i - 1], genes[i], pos)
        i += 1
        #plt.savefig('./data_storage/visual_picture.png',dpi=100,format='png')
    img = BytesIO()  # 开启内存接口
    plt.savefig(img, format='png')  # 将图片存入内存
    img.seek(0)  # 调出指针为开头
    img_base64 = base64.b64encode(img.getvalue()).decode('utf8')
    src = 'data:images/png;base64,' + str(img_base64)
    return src  # 返回数据流