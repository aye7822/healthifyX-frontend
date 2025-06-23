// src/components/LocationPicker.js
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import axios from '../../services/api';


const LocationMarker = ({ setLatLng }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLatLng({ lat, lng });
    },
  });

  return null;
};

function LocationPicker({ userId }) {
  const [latLng, setLatLng] = useState(null);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!latLng) return alert("Click on map to select location");
    try {
       await axios.patch(`/user/${userId}/location`, latLng, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("✅ Location updated!");
    } catch (err) {
      setMessage("❌ Failed to save location");
      console.error(err);
    }
  };

  return (
    <div>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latLng && (
          <Marker position={[latLng.lat, latLng.lng]} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })} />
        )}
        <LocationMarker setLatLng={setLatLng} />
      </MapContainer>

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        📍 Save Location
      </button>
      {message && <div className="mt-2 alert alert-info">{message}</div>}
    </div>
  );
}

export default LocationPicker;