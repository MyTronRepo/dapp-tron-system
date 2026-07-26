import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getDocumentById,
  uploadDocument
} from "../../services/documentService";


function DocumentDetails() {

  const { documentId } = useParams();

  const [document, setDocument] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  const loadDocument = async () => {

    try {

      const response =
        await getDocumentById(documentId);

      setDocument(response.data);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Failed to load document"
      );

    }

  };


  useEffect(() => {

    loadDocument();

  }, [documentId]);



  const handleUpload = async () => {

    try {

      if (!file) {
        return;
      }


      const response =
        await uploadDocument(
          documentId,
          file
        );


      setMessage(
        "File uploaded successfully"
      );


      setDocument(
        response.data
      );


    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Upload failed"
      );

    }

  };



  if (error) {
    return <h2>{error}</h2>;
  }


  if (!document) {
    return <h2>Loading...</h2>;
  }



  return (
    <div>

      <h1>Document Details</h1>


      <table border="1">

        <tbody>

          <tr>
            <td>ID</td>
            <td>{document.documentId}</td>
          </tr>


          <tr>
            <td>Name</td>
            <td>{document.documentName}</td>
          </tr>


          <tr>
            <td>Type</td>
            <td>{document.documentType}</td>
          </tr>


          <tr>
            <td>Property ID</td>
            <td>{document.propertyId}</td>
          </tr>


          <tr>
            <td>Uploaded By</td>
            <td>{document.uploadedBy}</td>
          </tr>


          <tr>
            <td>Status</td>
            <td>{document.status}</td>
          </tr>


          <tr>
            <td>File Hash</td>
            <td>
  {document.fileHash
    ? `${document.fileHash.substring(0,25)}...`
    : "Not generated"}
</td>
          </tr>


          <tr>
            <td>IPFS URI</td>
            <td>{document.documentURI}</td>
          </tr>

<tr>
  <td>File</td>

  <td>
    {document.ipfsCID ? (
      <a
        href={`https://ipfs.io/ipfs/${document.ipfsCID}`}
        target="_blank"
        rel="noreferrer"
      >
        View File on IPFS
      </a>
    ) : (
      "No file available"
    )}
  </td>

</tr>

          <tr>
            <td>Created At</td>
            <td>{document.createdAt}</td>
          </tr>

        </tbody>

      </table>


      <h2>Upload File</h2>


      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />


      <button
        onClick={handleUpload}
      >
        Upload
      </button>


      {message &&
        <h3>{message}</h3>
      }


    </div>
  );
}


export default DocumentDetails;