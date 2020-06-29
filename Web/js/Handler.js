var requestPool = [];

$(document).ready
(
  function()
  {
    $('select').formSelect();
    $('.modal').modal({'dismissible': false});
    initSites();
  }
);

function initSites()
{
  $('#siteHolder').html('');
  sendGet
  (
    'getSites',
    {},
    function(response)
    {
      if(response['sites'].length === 0)
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

          $('#siteHolder').html($('#siteHolder').html() + div.prop('outerHTML'));
        }
      );
      $('#sites').html(html);
      $('select').formSelect();
    },
    function(error)
    {
      M.toast({html: 'Error Occured, Check console for details', displayLength: 2000});
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
      url: 'http://samcloud.tplinkdns.com:50000/' + to,
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