/* eslint-disable */

export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1Ijoidml2ZWstdnQiLCJhIjoiY2tjZzZheDRkMGNmcTM0cXF4bmU3emJrayJ9.Tz4anhAybfMOPkAKi5-_QQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add Marker
        new mapboxgl.Marker({
            element: el,
            // anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);

        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

        // Extends map bounds to include current location.
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });

}