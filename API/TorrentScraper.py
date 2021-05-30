import requests
from bs4 import BeautifulSoup
import json

headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 Edg/83.0.478.45",
  "Accept-Encoding": "*",
  "Connection": "keep-alive"
}

proxies = {
  "http": "ip:port",
  "https": "ip:port"
}

def toInt(value):
  return int(value.replace(',', ''))

def convertBytes(num):
  step_unit = 1000.0
  for x in ['bytes', 'KB', 'MB', 'GB', 'TB']:
      if num < step_unit:
          return "%3.1f %s" % (num, x)
      num /= step_unit

def getTPBTrackers():
  tr = "&tr=" + requests.utils.quote("udp://tracker.coppersurfer.tk:6969/announce")
  tr += "&tr=" + requests.utils.quote("udp://9.rarbg.to:2920/announce")
  tr += "&tr=" + requests.utils.quote("udp://tracker.opentrackr.org:1337")
  tr += "&tr=" + requests.utils.quote("udp://tracker.internetwarriors.net:1337/announce")
  tr += "&tr=" + requests.utils.quote("udp://tracker.leechers-paradise.org:6969/announce")
  tr += "&tr=" + requests.utils.quote("udp://tracker.coppersurfer.tk:6969/announce")
  tr += "&tr=" + requests.utils.quote("udp://tracker.pirateparty.gr:6969/announce")
  tr += "&tr=" + requests.utils.quote("udp://tracker.cyberia.is:6969/announce")
  return tr

def filterTorrents(torrents):
  with open("/home/dietpi/PythonServers/blocklist.txt", "r") as file:
    blocklist = file.read().split("\n")
    matchList = [s for s in torrents for xs in blocklist if xs in s["name"].lower()]
    return [i for i in torrents if i not in matchList]

def get(url):
  return requests.get(url, headers=headers, proxies=proxies)

def search1337x(search_key):
  torrents = []
  source = get(f"https://1337x.to/search/{search_key}/1/").text
  soup = BeautifulSoup(source, "lxml")
  for tr in soup.select("tbody > tr"):
    a = tr.select("td.coll-1 > a")[1]
    torrents.append \
    ({
      "name" : a.text,
      "seeds" : toInt(tr.select("td.coll-2")[0].text),
      "leeches" : toInt(tr.select("td.coll-3")[0].text),
      "size" : str(tr.select("td.coll-4")[0].text).split('B', 1)[0] + "B",
      "uploader" : tr.select("td.coll-5 > a")[0].text,
      "link" : f"http://1337x.unblockit.ltd{a['href']}" \
    })
  return filterTorrents(torrents)

def get1337xTorrentData(link):
  data = {}
  source = get(link).text
  soup = BeautifulSoup(source, "lxml")
  data["magnet"] = soup.select('ul.dropdown-menu > li')[-1].find('a')['href']
  data["torrent_file"] = soup.select('ul.dropdown-menu > li')[0].find('a')['href']
  files = []
  for li in soup.select('div.file-content > ul > li'):
    files.append(li.text)

  data["files"] = files
  return data

def searchTPB(search_key):
  torrents = []
  resp_json = get(f"http://apibay.org/q.php?q={search_key}&cat=100,200,300,400,600").json()
  if(resp_json[0]["name"] == "No results returned"):
    return torrents

  for t in resp_json:
    torrents.append \
    ({
      "name" : t["name"],
      "seeds" : toInt(t["seeders"]),
      "leeches" : toInt(t["leechers"]),
      "size" : convertBytes(int(t["size"])),
      "uploader" : t["username"],
      "link" : f"http://apibay.org/t.php?id={t['id']}" \
    })
  return filterTorrents(torrents)

def getTPBTorrentData(link):
  data = {}
  id = dict(x.split('=') for x in requests.utils.urlparse(link).query.split('&'))["id"]
  resp_json = get(f"http://apibay.org/t.php?id={id}").json()
  if(resp_json["name"] == "Torrent does not exsist."):
    data["magnet"] = ""
    data["files"] = []
    return data
  magnet = "magnet:?xt=urn:btih:" + resp_json["info_hash"] + "&dn=" + requests.utils.quote(resp_json["name"]) + getTPBTrackers()
  data["magnet"] = magnet
  resp_json = get(f"http://apibay.org/f.php?id={id}").json()
  files = []
  try:
    for file in resp_json:
      files.append(f"{file['name'][0]} ({convertBytes(toInt(file['size'][0]))})")
    data["files"] = files
  except:
    data["files"] = []
  return data

def searchRarbg(search_key):
  torrents = []
  source = get \
  (
    f"http://rargb.to/search/?search={search_key}" \
    "&category[]=movies&category[]=tv&category[]=games&" \
    "category[]=music&category[]=anime&category[]=apps&" \
    "category[]=documentaries&category[]=other" \
  ).text
  soup = BeautifulSoup(source, "lxml")
  for tr in soup.select("tr.lista2"):
    tds = tr.select("td") 
    torrents.append \
    ({
      "name" : tds[1].a.text,
      "seeds" : toInt(tds[5].font.text),
      "leeches" : toInt(tds[6].text),
      "size" : tds[4].text,
      "uploader" : tds[7].text,
      "link" : f"http://rargb.to{tds[1].a['href']}" \
    })
  return filterTorrents(torrents)

def getRarbgTorrentData(link):
  data = {}
  source = get(link).text
  soup = BeautifulSoup(source, "lxml")
  trs = soup.select("table.lista > tbody > tr")
  data["magnet"] = trs[0].a["href"]
  files = []
  for li in trs[6].select("td.lista > div > ul > li"):
    files.append(li.text.strip())
  data["files"] = files
  return data

def searchEttv(search_key):
  torrents = []
  source = get(f"http://www.ettvcentral.com/torrents-search.php?search={search_key}").text
  soup = BeautifulSoup(source, "lxml")
  for tr in soup.select("table > tr"):
    tds = tr.select("td")
    torrents.append \
    ({
      "name" : tds[1].a.text,
      "seeds" : toInt(tds[5].font.b.text),
      "leeches" : toInt(tds[6].font.b.text),
      "size" : tds[3].text,
      "uploader" : tds[7].a.text,
      "link" : f"http://www.ettvdl.com{tds[1].a['href']}" \
    })
  return filterTorrents(torrents)

def getEttvTorrentData(link):
  data = {}
  source = get(link).text
  soup = BeautifulSoup(source, "lxml")
  data["magnet"] = soup.select("div#downloadbox > table > tr > td")[1].a["href"]
  files = []
  for tr in soup.select("div#k1 > table > tr")[1:]:
    tds = tr.select("td")
    files.append(f"{tds[0].text} ({tds[1].text})")
  data["files"] = files
  return data
