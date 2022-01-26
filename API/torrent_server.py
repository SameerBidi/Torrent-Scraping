import flask
import json
from flask import request
from flask import Response
from flask_cors import CORS
from waitress import serve
import requests
from datetime import datetime
import TorrentScraper as scraper

app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

sitesAvailable = [
  {
    "id": 1,
    "name": "1337x"
  },
  {
    "id": 2,
    "name": "ThePirateBay"
  }
]

@app.route('/getTorrentsList', methods=['GET'])
def getTorrentsList():
  search_key = request.args.get('search_key')
  return Response(json.dumps({"torrents" : scraper.search1337x(search_key)}), mimetype='application/json')

@app.route('/getMagnet', methods=['GET'])
def getMagnet():
  url = request.args.get('link')
  return Response(json.dumps(scraper.get1337xTorrentData(url)), mimetype='application/json')  

@app.route('/getSites', methods=["GET"])
def getSites():
  return Response(json.dumps(sitesAvailable), mimetype='application/json')

@app.route('/getTorrents', methods=["GET"])
def getTorrents():
  search_key = request.args.get("search_key")
  if(search_key is None or search_key == ""):
    return Response(json.dumps([]))

  safe_search = request.args.get("safe_search")

  do_safe_search = safe_search == "true"

  try:
    site_id = int(request.args.get("site_id"))
    if(site_id == 1):
      return Response(json.dumps(scraper.search1337x(search_key, do_safe_search)), mimetype="application/json")
    elif(site_id == 2):
      return Response(json.dumps(scraper.searchThePirateBay(search_key, do_safe_search)), mimetype="application/json")
    elif(site_id == 3):
      return Response(json.dumps(scraper.searchRarbg(search_key, do_safe_search)), mimetype="application/json")
    elif(site_id == 4):
      return Response(json.dumps(scraper.searchEttv(search_key, do_safe_search)), mimetype="application/json")
    else:
      return Response(json.dumps(scraper.search1337x(search_key, do_safe_search)), mimetype="application/json")
  except Exception as e:
    print(e)
    return Response(json.dumps([]))

@app.route('/getTorrentData', methods=["GET"])
def getTorrentData():
  link = request.args.get("link")
  if(link is None or link == ""):
    return Response(json.dumps([]))
  
  try:
    site_id = int(request.args.get("site_id"))
    if(site_id == 1):
      return Response(json.dumps(scraper.get1337xTorrentData(link)), mimetype="application/json")
    elif(site_id == 2):
      return Response(json.dumps(scraper.getThePirateBayTorrentData(link)), mimetype="application/json")
    elif(site_id == 3):
      return Response(json.dumps(scraper.getRarbgTorrentData(link)), mimetype="application/json")
    elif(site_id == 4):
      return Response(json.dumps(scraper.getEttvTorrentData(link)), mimetype="application/json")
    else:
      return Response(json.dumps(scraper.get1337xTorrentData(link)), mimetype="application/json")
  except:
    return Response(json.dumps([]))

serve(app, host="0.0.0.0", port=50000)
