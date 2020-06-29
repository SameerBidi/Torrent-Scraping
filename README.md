# Torrent Scraper

A simple torrent scraper using Python

Currently scrapes sites: 1337x, ThePirateBay, Rarbg, Ettvdl

## API

Get a list of sites:
```bash
/getSites
```

Search a site for torrents:
```bash
/getTorrents

Parameters:
{"search_key" : search_key, "site" : site}
```

Get magnet link and file list:
```bash
/getTorrentData

Parameters:
{"link" : link, "site" : site}
```

## API Examples
### Try these in your browser

Geting list of sites:
```bash
http://samcloud.tplinkdns.com:50000/getSites

Returns JSON:
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
```yaml
Returns JSON:
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
```bash
http://samcloud.tplinkdns.com:50000/getTorrentData?link=http://1337x.to/torrent/1835137/Call-of-Duty-2-1-3-Repack-Mr-DJ/&site=1337x

Returns JSON:
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

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install necessary libraries:

flask, flask-cors, waitress, requests, bs4, lxml

```bash
pip install {package name}
```


## License
[MIT](https://choosealicense.com/licenses/mit/)
