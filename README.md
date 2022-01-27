# Torrent Scraper

A simple torrent scraper using Python

Currently scrapes sites: 1337x, ThePirateBay

## Working Demo

http://samcloud.tplinkdns.com/torrent

## API

Get a list of sites:
```yaml
/getSites

No Parameters
```

Search a site for torrents:
```yaml
/getTorrents

Parameters:
{"search_key" : search_key, "site_id" : site_id}
```

Get magnet link and file list:
```yaml
/getTorrentData

Parameters:
{"link" : link, "site_id" : site_id}
```

## API Examples and Demos
### Try these in your browser

Geting list of sites:

http://samcloud.tplinkdns.com:50000/getSites

Returns JSON:
```yaml
[
  {
    "id": 1,
    "name": "1337x"
  },
  {
    "id": 2,
    "name": "ThePirateBay"
  }
]
```

Searching 1337x for Call of duty torrents:

http://samcloud.tplinkdns.com:50000/getTorrents?search_key=god%20of%20war&site_id=1

Returns JSON:
```yaml
[
  {
    "name": "God of War (v1.0.1/Day 1 Patch/Build 8008283 + Bonus OST, MULTi18) [FitGirl Repack, Selective Download - from 26 GB]",
    "seeders": 5804,
    "leechers": 17455,
    "size": "28.7 GB",
    "date": 1642185000,
    "uploader": "FitGirl",
    "link": "https://1337xx.to/torrent/5114700/God-of-War-v1-0-1-Day-1-Patch-Build-8008283-Bonus-OST-MULTi18-FitGirl-Repack-Selective-Download-from-26-GB/"
  },
  {
    "name": "God of War (2022) MULTi19-ElAmigos",
    "seeders": 1756,
    "leechers": 1740,
    "size": "30.5 GB",
    "date": 1642185000,
    "uploader": "BedBug",
    "link": "https://1337xx.to/torrent/5114679/God-of-War-2022-MULTi19-ElAmigos/"
  }
  ...
]
```

Geting magnet link and file list from 1337x site:

http://samcloud.tplinkdns.com:50000/getTorrentData?link=https://1337xx.to/torrent/5114679/God-of-War-2022-MULTi19-ElAmigos/&site_id=1

Returns JSON:
```yaml
{
  "magnet": "magnet:?xt=urn:btih:4F515CD16844D3...announce",
  "files": [
    "G1odoW6ar-elamigos.part01.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part02.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part03.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part04.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part05.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part06.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part07.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part08.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part09.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part10.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part11.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part12.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part13.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part14.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part15.rar (2.0 GB)",
    "G1odoW6ar-elamigos.part16.rar (1.2 GB)"
  ]
}
```

## Setting up and running the server

You need Python version 3.x to run this


Use the package manager [pip](https://pip.pypa.io/en/stable/) to install necessary libraries:

flask, flask-cors, waitress, requests, bs4, lxml, profanity_filter

```yaml
pip install {package name}
```


Place [blocklist.txt](https://github.com/SameerBidi/Torrent-Scraping/blob/master/API/blocklist.txt) in any location and update the path in [TorrentServer.py](https://github.com/SameerBidi/Torrent-Scraping/blob/master/API/TorrentScraper.py) file
```python
with open("path to blocklist.txt", "r") as file:
```
This list is used to block adult torrents


Run the [torrent_server.py](https://github.com/SameerBidi/Torrent-Scraping/blob/master/API/torrent_server.py) file
```bash
python torrent_server.py
```
By default it runs on 0.0.0.0 (accept requests from everywhere) and port: 50000


Then access it using 
```yaml
http://server-ip:port/api
```

## License
[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
