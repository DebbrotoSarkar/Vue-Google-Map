/*
Features
 ::

  - Generate google map
  - Map marker and info window

Usage
 ::

    Stylus
        @import '../../../../vrs/static/css/common/component/listing_map'

    Html
        <listing-map :map-items="properties" :change-track="changeTrack"></listing-map>

Props
 ::

    +------------------------------+---------------------+------------+------------------------------------------------------------+
    | Prop                         |     Type            |  Required  | Description                                                |
    +==============================+=====================+============+============================================================+
    | mapItems                     |     Object          |            | Search property data                                       |
    +------------------------------|---------------------|------------|-------------------------------------------------------------
    | changeTrack                  |     Number          |            | Track property data change                                 |
    +------------------------------+---------------------+------------+------------------------------------------------------------+
*/
Vue.component('listing-map', {
    props: {
        mapItems: {
            type: Object,
            default: []
        },
        changeTrack: {
            type: Number,
            default: 0
        },
        selectedTiles: {
            type: String,
            default: ''
        }
    },
    data: function () {
        return {
            map: null,
            markers: [],
            infowindow: new google.maps.InfoWindow(),
            mapBounds: {}
        }
    },
    methods: {
        initMap: function() {
            var self = this;
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 5,
                center: new google.maps.LatLng(0,0),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: true,
                mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                  position: google.maps.ControlPosition.LEFT_BOTTOM
                },
                zoomControl: true,
                zoomControlOptions: {
                  position: google.maps.ControlPosition.LEFT_TOP
                },
                scaleControl: true,
                streetViewControl: true,
                streetViewControlOptions: {
                  position: google.maps.ControlPosition.LEFT_TOP
                },
                fullscreenControl: true
            });
            google.maps.event.addListener(self.map, 'dragend', function() {
                self.setMapBounds();
                console.log(self.mapBounds);
            });
            google.maps.event.addListener(self.map, 'zoom_changed', function() {
                self.setMapBounds();
                console.log(self.mapBounds);
            });
        },
        setMarker: function() {
            var bounds = new google.maps.LatLngBounds();
            this.markers = [];
            var self = this;
            for(var i = 0; i < this.mapItems.length; i++){
                if(typeof this.mapItems[i]['is_demo'] == 'undefined'){
                     /**Init properties**/
                    var latLng = new google.maps.LatLng(this.mapItems[i]['latitude'], this.mapItems[i]['lngtitude']);
                    var infoWindowContent = this.getInfoWindowContent(this.mapItems[i]);
                    /**Icon properties**/
                    var icon = {
                        url: "https://pngimage.net/wp-content/uploads/2018/06/orange-rectangle-png-7.png",
                        scaledSize: {width: this.mapItems[i]['formatted_price'].length * 10, height: 20, f: 'px', b: 'px'}
                    };

                    /**Label properties**/
                    var label = {
                        text: this.mapItems[i]['formatted_price'] , color: 'white', fontWeight: 'bold', fontSize: '12px'
                    };

                    /**Set markers**/
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: this.map,
                        icon: icon,
                        label: label,
                        id: this.mapItems[i]['id']
                    });

                    this.markers.push(marker);

                    /**Set info windows**/
                    google.maps.event.addListener(marker, 'click', function(infoWindowContent){
                        return function(){
                            self.infowindow.setContent(infoWindowContent);
                            self.infowindow.open(this.map, this);
                            self.$emit('property-id', this.id);
                        }
                    }(infoWindowContent));

                    /**Extend fit bound**/
                    bounds.extend(marker.position);
                }
            }
            var mcOptions = {gridSize: 2, maxZoom: 15, imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'};
            var markerCluster = new MarkerClusterer(this.map, this.markers, mcOptions);
            /**Set fitbounds**/
            this.map.fitBounds(bounds);

            /**Close info window**/
            google.maps.event.addListener(this.map, "click", function() {
                self.infowindow.close();
            });
        },
        setMapBounds: function(){
            var bounds =  this.map.getBounds();
            this.mapBounds = {
                'ne_lat': bounds.getNorthEast().lat(),
                'ne_lng': bounds.getNorthEast().lng(),
                'sw_lat': bounds.getSouthWest().lat(),
                'sw_lng': bounds.getSouthWest().lng()
            };
        },
        getInfoWindowContent: function (info) {
            return (
                '<div class="map-marker-info-popup" onclick="window.open(\''+info.redirect_url+'\')">'+
                    '<div class="card-image">'+
                      '<img src="'+info.feature_image+'" alt="Feature image" onerror="this.src=\'https://cdn.stays.io/rental-property-images/bedroomvillas/images/no_image_available.png\'">'+
                      '<span class="map-marker-price-section">From '+ info.formatted_price +'</span>'+
                    '</div>'+
                    '<div class="card-content">'+
                        info.property_name +
                    '</div>'+
                 '</div>'
            );
        }
    },
    watch: {
        changeTrack: function(){
            this.initMap();
            this.setMarker();
        },
        selectedTiles: function(){
            for(var i = 0; i < this.mapItems.length; i++){
                if(this.mapItems[i].id == this.selectedTiles){
                    this.infowindow.close();
                    this.infowindow.setContent(this.getInfoWindowContent(this.mapItems[i]));
                    this.infowindow.open(this.map, this.markers[i]);
                }
            }
        }
    },
    template: '<div id="map" style="width: 100%;height: 100%"></div>'
});
