var requestPool = [];

$(document).ready(function () {
	showStatusText(false);
	initSites();
});

function initSites() {
	let siteBtnHolder = $("#siteBtnHolder");
	siteBtnHolder.empty();

	showProgress(true, "Getting list of sites")

	sendGet('getSites', {}, 
		function (response) {
			showProgress(false);

			if (!response || response.length == 0) {
				showToast("Could not retrieve site details, please try after some time");
				return;
			}

			response.forEach(function(site, index) {
				let siteBtn = $("#siteBtn").clone(true);

				siteBtn.prop("id", "siteBtn" + site.id);
				siteBtn.html(site.name);

				siteBtn.on("click", function() {
					searchTorrents(site.id);
				});

				siteBtn.removeClass("d-none");

				siteBtnHolder.append(siteBtn);
			});

			showStatusText(true);
		},
		function (error) {
			showProgress(false);
			showToast("Could not retrieve site details, please try after some time");
			console.log(error);
		}
	);
}

function searchTorrents(site_id) {
	let torrentCardsHolder = $("#torrentCardsHolder");
	torrentCardsHolder.empty();

	let search_key = $('#searchInput').val();
	search_key = search_key.trim();
	if (!search_key) {
		showToast("Search Query cannot be empty!")
		return;
	}

	let safe_search = $("#safeSearchCB").prop("checked");

	showProgress(true, "Searching '" + search_key + "' Torrents" + (safe_search ? " safely" : ""));

	showStatusText(false);

	sendGet('getTorrents', {"site_id": site_id, "search_key": search_key, "safe_search": safe_search}, 
		function (response) {
			showProgress(false);

			if (!response || response.length == 0) {
				showStatusText(true, "No Torrents Found");
				return;
			}

			response.forEach(function(torrent, index) {

				let torrentCard = $("#torrentCard").clone(true);

				let idAppend = "_" + site_id + "_" + index;
				
				torrentCard.prop("id", torrentCard.prop("id") + idAppend);

				let tDate = torrentCard.find("#tDate");
				tDate.prop("id", tDate.prop("id") + idAppend);
				tDate.html(getDate(torrent.date));

				let tName = torrentCard.find("#tName");
				tName.prop("id", tName.prop("id") + idAppend);
				tName.html(torrent.name);

				let tSize = torrentCard.find("#tSize");
				tSize.prop("id", tSize.prop("id") + idAppend);
				tSize.html(torrent.size);

				let tUploader = torrentCard.find("#tUploader");
				tUploader.prop("id", tUploader.prop("id") + idAppend);
				tUploader.html(torrent.uploader);

				let tSeeders = torrentCard.find("#tSeeders");
				tSeeders.prop("id", tSeeders.prop("id") + idAppend);
				tSeeders.html("<span class=\"text-light\">[S] </span>" + torrent.seeders);

				let tLeechers = torrentCard.find("#tLeechers");
				tLeechers.prop("id", tLeechers.prop("id") + idAppend);
				tLeechers.html("<span class=\"text-light\">[L] </span>" + torrent.leechers);

				let tDataBtn = torrentCard.find("#tDataBtn");
				let tDataCollapse = torrentCard.find("#tDataCollapse");

				tDataCollapse.prop("id", tDataCollapse.prop("id") + idAppend);
				tDataBtn.prop("id", tDataBtn.prop("id") + idAppend);
				tDataBtn.attr("data-bs-target", "#" + tDataCollapse.prop("id"));

				tDataCollapse.on("show.bs.collapse", function() {
					// tDataBtn.prop("disabled", true);
					// tDataBtn.addClass("d-none");
					tDataBtn.remove();

					let tDataStatusText = tDataCollapse.find("#tDataStatusText");
					tDataStatusText.prop("id", tDataStatusText.prop("id") + idAppend);
					tDataStatusText.addClass("d-none");

					let tProgressRow = tDataCollapse.find("#tProgressRow");
					tProgressRow.prop("id", tProgressRow.prop("id") + idAppend);
					tProgressRow.removeClass("d-none");

					let tDataRow = tDataCollapse.find("#tDataRow");
					tDataRow.prop("id", tDataRow.prop("id") + idAppend);
					tDataRow.addClass("d-none");

					let fileHolder = tDataRow.find("#fileHolder");
					fileHolder.prop("id", fileHolder.prop("id") + idAppend);

					let copyMagnetBtn = tDataRow.find("#copyMagnetBtn");
					copyMagnetBtn.prop("id", copyMagnetBtn.prop("id") + idAppend);

					let openMagnetBtn = tDataRow.find("#openMagnetBtn");
					openMagnetBtn.prop("id", openMagnetBtn.prop("id") + idAppend);

					sendGet('getTorrentData',  {"site_id": site_id, "link": torrent.link}, 
						function (response) {
							tProgressRow.addClass("d-none");
							console.log(response);
							if(!response || !response.magnet) {
								tDataStatusText.removeClass("d-none");
								return;
							}
							
							tDataRow.removeClass("d-none");

							response.files.forEach(function(file, index) {
								let fileNameText = tDataRow.find("#fileNameText").clone(true);
								fileNameText.prop("id", fileNameText.prop("id") + idAppend);

								let fileNameHr = tDataRow.find("#fileNameHr").clone(true);
								fileNameHr.prop("id", fileNameHr.prop("id") + idAppend);
								fileNameHr.removeClass("d-none");

								fileNameText.html(file);
								fileNameText.removeClass("d-none");

								fileHolder.append(fileNameText);
								fileHolder.append(fileNameHr);
							});

							copyMagnetBtn.on("click", function(e) {
								copyToClipboard(response.magnet);
								showToast("Magnet copied to clipboard!");
							});

							openMagnetBtn.on("click", function(e) {
								window.open(response.magnet);
							});
						},
						function (error) {
							tProgressRow.addClass("d-none");
							tDataRow.addClass("d-none");
							tDataStatusText.removeClass("d-none");
							console.log(error);
						}
					);
				});

				torrentCard.removeClass("d-none");

				torrentCardsHolder.append(torrentCard);
				
			});
		},
		function (error) {
			showProgress(false);
			showToast("Could not retrieve torrents list, please try after some time");
			console.log(error);
		}
	);
}

