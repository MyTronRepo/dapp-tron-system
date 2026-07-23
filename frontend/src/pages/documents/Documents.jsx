import { useState } from "react";
import { Link } from "react-router-dom";
import { getDocumentsByProperty } from "../../services/documentService";


function Documents() {

  const [propertyId, setPropertyId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const searchDocuments = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getDocumentsByProperty(propertyId);

      setDocuments(response.data);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Failed to load documents"
      );

    } finally {

      setLoading(false);

    }

  };


  return (
    <div>

      <h1>Documents</h1>


      <input
        type="text"
        placeholder="Property ID"
        value={propertyId}
        onChange={(e) =>
          setPropertyId(e.target.value)
        }
      />


      <button
        onClick={searchDocuments}
      >
        Search
      </button>


      {loading &&
        <h3>Loading...</h3>
      }


      {error &&
        <h3>{error}</h3>
      }



      <table border="1">

        <thead>

          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Uploaded By</th>
            <th>Status</th>
            <th>IPFS</th>
            <th>Actions</th>
          </tr>

        </thead>


        <tbody>

          {documents.map((document) => (

            <tr key={document.documentId}>


              <td>
                {document.documentId}
              </td>


              <td>
                {document.documentName}
              </td>


              <td>
                {document.documentType}
              </td>


              <td>
                {document.uploadedBy}
              </td>


              <td>
                {document.status}
              </td>


              <td>
                {document.documentURI}
              </td>


              <td>

                <Link
                  to={`/documents/${document.documentId}`}
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


export default Documents;