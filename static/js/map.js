// Array com os locais apresentados no mapa
var locations = [
  {
    title: 'Aeroporto do Bacacheri',
    location: {lat: -25.4021675, lng: -49.2334194 }
    },
  {
    title: 'Universidade Federal do Paraná',
    location: {lat: -25.411706, lng: -49.250299 }
    },
  {
    title: 'Estádio Major Antônio Couto Pereira',
    location: {lat: -25.421124, lng: -49.259533 }
    },
  {
    title: 'Parque Bacacheri',
    location: {lat: -25.390131, lng: -49.230268 }
    },
  {
    title: 'Museu Egípcio e Rosa Cruz',
    location: {lat: -25.390481, lng: -49.225742 }
    },
  {
    title: 'Cindacta II',
    location: {lat: -25.400118, lng: -49.237518},
  }
];


var map;
var bounds;
var infowindow;


function initMap() {
  // Cria um novo mapa - somente center e zoom são requeridos.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -25.400118 , lng: -49.237518},
    zoom: 14
  });
  console.log(map)

  // Cria uma infowindow para apresentar informações no marker,
  infowindow = new google.maps.InfoWindow({
        maxWidth: 150,
        content: ""
  });

  bounds = new google.maps.LatLngBounds();

  // Ao fazer zoom se clicar no mapa ele retorna ao zoom de 14 e centralizado
  // na lat e lng fornecida abaixo.
  map.addListener('click', function () {
      infowindow.close(infowindow);
      map.setCenter({
          lat: -25.400118,
          lng: -49.237518
      });
      map.setZoom(14);
  });

  window.onresize = function () {
      map.fitBounds(bounds);
  };

  // Função construtora para cria o objeto para dar um observable array.
  var View = function(data){
    var self = this;
    this.name = ko.observable(data.title);
    this.location = data.location;
    this.marker = "";
    this.id = data.id;
    this.Url = "";
    this.textWiki = "";
  };

  // Cria um efeito de BOUNCE quando clicar sobre o marker.
  function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 2000);
        }
    }

    // Insere o conteúdo no infowindow.
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
            " target=_blank>Acessar a Wikipédia</a>"+
        "</div>";
        let errorString = "Conteúdo não disponível na Wikipédia.";
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
    //
87/5000
    // Adiciona o marker para cada local e adiciona conteúdo ao infowindow
    // com o evento "click"
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

    // Requisição AJAX
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
// Função para verificar o erro de carregamento do mapa
function googleError() {
    document.getElementById('mapError').style.display = 'block';
}
