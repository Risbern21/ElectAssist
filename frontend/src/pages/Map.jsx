import { useState, useRef, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Search } from 'lucide-react';
import { mapApi } from '../lib/api';
import './Map.css';

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY || 'dummy_key';

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const Map = ({ center, zoom, booths }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: MAP_STYLES,
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
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        });
      });
    }
  }, [map, booths]);

  return (
    <div
      ref={ref}
      style={{ height: '100%', width: '100%' }}
      role="application"
      aria-label="Interactive polling booth map"
    />
  );
};

const render = (status) => {
  if (status === Status.LOADING) return (
    <div role="status" aria-live="polite" className="flex-center" style={{ height: '100%', padding: '2rem' }}>
      <p>Loading map...</p>
    </div>
  );
  if (status === Status.FAILURE) return (
    <div role="alert" className="flex-center" style={{ height: '100%', padding: '2rem', color: 'var(--danger)' }}>
      <p>Map failed to load. Please check your API key configuration.</p>
    </div>
  );
  return null;
};

const MapView = () => {
  const [search, setSearch] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapZoom, setMapZoom] = useState(12);
  const [booths, setBooths] = useState([]);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const data = await mapApi.getBooths();
        setBooths(data);
      } catch (err) {
        console.error('Failed to fetch booths:', err);
      }
    };
    fetchBooths();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    setSearchError('');

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: search }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        setMapCenter({ lat: location.lat(), lng: location.lng() });
        setMapZoom(14);
      } else {
        setSearchError('Location not found. Please try a different pincode or ward name.');
      }
    });
  };

  return (
    <div className="map-page container animate-fade-in">
      <div className="map-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient">Locality Map</h1>
          <p className="text-muted">Find polling booths and candidate activity near you.</p>
        </div>

        <div
          className="search-bar"
          style={{ maxWidth: '350px' }}
          role="search"
          aria-label="Search map location"
        >
          <label htmlFor="map-search" className="visually-hidden">
            Search by ward or pincode
          </label>
          <Search
            className="text-muted"
            size={20}
            onClick={handleSearch}
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
          />
          <input
            id="map-search"
            type="search"
            className="input-transparent"
            placeholder="Search ward or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Search by ward or pincode"
            aria-describedby={searchError ? 'map-search-error' : undefined}
          />
        </div>
      </div>

      {/* Search error feedback */}
      {searchError && (
        <p
          id="map-search-error"
          role="alert"
          aria-live="assertive"
          style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}
        >
          {searchError}
        </p>
      )}

      <div className="map-container glass-panel" aria-label="Map view">
        <Wrapper apiKey={MAPS_API_KEY} render={render}>
          <Map center={mapCenter} zoom={mapZoom} booths={booths} />
        </Wrapper>
      </div>

      <div className="map-legend" role="list" aria-label="Map legend">
        <div className="legend-item" role="listitem">
          <span className="legend-color bg-primary" aria-hidden="true"></span>
          <span>Your Polling Booth</span>
        </div>
        <div className="legend-item" role="listitem">
          <span className="legend-color bg-secondary" aria-hidden="true"></span>
          <span>Candidate Rally / Event</span>
        </div>
        <div className="legend-item" role="listitem">
          <span className="legend-color bg-success" aria-hidden="true"></span>
          <span>Verified Video Location</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
