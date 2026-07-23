import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProperties } from "../../services/propertyService";


function Properties() {

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const fetchProperties = async () => {

      try {

        const response = await getProperties();

        setProperties(response.data);

      } catch (err) {

        setError("Failed to load properties");

      } finally {

        setLoading(false);

      }

    };


    fetchProperties();

  }, []);



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
                <Link to={`/properties/${property.propertyId}`}>
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