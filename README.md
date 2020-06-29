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
{"sites": ["1337x", "ThePirateBay", "Rarbg", "Ettvdl"]}
```

Searching 1337x for Extraction torrents:
```bash
http://samcloud.tplinkdns.com:50000/getTorrents?search_key=extraction&site=1337x

Returns JSON:
{"torrents": [{"name": "Extraction (2020)...", "seeds": 9748, "leeches": 4598, "size": "1.1 GB", "uploader": "YTSAGx", "link": "http://1337x.to/torrent/442...", ...]}
```

Geting magnet link and file list from 1337x site:
```bash
http://samcloud.tplinkdns.com:50000/getTorrentData?link=http://1337x.to/torrent/4423605/Extraction-2020-720p-WEBRip-YTS-YIFY/&site=1337x

Returns JSON:
{"magnet": "magnet:?xt=urn:btih:F0AAAF54DD01F9B1D277C6D78F872F297D75E52D&dn...", "files": ["Extraction.2020... (1.1 GB)", "Extraction.2020.720p.WEBRip.x264.AAC-[YTS.MX].srt (57.2 KB)", "www.YTS.MX.jpg (52.0 KB)"]}
```

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install necessary libraries:

flask, flask-cors, waitress, requests, bs4, lxml

```bash
pip install {package name}
```


## License
[MIT](https://choosealicense.com/licenses/mit/)
