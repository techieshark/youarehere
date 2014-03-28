var glob; // global debug obj

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

});
