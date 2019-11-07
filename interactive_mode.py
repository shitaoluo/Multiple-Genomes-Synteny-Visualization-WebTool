import matplotlib.pyplot as plt
import pandas as pd
from test_class import Ideogram


class PickEvent:
    def __init__(self, database, chosed_chr, canvas):
        self.database = database
        self.current_chr = chosed_chr
        self.figure = canvas

    def block_to_gene(self, xdata, ydata):
        pos = int(xdata // 10)
        start_col = 5 * pos + 3
        chr_col = 5 * pos + 2
        selected_block = self.database[(self.database.iloc[:, start_col] == int(ydata)) &
                                       (self.database.iloc[:, chr_col] == self.current_chr[pos])].iloc[:, 0].values[0]
        selected_index = self.database[self.database.iloc[:, 0] == selected_block].index
        return self.database.loc[selected_index]

    def split_block(self, df):
        blocks_union = []
        species_num = len(self.current_chr)
        for i in range(0, species_num):
            single_table = df.iloc[:, ([0] + [k for k in range(5 * i + 1, 5 * i + 5)])]  # 缺省一个sign列
            single_table.columns = ['block', 'GeneID', 'chr', 'start', 'end']
            single_table.end = single_table.start + single_table.end
            blocks_union.append(single_table)
        return blocks_union

    def draw_blocks(self, small_df, position):
        bars = []
        limitted_width = 1
        start = sorted(list(small_df.start))
        end = sorted(list(small_df.end))
        current_height = min(small_df.start)
        print(small_df)
        for i in range(0, len(small_df)):
            # print(current_height)
            # print(start[i])
            if current_height < start[i]:
                plan_height = start[i] - current_height
                plt.bar(x=position, height=plan_height, bottom=current_height, color='r', width=limitted_width)
                current_height = start[i]
            else:
                plan_height = end[i] - start[i]
                plt.bar(x=position, height=plan_height, bottom=current_height, color='black', width=limitted_width)
                current_height += plan_height

    def collocator(self, block_union):
        position = [10 * (i+1) for i in range(0, len(block_union))]
        ax2 = self.figure.add_subplot(2, 1, 2)
        ax2.spines['right'].set_color('none')
        ax2.spines['top'].set_color('none')
        ax2.spines['left'].set_color('none')
        ax2.spines['bottom'].set_color('none')
        i = 0
        for df in block_union:
            self.draw_blocks(df, position[i])
            i += 1


    def onpick(self, event):
        thisbar = event.artist
        xdata = thisbar.get_x()
        ydata = thisbar.get_y()
        interest_data = self.block_to_gene(xdata, ydata)
        block_union = self.split_block(interest_data)
        self.collocator(block_union)


class GeneSeeker:
    def __init__(self, database):
        self.data = database
        self.position = [9.5, 19.5]
        self.interest_row = ""

    def search_gene(self, xdata, ydata, single_chr):
        narrow_size = self.position.index(xdata) * 5
        narrow_row = self.data[
            (self.data.iloc[:, (narrow_size + 2)] == single_chr) & (self.data.iloc[:, (narrow_size + 3)] == ydata)]
        confirmed_block_id = narrow_row.iloc[0, 0]
        self.interest_row = self.data[self.data.iloc[:, 0] == confirmed_block_id]

    def split_into_multi(self):
        if self.interest_row == "":
            return "not found any gene"
        cols = len(self.interest_row.columns)
        res = []
        for i in range(1, cols, 5):
            genes_in_block = self.interest_row.iloc[:, [0, (i + 1), (i + 2), (i + 3)]]
            res.append(genes_in_block)
        return res

    def draw_genes_in_block(self):
        ideograms = self.split_into_multi()
        i = 1
        for df in ideograms:
            chromosome_info = Ideogram.auto_to_tail(df)
            Ideo_example = Ideogram(df, chromosome_info)
            Ideo_example.draw_ideogram(i * 10)
            i += 1