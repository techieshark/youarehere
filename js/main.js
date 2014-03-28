var glob; // global debug obj
var httpRequest;

function makeRequest(url,address,callback) {
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
      httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
      try {
        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
      }
      catch (e) {
        try {
          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (e) {}
      }
    }

    if (!httpRequest) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
    httpRequest.onreadystatechange = callback;
    httpRequest.open('POST', url);
    httpRequest.setRequestHeader('Content-Type','application/json;charset=UTF-8');
    var jsonparams = JSON.stringify({"address":address});
    httpRequest.send(jsonparams);
}

function sendToDOM() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var repdata = JSON.parse(httpRequest.responseText);
          if (repdata.officials.P28.channels) {
            var result = '<div class="col-lg-4">\
            <h2>' + repdata.officials.P28.name + '</h2>\
            <img src=' + repdata.officials.P28.photoUrl + '>\
            <p><a href="http://www.twitter.com/' + repdata.officials.P28.channels[1].id.replace(" ", "") + '\
            ">http://www.twitter.com/\
            ' + repdata.officials.P28.channels[1].id + '</a></p>\
            </div>';
          }
          else
          {
            var result = '<div class="col-lg-4">\
            <h2>' + repdata.officials.P28.name + '</h2>\
            <img src=' + repdata.officials.P28.photoUrl + '></p>\
            </div>';
          }


        $("#councilmember").replaceWith(result);
      } else {
      alert('There was a problem with the request.');
      }
    }
}


// return true if spot is cool
function cool(spot) {

    // Also check spot.category_list for interesting categories.
    console.log(spot.category_list);

    // spot.category_list[i].name
    var i = _.filter(spot.category_list, function(cat) { return interesting(cat.name); }).length;
    var j = interesting(spot.category);

    return i || j;
    // return true;
}

// return html version of spot
function htmlprint(spot) {
    glob = spot.category_list;
    // return "<li>" + spot.name + ", " + spot.location.street + "</li>"
    var fun = cool(spot);
    return "<li>" + (fun?"<b>":"") + spot.name + ", " + spot.category
    + ': [' + _.map(spot.category_list, function(cat) { return cat.name; }).join(', ') + ']' +
    (fun?"</b>":"") + "</li>"
}

function interesting (thing) {
    var food = /food/i.test(thing);
    var restaurant = /restaurant/i.test(thing);
    var pizza = /pizza/i.test(thing);
    var cafe = /cafe/i.test(thing);
    var interesting = food || restaurant || pizza || cafe;
    return interesting;
}

// p : geolocation object
function geoloc_success(p){
    console.log("We found you! At lat: " + p.coords.latitude + ", lon: " + p.coords.longitude);
    console.log("(Within " + p.coords.accuracy + " meters.)");

    FB.login(function() {
        // FB.api(path, method (default: get), params, callback);
        lat = 33.378766;
        lon = -111.86182;
        // lat = p.coords.latitude;
        // lon = p.coords.longitude;
        FB.api("/search",
            {type: 'place', center: '' + lat + ',' + lon, distance: '1000'},
            function(response) {

                $('#resultlist').replaceWith(
                    "<ul>" +
                    _.map(
                        _.filter(response.data, function(x) { return true; } /*cool*/),
                        htmlprint
                    ).join('') +
                    "</ul>");

                console.log(response); }

                // Filter for:
                // food, cafe, restaurant, pizza
        );
    });
}

function geoloc_error(p){
    console.log("Bummer! Geolocation failed: " + p.message);
    if (p.code == p.PERMISSION_DENIED) { // user said no!
        console.log("Aww, sad. The user didn't want to tell us where they are.");
    } else if (p.code == p.POSITION_UNAVAILABLE) {
        console.log("Bummer! A network or GPS error prevented us from discovering user's location.");
    }
}

$(document).ready(function() {

    // Get the Facebook API
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/all.js', function(){
        FB.init({
          appId: '550788961695418',
        });


        // later: only run this after we have both location and facebook api (maybe we
        // can assume that getting the fb api takes no-little time?)
        //search?type=place&center=33.378776,-111.861823&distance=1000&access_token
    });

    // What is the user's location?
    if(geoPosition.init()){  // Geolocation Initialisation
            geoPosition.getCurrentPosition(geoloc_success,geoloc_error,{enableHighAccuracy:true});
    } else {
            // You cannot use Geolocation in this device
            //console.log("This device doesn't support Geolocation.");
    }
    // geoPositionSimulator.init();

    document.getElementById("ajaxButton").onclick = function() {
        var address = document.getElementById("ajaxTextbox").value;
        makeRequest(
          'https://www.googleapis.com/civicinfo/us_v1/representatives/lookup?key=AIzaSyAzOF-EGWefl40wZ28RNwZLG4MRVQCw6cg',
          address,
          sendToDOM);
    };

});
