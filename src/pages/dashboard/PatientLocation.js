// src/pages/profile/PatientLocation.js

import LocationPicker from "./LocationPicker";


function PatientLocation() {
  const userId = localStorage.getItem("userId"); // Must be stored after login

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-primary">🌍 Set Your Location</h3>
      <LocationPicker userId={userId} />
    </div>
  );
}

export default PatientLocation;
