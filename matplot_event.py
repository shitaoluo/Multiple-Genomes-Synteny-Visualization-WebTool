from test_class import Ideogram, Validation, ChrChose, create_picture
from flask import render_template, Flask, request, redirect

test_data = {
    'path': "data_storage/hmxrln_block_gff.txt",
    'manual_data': "",
    'Genome1': "Bm",
    'Genome2': 'Pr',
    'Genome3': 'Sl',
    'Genome4': 'Tn',
    'Genome5': 'Hmel',
}
chosed_chr = [1, 14, 31, 1, 21]


app = Flask(__name__)
@app.route("/")
def fig():
    task = ChrChose(test_data)
    upload_array = task.confirm_relationship()
    picture_flow = create_picture(task, chosed_chr)
    return render_template("visualization_site.html", fig=picture_flow, data=upload_array)


@app.route("/operation", methods=["POST", "GET"])
def operate():
    print(request.form)
    return redirect("demo2.html")


if __name__ == "__main__":
    app.run(debug=True)


