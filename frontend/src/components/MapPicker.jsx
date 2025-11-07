import { useEffect, useRef, useState } from 'react';

// MapPicker: If VITE_GOOGLE_MAPS_API_KEY is provided it will render a Google Map
// allowing the user to click to set a marker. If no API key, falls back to a
// simple address input.
const MapPicker = ({ value, onChange }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [address, setAddress] = useState(value?.address || '');

  useEffect(() => {
    if (!apiKey) return;

    const existing = document.getElementById('gmaps-script');
    if (!window.google && !existing) {
      const script = document.createElement('script');
      script.id = 'gmaps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if (window.google) {
      initMap();
    }

    function initMap() {
      const { google } = window;
      if (!google) return;

      const initialPos = value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : { lat: 19.075983, lng: 72.877655 };

      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: initialPos,
        zoom: 12,
      });

      const marker = new google.maps.Marker({
        position: initialPos,
        map: mapRef.current,
        draggable: true,
      });

      // click to set marker
      mapRef.current.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        if (onChange) onChange({ address: '', lat, lng });
      });

      // dragend to update
      marker.addListener('dragend', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        if (onChange) onChange({ address: '', lat, lng });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    setAddress(value?.address || '');
  }, [value]);

  if (!apiKey) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">Event Venue</label>
        <input
          type="text"
          className="input"
          placeholder="Enter venue address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (onChange) onChange({ address: e.target.value, lat: null, lng: null });
          }}
        />
        <p className="text-xs text-gray-500 mt-1">No Google Maps API key found. Enter an address manually or set VITE_GOOGLE_MAPS_API_KEY.</p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Pin Event Venue</label>
      <div ref={mapContainerRef} style={{ width: '100%', height: 300 }} className="rounded" />
    </div>
  );
};

export default MapPicker;
