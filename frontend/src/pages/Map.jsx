import { useState, useRef, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Search } from 'lucide-react';
import { mapApi } from '../lib/api';
import './Map.css';

// In a real app, you'd use your actual GCP maps key from env
const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY || 'dummy_key';

const Map = ({ center, zoom, booths }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureOf: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ],
      }));
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (map && booths && booths.length > 0) {
      booths.forEach(booth => {
        new window.google.maps.Marker({
          position: { lat: booth.lat, lng: booth.lng },
          map: map,
          title: booth.name,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
      });
    }
  }, [map, booths]);

  return <div ref={ref} style={{ height: '100%', width: '100%' }} />;
};

const render = (status) => {
  if (status === Status.LOADING) return <div className="text-center p-4">Loading Map...</div>;
  if (status === Status.FAILURE) return <div className="text-center p-4">Error loading map. Check API Key.</div>;
  return null;
};

const MapView = () => {
  const [search, setSearch] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);
  const [booths, setBooths] = useState([]);

  useEffect(() => {
    const fetchBooths = async () => {
      const data = await mapApi.getBooths();
      setBooths(data);
    };
    fetchBooths();
  }, []);

  const handleSearch = () => {
    if (!search) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: search }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        setMapCenter({
          lat: location.lat(),
          lng: location.lng()
        });
        setMapZoom(14); // Zoom in on search result
      } else {
        alert('Location not found. Please try a different pincode or ward.');
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="map-page container animate-fade-in">
      <div className="map-header flex-between" style={{marginBottom: '2rem'}}>
         <div>
            <h1 className="text-gradient">Locality Map</h1>
            <p className="text-muted">Find polling booths and candidate activity near you.</p>
         </div>
         
         <div className="search-bar" style={{maxWidth: '350px'}}>
            <Search className="text-muted" size={20} onClick={handleSearch} style={{ cursor: 'pointer' }} />
            <input 
              type="text" 
              className="input-transparent" 
              placeholder="Search ward or pincode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
            />
         </div>
      </div>

      <div className="map-container glass-panel">
         <Wrapper apiKey={MAPS_API_KEY} render={render}>
            <Map center={mapCenter} zoom={mapZoom} booths={booths} />
         </Wrapper>
      </div>

      <div className="map-legend">
         <div className="legend-item">
            <span className="legend-color bg-primary"></span>
            <span>Your Polling Booth</span>
         </div>
         <div className="legend-item">
            <span className="legend-color bg-secondary"></span>
            <span>Candidate Rally/Event</span>
         </div>
         <div className="legend-item">
            <span className="legend-color bg-success"></span>
            <span>Verified Video location</span>
         </div>
      </div>
    </div>
  );
};

export default MapView;
