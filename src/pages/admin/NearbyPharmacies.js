import { useEffect, useState } from "react";
import axios from "../../services/api";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function NearbyPharmacies() {
  const { patientId } = useParams();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await axios.get(`/admin/pharmacies/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setPharmacies(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load pharmacies");
      }
      setLoading(false);
    };

    fetchPharmacies();
  }, [patientId]);

  return (
    <div className="container mt-4">
      <h4 className="text-primary mb-3">📍 Nearby Pharmacies</h4>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : pharmacies.length === 0 ? (
        <div className="alert alert-warning">No pharmacies found near this patient.</div>
      ) : (
        <ul className="list-group">
          {pharmacies.map((pharmacy, i) => (
            <li key={i} className="list-group-item">
              <strong>{pharmacy.name}</strong>
              <br />
              {pharmacy.vicinity}
              {pharmacy.rating && (
                <span className="badge bg-success ms-2">
                  ⭐ {pharmacy.rating}
                </span>
              )}
              {pharmacy.opening_hours?.open_now !== undefined && (
                <span
                  className={`badge ms-2 ${
                    pharmacy.opening_hours.open_now ? "bg-success" : "bg-danger"
                  }`}
                >
                  {pharmacy.opening_hours.open_now ? "Open" : "Closed"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NearbyPharmacies;
