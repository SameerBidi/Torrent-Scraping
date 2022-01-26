import requests
from bs4 import BeautifulSoup
import json
from datetime import date, datetime
from profanity_filter import ProfanityFilter
import re

pf = ProfanityFilter()

headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 Edg/83.0.478.45",
  "Accept-Encoding": "*"
}

torrent_proxies_list = {
  "1337x": ["https://1337xx.to"],
  "ThePirateBay": ["https://www1.thepiratebay3.to"],
  "Rarbg": []
}

max_pages = 1

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
  with open("blocklist.txt", "r") as file:
    blocklist = file.read().split("\n")
    matchList = [s for s in torrents for xs in blocklist if len(re.findall(rf'\b{xs}\b', s["name"].lower())) > 0]
    return [i for i in torrents if i not in matchList]

def parseDate(date_str, curr_format):
  return datetime.strptime(date_str, curr_format).timestamp()

def get(url):
  return requests.get(url, headers=headers)

def search1337x(search_key, do_safe_search):
  torrents = []
  pg_no = 1
  for proxy in torrent_proxies_list["1337x"]:
    try:
      while(pg_no <= max_pages):
        source = get(f"{proxy}/search/{search_key}/{pg_no}").text
        print(f"{proxy}/search/{search_key}/{pg_no}")
        soup = BeautifulSoup(source, "lxml")
        for tr in soup.select("tbody > tr"):
          a = tr.select("td.coll-1 > a")[1]
          name = a.text

          if do_safe_search and pf.is_profane(name):
            continue

          torrents.append \
          ({
            "name": name,
            "seeders": toInt(tr.select("td.coll-2")[0].text),
            "leechers": toInt(tr.select("td.coll-3")[0].text),
            "size": str(tr.select("td.coll-4")[0].text).split('B', 1)[0] + "B",
            "date": int(parseDate(tr.select("td.coll-date")[0].text.replace("nd", "").replace("th", "").replace("rd", "").replace("st", ""), "%b. %d '%y")),
            "uploader" : tr.select("td.coll-5 > a")[0].text,
            "link": f"{proxy}{a['href']}" \
          })

        pg_no = pg_no + 1
      break
    except Exception as e:
      print(e)
      continue

  return filterTorrents(torrents) if do_safe_search else torrents

def get1337xTorrentData(link):
  data = {}
  try:
    source = get(link).text
    soup = BeautifulSoup(source, "lxml")
    data["magnet"] = soup.select('ul.dropdown-menu > li')[-1].find('a')['href']
    files = []
    for li in soup.select('div.file-content > ul > li'):
      files.append(li.text.replace("\n", ""))

    data["files"] = files
  except Exception as e:
    print(e)
    pass
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
      "seeders" : toInt(t["seeders"]),
      "leechers" : toInt(t["leechers"]),
      "size" : convertBytes(int(t["size"])),
      "uploader" : t["username"],
      "link" : f"http://apibay.org/t.php?id={t['id']}" \
    })
  return filterTorrents(torrents)

def searchThePirateBay(search_key, do_safe_search):
  torrents = []
  pg_no = 1
  for proxy in torrent_proxies_list["ThePirateBay"]:
    try:
      while(pg_no <= max_pages):
        source = get(f"{proxy}/s/page/{pg_no}/?q={search_key}&category=0").text
        print(f"{proxy}/search/{search_key}/{pg_no}")
        soup = BeautifulSoup(source, "lxml")
        for tr in soup.select("table#searchResult > tbody > tr:not(:last-child)"):
          a = tr.select("td:nth-of-type(2) > a")[0]
          name = a.text

          if do_safe_search and pf.is_profane(name):
            continue

          torrents.append \
          ({
            "name": name,
            "seeders": toInt(tr.select("td:nth-of-type(6)")[0].text),
            "leechers": toInt(tr.select("td:nth-of-type(7)")[0].text),
            "size": str(tr.select("td:nth-of-type(5)")[0].text).replace("i", ""),
            "date": int(parseDate(tr.select("td:nth-of-type(3)")[0].text, "%Y-%m-%d %H:%M")),
            "uploader" : tr.select("td:nth-of-type(8) > a")[0].text,
            "link": f"{proxy}{a['href']}" \
          })
        pg_no = pg_no + 1
      break
    except Exception as e:
      print(e)
      continue
  
  return filterTorrents(torrents) if do_safe_search else torrents

def getThePirateBayTorrentData(link):
  data = {}
  try:
    source = get(link).text
    soup = BeautifulSoup(source, "lxml")
    print(soup.select('div#details > div:last-child > div.download > a'))
    data["magnet"] = soup.select('div#details > div:last-child > div.download > a')[0]['href']
    files = []
    # for li in soup.select('div.file-content > ul > li'):
    #   files.append(li.text)

    data["files"] = files
  except Exception as e:
    print(e)
    pass
  return data

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
      "seeders" : toInt(tds[5].font.text),
      "leechers" : toInt(tds[6].text),
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
  source = get(f"https://www.ettvcentral.com/torrents-search.php?search={search_key}").text
  soup = BeautifulSoup(source, "lxml")
  for tr in soup.select("table > tr"):
    tds = tr.select("td")
    torrents.append \
    ({
      "name" : tds[1].a.text,
      "seeders" : toInt(tds[5].font.b.text),
      "leechers" : toInt(tds[6].font.b.text),
      "size" : tds[3].text,
      "uploader" : tds[7].a.text,
      "link" : f"https://www.ettvcentral.com{tds[1].a['href']}" \
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