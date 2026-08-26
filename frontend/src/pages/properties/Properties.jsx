import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProperties } from "../../services/propertyService";
import {
  getPropertyIdsFromBlockchain,
} from "../../services/contractService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [blockchainIds, setBlockchainIds] = useState([]);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [blockchainError, setBlockchainError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getProperties();

        setProperties(response.data);
      } catch (err) {
        console.error("Failed to load properties:", err);
        setError("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleReadBlockchain = async () => {
    setBlockchainLoading(true);
    setBlockchainError("");

    try {
      const ids = await getPropertyIdsFromBlockchain();

      console.log("Property IDs from blockchain:", ids);

      setBlockchainIds(ids);
    } catch (err) {
      console.error(
        "Failed to read property IDs from blockchain:",
        err
      );

      setBlockchainError(
        err?.message ||
          "Failed to read property IDs from blockchain."
      );
    } finally {
      setBlockchainLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Properties</h1>

      <Link to="/properties/create">
        Create Property
      </Link>

      <hr />

      <section>
        <h2>Blockchain Test</h2>

        <button
          onClick={handleReadBlockchain}
          disabled={blockchainLoading}
        >
          {blockchainLoading
            ? "Reading Blockchain..."
            : "Read Property IDs from Blockchain"}
        </button>

        {blockchainError && (
          <p>
            <strong>Error:</strong>{" "}
            {blockchainError}
          </p>
        )}

        {blockchainIds.length > 0 && (
          <div>
            <h3>Property IDs on Blockchain</h3>

            <ul>
              {blockchainIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        )}

        {!blockchainLoading &&
          !blockchainError &&
          blockchainIds.length === 0 && (
            <p>
              No property IDs returned from blockchain.
            </p>
          )}
      </section>

      <hr />

      <h2>Properties from Backend</h2>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Province</th>
            <th>City</th>
            <th>District</th>
            <th>Parcel</th>
            <th>Area</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {properties.map((property) => (
            <tr key={property.propertyId}>
              <td>{property.propertyId}</td>
              <td>{property.province}</td>
              <td>{property.city}</td>
              <td>{property.district}</td>
              <td>{property.parcelNumber}</td>
              <td>{property.area}</td>
              <td>{property.status}</td>

              <td>
                <Link
                  to={`/properties/${property.propertyId}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Properties;