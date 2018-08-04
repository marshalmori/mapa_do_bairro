var locations = [
  {
    title: 'Aeroporto do Bacacheri',
    location: {lat: -25.4021675, lng: -49.2334194 },
    id: '4d0f5d1ad7d6a09006a467f7'
  },
  {
    title: 'Parque Bacacheri',
    location: {lat: -25.390131, lng: -49.230268},
    id: '4d0f5d1ad7d6a09006a467f7'
  },
  {
    title: 'Museu Egípcio e Rosa Cruz',
    location: {lat: -25.390481, lng: -49.225742},
    id: '4d0f5d1ad7d6a09006a467f7'
  },
  {
    title: 'Cindacta II',
    location: {lat: -25.400118, lng: -49.237518},
    id: '4d0f5d1ad7d6a09006a467f7'
  }
];


var foursquareUrl = 'https://api.foursquare.com/v2/venues/';
var foursquareClientID = '/?&client_id=HP0EAILBVHBST1TDVEC5I34RX2BFMBAAZK1WDCVCOYC5CF0O';
var foursquareClientSecret = '&client_secret=S05VEWMPQHUINJLKORFGVWDWEDGFUGMK2FDXU2OOYK4W44VB';
var foursquareVersion = '&v=20180323';

var map;
var bounds;
var infowindow;


function initMap() {

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -25.400118 , lng: -49.237518},
    zoom: 15
  });

  infowindow = new google.maps.InfoWindow({
        maxWidth: 150,
        content: ""
  });

  bounds = new google.maps.LatLngBounds();

  map.addListener('click', function () {
      infowindow.close(infowindow);
      map.setCenter({
          lat: -25.400118,
          lng: -49.237518
      });
      map.setZoom(15);
  });

  window.onresize = function () {
      map.fitBounds(bounds);
  };

  // Constructor function to create object and push in observable array
  var View = function(data){
    var self = this;
    this.name = ko.observable(data.title);
    this.location = data.location;
    this.marker = "";
    this.id = data.id;
    this.Url = "";
    this.textWiki = "";
  };

  // Creates a bounce effect on marker when clicked on
  function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            // marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 2000);
        }
    }


    /*Sets the content of the infowindow*/
    function getContent(view) {
      var contentString = "<h4>" + view.name + "</h4>" +
        "<br>" +
        "<div style='width:150px;min-height:150px'>" +
            "<p>" +
              view.textWiki +
            "</p>"+
        "</div>"+
        "<div>" +
            "<a href="+
              view.Url +
            " target=_blank>Acessar a Wikipedia</a>"+
        "</div>";
        let errorString = "Conteúdo não disponível na Wikipedia.";
        if (view.name.length > 0) {
            return contentString;
        } else {
            return errorString;
        }
    }

  var ViewModel = function(){
    var self = this;

    this.itemClicked = function (view) {
            google.maps.event.trigger(view.marker, "click");
        };

        this.viewList = ko.observableArray([]);
        locations.forEach(function (item) {
            self.viewList().push(new View(item));
        });
        //Adding marker for each location and adding content to the infowindow with "click" event
        self.viewList().forEach(function (view) {
            var marker = new google.maps.Marker({
                map: map,
                position: view.location,
                animation: google.maps.Animation.DROP
            });
            view.marker = marker;
            bounds.extend(marker.position);
            marker.addListener("click", function (e) {
                map.panTo(this.position);
                infowindow.setContent(getContent(view));
                infowindow.open(map, marker);
                toggleBounce(marker);
            });
        });


        //AJAX request to get images
        this.getWikipediaInfos = ko.computed(function () {
            self.viewList().forEach(function (view) {
                var  wikiURL = 'http://pt.wikipedia.org/w/api.php?action=opensearch&search=' + view.name() + '&format=json&callback=wikiCallback';
                $.ajax(wikiURL, {
                  dataType: "jsonp",
                  data: {
                    async: true
                  }
                }).done(function (response) {
                    view.name = response[1][0];
                    view.textWiki = response[2][0];
                    view.Url = response[3][0];
                });
            });
        });

        self.query = ko.observable('');

        this.filteredViewList = ko.computed(function(){
          if(!self.query()){
            return ko.utils.arrayFilter(self.viewList(), function(item){
              item.marker.setVisible(true);
              return true;
            });
          }else{
            return ko.utils.arrayFilter(this.viewList(), function(item){
              if (item.name.toLowerCase().indexOf(self.query()) >= 0){
                item.marker.setVisible(true);
                return true;
              }else {
                item.marker.setVisible(false);
                return false;
              }
            });
          }
        }, this);

  }
  ko.applyBindings(new ViewModel());
}
