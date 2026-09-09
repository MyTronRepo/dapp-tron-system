import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../../services/propertyService";


function PropertyDetails() {

  const { propertyId } = useParams();

  const [property, setProperty] = useState(null);
  const [owners, setOwners] = useState([]);
  const [blockchain, setBlockchain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    const fetchProperty = async () => {

      try {

        const response = await getPropertyById(propertyId);

        console.log("PROPERTY RESPONSE:", response.data);

        setProperty(response.data.property);
        setOwners(response.data.owners);
        setBlockchain(response.data.blockchain);

      } catch (err) {

        console.log(err);
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


          <h2>Basic Information</h2>


          <p>
            <strong>ID:</strong> {property.propertyId}
          </p>


          <p>
            <strong>Location:</strong>{" "}
            {property.province} -
            {property.city} -
            {property.district}
          </p>


          <p>
            <strong>Parcel Number:</strong>{" "}
            {property.parcelNumber}
          </p>


          <p>
            <strong>Area:</strong>{" "}
            {property.area}
          </p>


          <p>
            <strong>Build Year:</strong>{" "}
            {property.buildYear}
          </p>


          <p>
            <strong>Usage:</strong>{" "}
            {property.usageType}
          </p>


          <p>
            <strong>Construction Status:</strong>{" "}
            {property.constructionStatus}
          </p>


          <p>
            <strong>Status:</strong>{" "}
            {property.status}
          </p>



          <hr />



          <h2>Blockchain Information</h2>


          <p>
            <strong>Property ID:</strong>{" "}
            {property.propertyId}
          </p>



          <p>
            <strong>Blockchain Status:</strong>{" "}
            {
              blockchain?.verified
                ? "Registered on Blockchain"
                : "Waiting for Blockchain Verification"
            }
          </p>



          <p>
            <strong>Contract Address:</strong>{" "}
            {
              blockchain?.contractAddress ||
              "Not Available"
            }
          </p>



          <p>
            <strong>Transaction Hash:</strong>{" "}
            {
              blockchain?.transactionHash ||
              property.blockchainTxId ||
              "Not Available"
            }
          </p>



        </div>

      )}



      <hr />



      <h2>Owners</h2>

<div style={{ marginBottom: "15px" }}>
  <p>
    <strong>Total Owners:</strong> {owners.length}
  </p>

  <p>
    <strong>Total Ownership:</strong>{" "}
    {owners.reduce(
      (total, owner) => total + Number(owner.share || 0),
      0
    )}
    %
  </p>
</div>

<table border="1">

        <thead>

          <tr>

            <th>Wallet Address</th>
            <th>National ID Hash</th>
            <th>Share</th>

          </tr>

        </thead>



        <tbody>


          {owners.map((owner) => (

            <tr key={owner._id}>


              <td>
                {owner.walletAddress}
              </td>


              <td>
                {owner.nationalIdHash}
              </td>


              <td>
                {owner.share}%
              </td>


            </tr>

          ))}


        </tbody>


      </table>



    </div>

  );

}


export default PropertyDetails;