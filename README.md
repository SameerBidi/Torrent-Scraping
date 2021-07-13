# Torrent Scraper

A simple torrent scraper using Python

Currently scrapes sites: 1337x, ThePirateBay, Rarbg, Ettvdl

## API

Get a list of sites:
```yaml
/getSites
```

Search a site for torrents:
```yaml
/getTorrents

Parameters:
{"search_key" : search_key, "site" : site}
```

Get magnet link and file list:
```yaml
/getTorrentData

Parameters:
{"link" : link, "site" : site}
```

## API Examples and Demos
### Try these in your browser

Geting list of sites:

http://samcloud.tplinkdns.com:50000/getSites

Returns JSON:
```yaml
{
  "sites": [
    "1337x",
    "ThePirateBay",
    "Rarbg",
    "Ettvdl"
  ]
}
```

Searching 1337x for Call of duty torrents:

http://samcloud.tplinkdns.com:50000/getTorrents?search_key=call%20of%20duty&site=1337x

Returns JSON:
```yaml
{
  "torrents": [
    {
      "name": "Call of Duty…",
      "seeds": 949,
      "leeches": 61,
      "size": "3.5 GB",
      "uploader": "Sigaint",
      "link": "http://1337x.to/torrent/183…"
    }
  ]
…
}
```

Geting magnet link and file list from 1337x site:

http://samcloud.tplinkdns.com:50000/getTorrentData?link=http://1337x.to/torrent/1835137/Call-of-Duty-2-1-3-Repack-Mr-DJ/&site=1337x

Returns JSON:
```yaml
{
  "magnet": "magnet:?xt=urn:btih:97A1E506E2A0…",
  "files": [
    "Torrent downl..txt (0.0 KB)",
    "Torrent Downl….txt (0.0 KB)",
    "Torrent downl….txt (0.0 KB)",
    "autorun.inf (0.1 KB)",
    "Instructions.txt (1.3 KB)",
    "Icon.ico (14.0 KB)",
    "Setup.exe (21.2 MB)",
    "DJ.bin (3.4 GB)"
  ]
}
```

## Setting up and running the server

You need Python version 3.x to run this


Use the package manager [pip](https://pip.pypa.io/en/stable/) to install necessary libraries:

flask, flask-cors, waitress, requests, bs4, lxml

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
