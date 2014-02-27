var socket = io.connect();

socket.on('message', function(update){ 
  Media.onUpdate(update.update);
});

var Media = {
    onUpdate: function(data){
      $(data).each(function(index, media){

          var text = media.caption.text.substring(0,100);
          var $box = $('<div class="cube"><img src='+media.images.low_resolution.url+'><div class="info"><span class="text">'+text+'</span></div></div>');
          $('#wrapper').prepend( $box ).masonry( 'prepended', $box , true);
      });

    }
};

$(document).bind("newMedia", Media.onNewMedia)

$( document ).ready(function() {
   $('#wrapper').masonry({
      columnWidth: 200,
      itemSelector: '.cube',
      "gutter": 30
    });
    
});

