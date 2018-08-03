var locations = [
  {
    title: 'Aeroporto Bacacheri',
    location: {lat: -25.4021675, lng: -49.2334194 }
  },
  {
    title: 'Parque Bacacheri',
    location: {lat: -25.390131, lng: -49.230268}
  },
  {
    title: 'Museu Egípcio',
    location: {lat: -25.390481, lng: -49.225742}
  },
  {
    title: '20 BIB',
    location: {lat: -25.402262, lng: -49.240776}
  },
  {
    title: 'Graciosa Country Club',
    location: {lat: -25.407359, lng: -49.248015}
  },
  {
    title: 'Shopping Via Colleghi',
    location: {lat: -25.404379, lng: -49.245154}
  },
  {
    title: 'Cindacta 2',
    location: {lat: -25.400118, lng: -49.237518}
  },
  {
    title: '27 Batalhão Logístico',
    location: {lat: -25.395961, lng: -49.226121}
  },
  {
    title: 'Clube Duque de Caxias',
    location: {lat: -25.396376, lng: -49.236853}
  },
  {
    title: 'Obelisco E. Gaertner',
    location: {lat: -25.405062, lng: -49.245561}
  }
];

var LocationData = function(data){
  this.title = ko.observable(data.title);
  this.locations = ko.observable(data.location);
};

var ViewModel = function(){
  var self = this;

  self.positionList = ko.observableArray([]);
  self.query = ko.observable('');

  locations.forEach(function(positionItem){
    self.positionList.push(new LocationData(positionItem))
  });

  this.filteredList = ko.computed(function(){
    if(!self.query()){
      return self.positionList();
    }else{
      return self.positionList().filter(place => place.title().toLowerCase().indexOf(self.query().toLowerCase()) > -1);
      console.log(self.positionList().filter(place => place.title().toLowerCase().indexOf(self.query().toLowerCase()) > -1));
    }
  }, this);
  // initMap();
};
ko.applyBindings(new ViewModel());


var map;
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  var listaFiltrada = new ViewModel();


//=========================================

  // console.log(filteredList()[1].locations());
  // // console.log(filteredList().length);
  // console.log(positionList().length);
  // console.log(query());

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -25.404812 , lng: -49.236487},
    zoom: 15
  });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // for(var i = 0; i < filteredList().length; i++){
    //   var position = filteredList()[i].locations();
    //   var title = filteredList()[i].title();
    for(var i = 0; i < listaFiltrada.positionList().length; i++){
      var position = listaFiltrada.positionList()[i].locations();
      var title = listaFiltrada.positionList()[i].title();

      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });
      markers.push(marker);

      marker.addListener('click', function(){
        populateInfoWindow(this, largeInfowindow);
      });
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}


function populateInfoWindow(marker, infowindow){
  if(infowindow.marker != marker){
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    infowindow.addListener('closeclick', function(){
      infowindow.setMarker = null;
    });
  }
}
