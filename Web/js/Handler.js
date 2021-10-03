var requestPool = [];

$(document).ready
(
  function()
  {
    toggleDarkMode();

    $('select').formSelect();
    $('.modal').modal({'dismissible': false});
    initSites();
  }
);

$(document).keypress
(
  function(e)
  {
    if(e.which == 13)
    {
      searchTorrents();
      $('#search_input').blur();
    }
});

function sortTableRow(tableID, colIndex, type)
{
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

      switch(type)
      {
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
      switchcount ++;

      let ths = $(table).find('th');

      ths.each
      (
        function(index)
        {
          $(this).html($(this).data('orightml'));
        }
      );

      let th = ths[colIndex];

      if(dir == "asc")
      {
        $(th).html($(th).data('orightml') + " ▲");
      }
      else if(dir == "desc")
      {
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

function convertToBytes(sizeStr)
{
  sizeSplit = sizeStr.split(" ");

  step = 1000.0;
  bytes = 1;

  sizeList = ['bytes', 'KB', 'MB', 'GB', 'TB'];

  for(let i = 0; i < sizeList.length; i++)
  {
    if(sizeList[i].toLowerCase() == sizeSplit[1].toLowerCase())
      break;

    bytes *= step;
  }

  return bytes * Number(sizeSplit[0]);
}

function getDarkModeActive()
{
  let darkModeActive = localStorage.getItem("darkModeActive");

  if(darkModeActive == null || darkModeActive == undefined) return false;
  else return JSON.parse(darkModeActive);
}

function setDarkModeActive(darkModeActive)
{
  localStorage.setItem("darkModeActive", darkModeActive);
}

function toggleDarkMode()
{
  if(getDarkModeActive())
  {
    $("nav div").removeClass("grey darken-4");
    $("nav div").addClass("blue");
    $("body").removeClass("black");
    $(".card-panel").removeClass("grey darken-4");
    $(".btn").removeClass("black");
    $("body").css("color", "black");
    $("input").css("color", "black");
    $(".modal").removeClass("grey darken-4");

    toggleSelectDarkMode();

    return;
  }

  $("nav div").removeClass("blue");
  $("nav div").addClass("grey darken-4");
  $("body").addClass("black");
  $(".card-panel").addClass("grey darken-4");
  $(".btn").addClass("black");
  $("body").css("color", "white");
  $("input").css("color", "white");
  $(".modal").addClass("grey darken-4");

  toggleSelectDarkMode();
}

function toggleSelectDarkMode()
{
  if(getDarkModeActive())
  {
    $("div.select-wrapper li").css("background-color", "white");
    $(".dropdown-trigger").css("color", "black");
    $(".select-wrapper .caret").css("fill", "black");
    return;
  }

  $("div.select-wrapper li").css("background-color", "black");
  $(".dropdown-trigger").css("color", "white");
  $(".select-wrapper .caret").css("fill", "white");
}

function initSites()
{
  $('#siteHolder').html('');
  sendGet
  (
    'getSites',
    {},
    function(response)
    {
      if(response['sites'] == null || response['sites'] == undefined || response['sites'].length == 0)
      {
        M.toast({html: 'Could not retrieve site details, please try after some time', displayLength: 2000});
        return;
      }

      let html = "";
      response['sites'].forEach
      (
        function(site, index)
        {
          html += "<option value=\"" + site + "\"" + (index === 0 ? " selected>" : ">") + site + "</option>";

          var div = $('#siteData').clone();
          div.css('display', 'block');
          div.prop('id', site);
          div.find('h5').html(site);
          div.find('h6').html('Torrents will appear here');
          div.find('table').prop('id', site + "Table");

          $('#siteHolder').html($('#siteHolder').html() + div.prop('outerHTML'));
        }
      );
      $('#sites').html(html);
      $('select').formSelect();

      toggleSelectDarkMode();
    },
    function(error)
    {
      M.toast({html: 'Could not retrieve site details, please try after some time', displayLength: 2000});
      console.log(error);
    }
  );
}

function searchTorrents()
{
  let search_key = $('#search_input').val();
  if(!search_key || search_key == "")
  {
    M.toast({html: 'Search query cannot be empty!', displayLength: 2000});
    return;
  }

  let sites = $('#sites').val();
  if(!sites || sites == "" || sites.length === 0)
  {
    M.toast({html: 'Select some sites!', displayLength: 2000});
    return;
  }

  abortAllRequests();

  $('.toggle').css('display', 'none');
  $('#searchBtn').attr('disabled', true);
  $('table').css('display', 'none')
  $('tbody').html('');
  $('h6').html('Torrents will appear here');
  $('h6').css('display', 'block')
  $('.progress').css('display', 'none')

  sites.forEach
  (
    function(site)
    {
      $('#' + site + ' > a').css('display', 'none');
      $('#' + site + ' > h6').css('display', 'none');
      $('#' + site + ' > div > table').css('display', 'none');
      $('#' + site + ' > .progress').css('display', 'block');
      sendGet
      (
        'getTorrents',
        {'search_key' : search_key, 'site' : site},
        function(response)
        {
          if(response == "Invalid Request")
          {
            $('#searchBtn').attr('disabled', false);
            $('#' + site + ' > h6').html('No Torrents found');
            $('#' + site + ' > h6').css('display', 'block');
            $('#' + site + ' > .progress').css('display', 'none');
            M.toast({html: 'Server received a invalid request, try again!', displayLength: 2000});
            return;
          }
          if(response['torrents'].length === 0)
          {
            $('#' + site + ' > h6').html('No Torrents found');
            $('#' + site + ' > h6').css('display', 'block');
            $('#' + site + ' > .progress').css('display', 'none');
          }
          else
          {
            $('#' + site + ' > .progress').css('display', 'none');
            populateTable(response['torrents'], site);
          }

          $('#searchBtn').attr('disabled', false);
        },
        function(error)
        {
          $('#searchBtn').attr('disabled', false);
          $('#' + site + ' > h6').html('No Torrents found');
          $('#' + site + ' > h6').css('display', 'block');
          $('#' + site + ' > .progress').css('display', 'none');
          if(error.statusText == "abort")
          {
            console.log("Previous request aborted");
            return;
          }
          M.toast({html: 'Error Occured, Check console for details', displayLength: 2000});
          console.log(error);
        }
      );
    }
  );
}

function populateTable(torrents, site)
{
  let html = "";
  torrents.forEach
  (
    function(data, index)
    {
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
    function()
    {
      toggle(site);
    }
  );

  $('#' + site + ' > a').css('display', 'inline-block');
}

function selectTorrent(name, link, site)
{
  $('#loader, #torrentLoader').css('display', 'block');
  $('#torrentData').css('display', 'none');
  $('#torrentDataModal').modal('open');

  sendGet
  (
    'getTorrentData',
    {'link' : link, 'site' : site},
    function(response)
    {
      if(response == "Invalid Request")
      {
        $('#loader').css('display', 'none');
        $('#torrentDataModal').modal('close');
        M.toast({html: 'Server received a invalid request, try again!', displayLength: 2000});
        return;
      }

      populateModal(name, response);

      $('#loader').css('display', 'none');
      $('#torrentData').css('display', 'block');
    },
    function(error)
    {
      $('#loader').css('display', 'none');
      $('#torrentDataModal').modal('close');
      M.toast({html: 'Error Occured, Check console for details', displayLength: 2000});
      console.log(error);
    }
  );
}

function populateModal(name, data)
{
  $('#tName').html(name);

  let html = "";
  data.files.forEach
  (
    function(file)
    {
      html += "<h6 class=\"blue-text\">" + file + "</h6>";
    }
  );

  $('#files').html(html);

  $('#oitBtn').unbind('click');
  $('#oitBtn').click
  (
    function()
    {
      window.open(data.magnet);
    }
  );

  $('#cplBtn').unbind('click');
  $('#cplBtn').click
  (
    function()
    {
      M.toast({html: 'Magnet copied to clipboard!', displayLength: 2000});
      copyToClipboard(data.magnet);
    }
  );
}

function sendGet(to, data, success, failed)
{
  let request = $.ajax
  (
    {
      type: 'GET',
      contentType: 'application/json',
      url: 'http://localhost:50000/' + to,
      data: data,
      dataType: 'json',
      cache: false,
      timeout: 15000,
      success: success,
      error: failed
    }
  );
  requestPool.push(request);
}

function abortAllRequests()
{
  requestPool.forEach
  (
    function(request)
    {
      request.abort();
    }
  );
  requestPool = [];
}

function toggle(site)
{
  css = $('#' + site + ' > div > table').css('display');

  if(css == '' || css == 'table' || css == 'block') $('#' + site + ' > div > table').css('display', 'none');
  else if(css == 'none') $('#' + site + ' > div > table').css('display', '');
}

function quoteEscaped(str)
{
  str = str.replace(/'/g, "\\'");
  str = str.replace(/"/g, '\\"');

  return str;
}

function copyToClipboard(value)
{
  let temp = $("<input>");
  $("body").append(temp);
  temp.val(value).select();
  document.execCommand("copy");
  temp.remove();
}
