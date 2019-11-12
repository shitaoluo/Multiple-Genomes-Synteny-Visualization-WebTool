# coding:utf-8

from gevent import monkey

monkey.patch_all()
from flask import Flask, make_response, request, render_template
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource
from werkzeug.debug import DebuggedApplication

from matplotlib.backends.backend_webagg_core import (
    FigureManagerWebAgg, new_figure_manager_given_figure)
from matplotlib.figure import Figure
import numpy as np


def create_figure():
    """
    Creates a simple example figure.
    """
    fig = Figure()
    a = fig.add_subplot(111)
    t = np.arange(0.0, 3.0, 0.01)
    s = np.sin(2 * np.pi * t)
    a.plot(t, s)
    return fig

# app = Flask(__name__)
#
#
# @app.route('/')
# def MainPage():
#     fig = "2"
#     return render_template("demo3.html", data=fig)
#
#
# app.run()


'savaed documents'
chrA = {
    'block_id': [1, 2, 3],
    'gene_id': ['A', 'B', 'C'],
    'chr': [1, 1, 1],
    'start': [5307347, 5998702, 6341653],
    'end': [5965045, 6222450, 7029665],
    'sign': ['1', '-1', '1']
}
chrA_info = ["visual_chr", 7029665]
chrB = {
    'block_id': [1, 2, 3],
    'gene_id': ['a', 'b', 'c'],
    'chr': [14, 14, 14],
    'start': [5711455, 13847625, 12961130],
    'end': [6341164, 14087924, 13679307],
    'sign': ['1', '1', '-1'],
}
chrB_info = ["visual_chr", 14087924]
chrA = pd.DataFrame(chrA)
IdeoA = Ideogram(chrA, chrA_info)
chrB = pd.DataFrame(chrB)
IdeoB = Ideogram(chrB, chrB_info)
print(IdeoB.total_len)
fig = plt.figure()
IdeoA.draw_ideogram(10)
IdeoB.draw_ideogram(20)

def onpick(event):
    thisbar = event.artist
    xdata = thisbar.get_x()
    ydata = thisbar.get_y()
    print(xdata, ydata)


fig.canvas.mpl_connect("pick_event", onpick)
plt.show()




