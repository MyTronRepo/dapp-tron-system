import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../../services/propertyService";


function PropertyDetails() {

  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const fetchProperty = async () => {

      try {

        const response = await getPropertyById(propertyId);

        setProperty(response.data.property);

        setOwners(response.data.owners);


      } catch (err) {

        setError("Failed to load property");

      } finally {

        setLoading(false);

      }

    };


    fetchProperty();

  }, [propertyId]);



  if (loading) {
    return <h2>Loading...</h2>;
  }


  if (error) {
    return <h2>{error}</h2>;
  }



  return (

    <div>

      <h1>Property Details</h1>


      {property && (

        <div>

          <p>ID: {property.propertyId}</p>

          <p>
            Location:
            {property.province} -
            {property.city} -
            {property.district}
          </p>

          <p>
            Parcel:
            {property.parcelNumber}
          </p>

          <p>
            Area:
            {property.area}
          </p>

          <p>
            Build Year:
            {property.buildYear}
          </p>

          <p>
            Usage:
            {property.usageType}
          </p>

          <p>
            Status:
            {property.status}
          </p>


        </div>

      )}



      <h2>Owners</h2>


      <table border="1">

        <thead>

          <tr>
            <th>Wallet</th>
            <th>National Hash</th>
            <th>Share</th>
          </tr>

        </thead>


        <tbody>

          {owners.map((owner) => (

            <tr key={owner._id}>

              <td>{owner.walletAddress}</td>

              <td>{owner.nationalIdHash}</td>

              <td>{owner.share}%</td>

            </tr>

          ))}

        </tbody>

      </table>


    </div>

  );

}


export default PropertyDetails;