function showProgress(show, text)
{
	let tProgress = $("#tProgress");
	let tProgressText = $("#tProgressText");

	tProgressText.html(text);

	if(show) tProgress.removeClass("d-none");
	else tProgress.addClass("d-none");
}

function showStatusText(show, text, reset) {
	let statusText = $("#statusText");

	if(text) statusText.html(text);

	if(show) statusText.removeClass("d-none");
	else statusText.addClass("d-none");
}

function getDate(dateInMillis) {
	let thatDate = moment.unix(dateInMillis).utc().startOf('day');
	let todayDate = moment().utc().startOf('day');
	let diff = moment.duration(todayDate.diff(thatDate))
	let diffDays = parseInt(diff.asDays());
	let diffWeeks = parseInt(diff.asWeeks());

	if(diffDays >= 1 && diffDays <= 6) return diffDays + (diffDays == 1 ? " days ago" : " days ago")

	if(diffWeeks >= 1 && diffWeeks <= 4) return diffWeeks + (diffWeeks == 1 ? " week ago" : " weeks ago")

	return thatDate.format("DD MMM YYYY")
}

function showToast(text) {
	$("#customToastText").html(text);
	$("#customToast").toast("show");
}

function sortTableRow(tableID, colIndex, type) {
	var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
	table = document.getElementById(tableID);

	switching = true;
	dir = "asc";

	while (switching) {
		switching = false;
		rows = table.rows;

		for (i = 1; i < (rows.length - 1); i++) {
			shouldSwitch = false;

			x = rows[i].getElementsByTagName("TD")[colIndex];
			y = rows[i + 1].getElementsByTagName("TD")[colIndex];

			let ascCondition, descCondition;

			switch (type) {
				case "alphabetic":
					ascCondition = x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase();
					descCondition = x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase();
					break;

				case "numeric":
					ascCondition = Number(x.innerHTML.toLowerCase()) > Number(y.innerHTML.toLowerCase());
					descCondition = Number(x.innerHTML.toLowerCase()) < Number(y.innerHTML.toLowerCase());
					break;

				case "size":
					ascCondition = convertToBytes(x.innerHTML.toLowerCase()) > convertToBytes(y.innerHTML.toLowerCase());
					descCondition = convertToBytes(x.innerHTML.toLowerCase()) < convertToBytes(y.innerHTML.toLowerCase());
					break;
			}

			if (dir == "asc") {
				if (ascCondition) {
					shouldSwitch = true;
					break;
				}
			} else if (dir == "desc") {
				if (descCondition) {
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			switchcount++;

			let ths = $(table).find('th');

			ths.each
				(
					function (index) {
						$(this).html($(this).data('orightml'));
					}
				);

			let th = ths[colIndex];

			if (dir == "asc") {
				$(th).html($(th).data('orightml') + " ▲");
			}
			else if (dir == "desc") {
				$(th).html($(th).data('orightml') + " ▼");
			}

		} else {
			if (switchcount == 0 && dir == "asc") {
				dir = "desc";
				switching = true;
			}
		}
	}
}

function convertToBytes(sizeStr) {
	sizeSplit = sizeStr.split(" ");

	step = 1000.0;
	bytes = 1;

	sizeList = ['bytes', 'KB', 'MB', 'GB', 'TB'];

	for (let i = 0; i < sizeList.length; i++) {
		if (sizeList[i].toLowerCase() == sizeSplit[1].toLowerCase())
			break;

		bytes *= step;
	}

	return bytes * Number(sizeSplit[0]);
}

function populateTable(torrents, site) {
	let html = "";
	torrents.forEach
		(
			function (data, index) {
				html += "<tr onclick=\"selectTorrent('" + quoteEscaped(data.name) + "', '" + data.link + "', '" + site + "')\">" +
					"<td>" + (index + 1) + "</td>" +
					"<td class=\"blue-text\">" + data.name + "</td>" +
					"<td class=\"green-text\">" + data.seeds + "</td>" +
					"<td class=\"red-text\">" + data.leeches + "</td>" +
					"<td>" + data.size + "</td>" +
					"<td class=\"purple-text\">" + data.uploader + "</td>" +
					"</tr>";
			}
		);

	$('#' + site + ' > div > table > tbody').html(html);
	$('#' + site + ' > div > table').css('display', '');

	$('#' + site + ' > a').unbind('click');
	$('#' + site + ' > a').click
		(
			function () {
				toggle(site);
			}
		);

	$('#' + site + ' > a').css('display', 'inline-block');
}

function selectTorrent(name, link, site) {
	$('#loader, #torrentLoader').css('display', 'block');
	$('#torrentData').css('display', 'none');
	$('#torrentDataModal').modal('open');

	sendGet
		(
			'getTorrentData',
			{ 'link': link, 'site': site },
			function (response) {
				if (response == "Invalid Request") {
					$('#loader').css('display', 'none');
					$('#torrentDataModal').modal('close');
					M.toast({ html: 'Server received a invalid request, try again!', displayLength: 2000 });
					return;
				}

				populateModal(name, response);

				$('#loader').css('display', 'none');
				$('#torrentData').css('display', 'block');
			},
			function (error) {
				$('#loader').css('display', 'none');
				$('#torrentDataModal').modal('close');
				M.toast({ html: 'Error Occured, Check console for details', displayLength: 2000 });
				console.log(error);
			}
		);
}

function populateModal(name, data) {
	$('#tName').html(name);

	let html = "";
	data.files.forEach
		(
			function (file) {
				html += "<h6 class=\"blue-text\">" + file + "</h6>";
			}
		);

	$('#files').html(html);

	$('#oitBtn').unbind('click');
	$('#oitBtn').click
		(
			function () {
				window.open(data.magnet);
			}
		);

	$('#cplBtn').unbind('click');
	$('#cplBtn').click
		(
			function () {
				M.toast({ html: 'Magnet copied to clipboard!', displayLength: 2000 });
				copyToClipboard(data.magnet);
			}
		);
}

function sendGet(to, data, success, failed) {
	let request = $.ajax
		(
			{
				type: 'GET',
				contentType: 'application/json',
				url: 'http://192.168.0.105:50000/' + to,
				data: data,
				dataType: 'json',
				cache: false,
				timeout: 60000,
				success: success,
				error: failed
			}
		);
	requestPool.push(request);
}

function abortAllRequests() {
	requestPool.forEach
		(
			function (request) {
				request.abort();
			}
		);
	requestPool = [];
}

function toggle(site) {
	css = $('#' + site + ' > div > table').css('display');

	if (css == '' || css == 'table' || css == 'block') $('#' + site + ' > div > table').css('display', 'none');
	else if (css == 'none') $('#' + site + ' > div > table').css('display', '');
}

function quoteEscaped(str) {
	str = str.replace(/'/g, "\\'");
	str = str.replace(/"/g, '\\"');

	return str;
}

function copyToClipboard(value) {
	let temp = $("<input>");
	$("body").append(temp);
	temp.val(value).select();
	document.execCommand("copy");
	temp.remove();
}
