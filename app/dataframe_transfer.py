from app.test_class import ChrChose
from flask import render_template, Flask, request, redirect, url_for
import json
import numpy as np
from app.small_function import record_logs

app = Flask(__name__,template_folder="../templates", static_folder="../static")
global_vars = {}


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NpEncoder, self).default(obj)


def intergrate_gene_block(block, gene):
    for key in block.keys():
        for obj in block[key]:
            gene_df = gene[key]
            obj["data"] = gene_df[gene_df.iloc[:, 0] == obj["block"]].to_dict(orient='records')
    return block


data = {
    'path': "data_storage/hmxrln_block_gff.txt",
    'manual_data': "",
    'Genome1': "Bm",
    'Genome2': 'Pr',
    'Genome3': 'Sl',
    'Genome4': 'Tn',
    'Genome5': 'Hmel',
}
callback_selected = {"genome1": 1, "genome2": 14, "genome3": 31, "genome4": 1, "genome5": 21}
task = None

@app.route("/")
def init_page():
    return render_template("index.html")


@app.route("/form", methods=['POST', "get"], strict_slashes=False)
def form():
    return render_template("form.html")


@app.route("/submit", methods=['POST', "get"], strict_slashes=False)
def submit():
    if request.method == "POST":
        global task
        got_data = request.form.to_dict()
        got_file = request.files.get("data_file")
        got_data = record_logs(got_file, got_data)
        print(url_for("fig"))
        task = ChrChose(got_data)
        return redirect(url_for("fig"))


@app.route("/view")
def fig():
    upload_array = task.confirm_relationship()
    return render_template("vs_site.html", data=upload_array)


@app.route("/ajax_test", methods=['POST'], strict_slashes=False)
def ajax_text():
    parameters_from_browser = list(request.form.to_dict().values())  # 转dict的values为列表型式，字典型冗余信息,故不用
    parameters_from_browser = list(map(int, parameters_from_browser))
    task.load_para(parameters_from_browser)
    print(intergrate_gene_block(task.block_data, task.genes))
    return json.dumps(intergrate_gene_block(task.block_data, task.genes), cls=NpEncoder)


#if __name__ == "__main__":
#    app.run(debug=True)
