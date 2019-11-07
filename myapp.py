# coding:utf-8

from gevent import monkey

monkey.patch_all()
from flask import Flask, make_response, request, render_template
from geventwebsocket import WebSocketServer, WebSocketApplication, Resource
from werkzeug.debug import DebuggedApplication

from matplotlib.backends.backend_webagg_core import (FigureManagerWebAgg, new_figure_manager_given_figure)
from matplotlib.figure import Figure

import numpy as np
import io
import json
from purl import URL
from function import create_figure

app = Flask(__name__)

figure = create_figure()
Manager = new_figure_manager_given_figure(id(figure), figure)


class WebSocket_App(WebSocketApplication):
    supports_binary = True

    def on_open(self):
        # Register the websocket with the FigureManager.
        print("open")
        manager = Manager
        manager.add_web_socket(self)
        if hasattr(self, 'set_nodelay'):
            self.set_nodelay(True)

    def on_close(self):
        # When the socket is closed, deregister the websocket with
        # the FigureManager.
        print("close")
        manager = Manager
        manager.remove_web_socket(self)

    def on_message(self, message):
        # The 'supports_binary' message is relevant to the
        # websocket itself.  The other messages get passed along
        # to matplotlib as-is.

        # Every message has a "type" and a "figure_id".
        manager = Manager
        print(manager.web_sockets)
        if type(message) != str:
            print(type(message))
        message = json.loads(message)
        if message['type'] == 'supports_binary':
            self.supports_binary = message['value']
        else:
            manager = Manager
            s = manager.handle_json(message)
            # print s

    def send_json(self, content):
        print("send_json")
        self.ws.send(json.dumps(content))
        # self.write_message(json.dumps(content))

    def send_binary(self, blob):
        print("send_binary")
        if self.supports_binary:
            self.ws.send(blob, binary=True)
            # self.write_message(blob, binary=True)
        else:
            data_uri = "data:images/png;base64,{0}".format(blob.encode('base64').replace('\n', ''))
            self.ws.send(data_uri)
            # self.write_message(data_uri)


@app.route("/")
def main_page():
    manager = Manager
    ws_uri = "ws://{req}:7777/".format(req=URL(request.url).host())
    return render_template("demo2.html", ws_uri=ws_uri, fig_id=manager.num)

@app.route("/mpl.js")
def mplJs():
    js_content = FigureManagerWebAgg.get_javascript()
    resp = make_response(js_content, 200)
    resp.headers['Content-Type'] = 'application/javascript'
    return resp

@app.route('/download.<fmt>')
def download(fmt):
    """
    Handles downloading of the figure in various file formats.
    """
    manager = Manager

    mimetypes = {
        'ps': 'application/postscript',
        'eps': 'application/postscript',
        'pdf': 'application/pdf',
        'svg': 'images/svg+xml',
        'png': 'images/png',
        'jpeg': 'images/jpeg',
        'tif': 'images/tiff',
        'emf': 'application/emf'
    }

    buff = io.BytesIO()
    manager.canvas.print_figure(buff, format=fmt)

    resp = make_response(buff.getvalue(), 200)
    resp.headers['Content-Type'] = mimetypes.get(fmt, 'binary')
    return resp


if __name__ == '__main__':
    server = WebSocketServer(
        ('0.0.0.0', 7777),
        Resource([
            ('^/ws', WebSocket_App),
            ('^/.*', DebuggedApplication(app))
        ]), debug=False)
    print("started at 0.0.0.0:7777")
    server.serve_forever()