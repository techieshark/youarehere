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


/* split an array into chunks of a specified size
 * ex: chunks([1,2,3,4,5,6],2) -> [[1,2],[3,4],[5,6]]
*/
function chunks(array, size) {
  var results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};


// return true if spot is cool
function is_cool(spot) {

    // Also check spot.category_list for interesting categories.
    // console.log(spot.category_list);

    // spot.category_list[i].name
    var i = _.filter(spot.category_list, function(cat) { return interesting(cat.name); }).length;
    var j = interesting(spot.category);

    return i || j;
    // return true;
}


/* returns place as html.
   place is an object, property is the property within place to output
   */
// function place_out(place, property) {
//     if (property in place) return '<p class=place-"'+property+'">' + place[property] + '</p>';
//     return '';
// }

Date.prototype.getDayName = function() {
    var d = ['sun','mon','tue','wed','thu','fri','sat'];
    return d[this.getDay()];
}

/* convert from facebook place hours to human friendly string */
function fbhours_to_string(hours) {
    // XXX placeholder, assume today is friday BUG
    var d = new Date;
    var open = d.getDayName() + '_1_open';
    var close = d.getDayName() + '_1_close';
    if (hours && hours[open]) {
        return 'Hours: ' + hours[open] + " to " + hours[close];
    } else return "Hours: Unknown";
}


/* converts facebook place to simple view (returned) for mustache */
function fbplace_to_view(place) {
    var view = {
        id: place.id,
        name: place.name,
        address: place.location.street,
        checkins: place.checkins,
        phone: place.phone,
        hours: fbhours_to_string(place.hours), // XXX placeholder
        about: place.about,
        // food:
        website: place.website,
    };
    return view;
}

// return html version of spot
function htmlprint(spot) {
    glob = spot.category_list;
    // return "<li>" + spot.name + ", " + spot.location.street + "</li>"
    var fun = is_cool(spot);

    // query for specific details for each place so we can show more info.
    FB.api("/" + spot.id,
        function(place) {
            console.log(place.phone + ',' + place.website + ',' + place.about);
            console.log(place);

            // place_out(place, 'address');

            var template =
                '<div class="col-sm-6 col-md-4">' +
                    '<div class="thumbnail" id="{{id}}">' +
                        '<img src="http://placekitten.com/300/200" alt="...">' +
                        '<div class="caption">' +
                            '<h3>{{name}}</h3>' +
                            '<p class="place-address">{{address}}</p>' +
                            '<p class="place-phone">{{phone}}</p>' +
                            '<p class="place-hours">{{hours}}</p>' +
                            '<p class="place-about">{{about}}</p>' +
                            '<p class="place-food">{{foods}}</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            $('#' + spot.id).replaceWith(
                Mustache.render(template, fbplace_to_view(place))
            );

            // now that the textual content has been rendered, we can add a photo to it.
            FB.api("/" + spot.id + "/photos",
                function(place) {
                    //https://developers.facebook.com/tools/explorer/145634995501895/?method=GET&path=84554169003%2Fphotos
                    //get a reasonably sized image
                    //assume first image is the one we want.

                    if (place.data && place.data.length > 0 && place.data[0].images) {
                        // var firstpics = _.first(place.data[0].images, function(image) {
                        //     return image.height >= 200 && image.height <= 500;
                        //     // return true;
                        // });

                        $('#' + spot.id + ' img').attr('src', place.data[0].images[0].source);
                    } // else if no data, we can't do much, now can we? other than random cat pics.

                });
        });


    // print the item (and include ID so we can add to it later).

    return "<li id='" + spot.id + "'>" + (fun?"<b>":"") + spot.name + ", " + spot.category
    + ': [' + _.map(spot.category_list, function(cat) { return cat.name; }).join(', ') + ']' +
    (fun?"</b>":"") + "</li>";
}

/* is this thing food related? if so, return true. */
function interesting (thing) {
    var food = /food/i.test(thing);
    var restaurant = /restaurant/i.test(thing);
    var pizza = /pizza/i.test(thing);
    var cafe = /cafe/i.test(thing);
    var interesting = food || restaurant || pizza || cafe;
    return interesting;
}




function find_fun_nearby(lat, lon) {
    FB.login(function() {

        // DEBUG - use Mesa lat/lon
        lat = 33.378766;
        lon = -111.86182;

        // FB.api(path, method (default: get), params, callback);
        FB.api("/search",
            {type: 'place', center: '' + lat + ',' + lon, distance: '1000'},
            function(response) {

                $('#resultlist').replaceWith(
                    _.map(
                        chunks(
                            _.map(
                                _.filter(response.data, is_cool),
                                htmlprint
                                ),
                            3
                        ), function (three) {
                            return '<div class="row">' +
                                three.join('') + '</div>'
                        }).join('')
                    );

                // console.log(response);
            }
        );
    });

}


// p : geolocation object
function geoloc_success(p){
    console.log("We found you! At lat: " + p.coords.latitude + ", lon: " + p.coords.longitude);
    console.log("(Within " + p.coords.accuracy + " meters.)");

    // Now that we have our location, we can look for interesting things nearby.
    find_fun_nearby(p.coords.latitude, p.coords.longitude);

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
          // appId: '612274872174090', // localhost dev ID
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
