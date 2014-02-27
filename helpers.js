//var redis = require('redis');
//var redis = require('redis-url').connect(process.env.REDISTOGO_URL);
var settings = require('./settings');
var crypto = require('crypto');

//var rtg   = require("url").parse(process.env.REDISTOGO_URL);
var redis = require('heroku-redis-client'),
    redisClient = redis.createClient();

//var redisClient = redis.createClient(settings.REDIS_PORT, settings.REDIS_HOST);
//redisClient.client.auth(rtg.auth.split(":")[1]);
//redisClient.auth(PASSWORD);

function isValidRequest(request) {
    // First, let's verify the payload's integrity by making sure it's
    // coming from a trusted source. We use the client secret as the key
    // to the HMAC.
    /*var hmac = crypto.createHmac('sha1', settings.CLIENT_SECRET);
    hmac.update(request.rawBody);
    var providedSignature = request.headers['x-hub-signature'];
    var calculatedSignature = hmac.digest(encoding='hex');
    
    // If they don't match up or we don't have any data coming over the
    // wire, then it's not valid.
    return !((providedSignature != calculatedSignature) || !request.body)*/
    return true
}
exports.isValidRequest = isValidRequest;

function debug(msg) {
  if (settings.debug) {
    console.log(msg);
  }
}
exports.debug = debug;

/*

    Each update that comes from Instagram merely tells us that there's new
    data to go fetch. The update does not include the data. So, we take the
    geography ID from the update, and make the call to the API.

*/

function processGeography(geoName, update){
  var path = '/v1/geographies/' + update.object_id + '/media/recent/';
  getMinID(geoName, function(error, minID){
    var queryString = "?client_id="+ settings.CLIENT_ID;
    if(minID){
      queryString += '&min_id=' + minID;

    } else {
        // If this is the first update, just grab the most recent.
      queryString += '&count=1';
    }
    var options = {
      host: settings.apiHost,
      // Note that in all implementations, basePath will be ''. Here at
      // instagram, this aint true ;)
      path: settings.basePath + path + queryString
    };
    if(settings.apiPort){
        options['port'] = settings.apiPort;
    }

        // Asynchronously ask the Instagram API for new media for a given
        // geography.
    debug("processGeography: getting " + path + queryString);
    settings.httpClient.get(options, function(response){
      var data = '';
      response.on('data', function(chunk){
        debug("Got data...");
        data += chunk;
      });
      response.on('end', function(){
        debug("Got end.");
          try {
            var parsedResponse = JSON.parse(data);
          } catch (e) {
              console.log('Couldn\'t parse data. Malformed?');
              return;
          }
        if(!parsedResponse || !parsedResponse['data']){
            console.log('Did not receive data for ' + geoName +':');
            console.log(data);
            return;
        }
        setMinID(geoName, parsedResponse['data']);
        
        // Let all the redis listeners know that we've got new media.
        console.log("geoname: "+geoName);
        redisClient.publish('channel:' + geoName, data);
        //debug("Published: " + data);
      });
    });
  });
}

function processTag(tagName, update){
  var path = '/v1/tags/' + update.object_id + '/media/recent/';
  getMinID(tagName, function(error, minID){
    var queryString = "?client_id="+ settings.CLIENT_ID;
    if(minID){
      queryString += '&min_id=' + minID + '&count=1';
      //queryString += '&count=1';
    } else {
        // If this is the first update, just grab the most recent.
      queryString += '&count=1';
    }
    var options = {
      host: settings.apiHost,
      // Note that in all implementations, basePath will be ''. Here at
      // instagram, this aint true ;)
      path: settings.basePath + path + queryString
    };
    if(settings.apiPort){
        options['port'] = settings.apiPort;
    }

        // Asynchronously ask the Instagram API for new media for a given
        // geography.
    debug("processTag: getting " + path + queryString);
    settings.httpClient.get(options, function(response){
      var data = '';
      response.on('data', function(chunk){
        debug("Got data...");
        data += chunk;
      });
      response.on('end', function(){
        debug("Got end.");
          try {
            var parsedResponse = JSON.parse(data);
          } catch (e) {
              console.log('Couldn\'t parse data. Malformed?');
              return;
          }
        if(!parsedResponse || !parsedResponse['data']){
            console.log('Did not receive data for ' + geoName +':');
            console.log(data);
            return;
        }
        setMinID(tagName, parsedResponse['data']);
        
        // Let all the redis listeners know that we've got new media.
        redisClient.publish('channel:' + tagName, data);
        //debug("Published: " + data);
      });
    });
  });
}


exports.processTag = processTag;
exports.processGeography = processGeography;

function getMedia(callback){
    // This function gets the most recent media stored in redis
  redisClient.lrange('media:objects', 0, 75, function(error, media){
      debug("getMedia: got " + media.length + " items");
      // Parse each media JSON to send to callback
      media = media.map(function(json){return JSON.parse(json);});
      callback(error, media);
  });
}
exports.getMedia = getMedia;

/*
    In order to only ask for the most recent media, we store the MAXIMUM ID
    of the media for every geography we've fetched. This way, when we get an
    update, we simply provide a min_id parameter to the Instagram API that
    fetches all media that have been posted *since* the min_id.
    
    You might notice there's a fatal flaw in this logic: We create
    media objects once your upload finishes, not when you click 'done' in the
    app. This means that if you take longer to press done than someone else
    who will trigger an update on your same geography, then we will skip
    over your media. Alas, this is a demo app, and I've had far too
    much red bull – so we'll live with it for the time being.
    
*/

function getMinID(geoName, callback){
  redisClient.get('min-id:channel:' + geoName, callback);
}
exports.getMinID = getMinID;

function setMinID(geoName, data){
    var sorted = data.sort(function(a, b){
        return parseInt(b.id) - parseInt(a.id);
    });
    var nextMinID;
    try {
        nextMinID = parseInt(sorted[0].id);
      redisClient.set('min-id:channel:' + geoName, nextMinID);
    } catch (e) {
        console.log('Error parsing min ID');
        console.log(sorted);
    }
}
exports.setMinID = setMinID;
