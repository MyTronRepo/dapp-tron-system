import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProperties } from "../../services/propertyService";

import {
  getPropertyIdsFromBlockchain,
  getPropertyFromBlockchain,
} from "../../services/contractService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [blockchainProperties, setBlockchainProperties] = useState([]);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [blockchainError, setBlockchainError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getProperties();

        setProperties(response.data || []);
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
    setBlockchainProperties([]);

    try {
      const ids = await getPropertyIdsFromBlockchain();

      console.log("Property IDs from blockchain:", ids);

      if (!ids || ids.length === 0) {
        setBlockchainProperties([]);
        return;
      }

      const propertyResults = await Promise.all(
        ids.map(async (propertyId) => {
          try {
            const property =
              await getPropertyFromBlockchain(propertyId);

            return {
              propertyId,
              property,
              error: null,
            };
          } catch (error) {
            console.error(
              `Failed to read property ${propertyId}:`,
              error
            );

            return {
              propertyId,
              property: null,
              error:
                error?.message ||
                "Failed to read property.",
            };
          }
        })
      );

      console.log(
        "Properties from blockchain:",
        propertyResults
      );

      setBlockchainProperties(propertyResults);
    } catch (err) {
      console.error(
        "Failed to read properties from blockchain:",
        err
      );

      setBlockchainError(
        err?.message ||
          "Failed to read properties from blockchain."
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
        <h2>Blockchain Properties</h2>

        <button
          onClick={handleReadBlockchain}
          disabled={blockchainLoading}
        >
          {blockchainLoading
            ? "Reading Blockchain..."
            : "Read Properties from Blockchain"}
        </button>

        {blockchainError && (
          <p>
            <strong>Error:</strong>{" "}
            {blockchainError}
          </p>
        )}

        {!blockchainLoading &&
          !blockchainError &&
          blockchainProperties.length === 0 && (
            <p>
              No properties found on the blockchain.
            </p>
          )}

        {blockchainProperties.length > 0 && (
          <table border="1">
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Province</th>
                <th>City</th>
                <th>District</th>
                <th>Parcel</th>
                <th>Area</th>
                <th>Build Year</th>
                <th>Usage Type</th>
                <th>Construction Status</th>
                <th>Status</th>
                <th>Exists</th>
              </tr>
            </thead>

            <tbody>
              {blockchainProperties.map(
                ({ propertyId, property, error }) => {
                  if (error) {
                    return (
                      <tr key={propertyId}>
                        <td>{propertyId}</td>
                        <td colSpan="10">
                          {error}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={propertyId}>
                      <td>
                        {property?.propertyId || propertyId}
                      </td>

                      <td>
                        {property?.province || "-"}
                      </td>

                      <td>
                        {property?.city || "-"}
                      </td>

                      <td>
                        {property?.district || "-"}
                      </td>

                      <td>
                        {property?.parcelNumber || "-"}
                      </td>

                      <td>
                        {property?.area?.toString?.() ||
                          property?.area ||
                          "-"}
                      </td>

                      <td>
                        {property?.buildYear?.toString?.() ||
                          property?.buildYear ||
                          "-"}
                      </td>

                      <td>
                        {property?.usageType || "-"}
                      </td>

                      <td>
                        {property?.constructionStatus || "-"}
                      </td>

                      <td>
                        {property?.status?.toString?.() ||
                          property?.status ||
                          "-"}
                      </td>

                      <td>
                        {property?.exists ? "Yes" : "No"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </section>

      <hr />

      <section>
        <h2>Properties from Backend</h2>

        {properties.length === 0 ? (
          <p>No properties found in backend.</p>
        ) : (
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
        )}
      </section>
    </div>
  );
}

export default Properties;
