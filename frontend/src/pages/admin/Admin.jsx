import { useEffect, useState } from "react";

import { getProperties } from "../../services/propertyService";
import { updatePropertyStatus } from "../../services/adminService";

import {
  getDocumentsByProperty,
  verifyDocument
} from "../../services/documentService";


function Admin() {

  const [properties, setProperties] = useState([]);
  const [documents, setDocuments] = useState([]);



  const loadProperties = async () => {

    try {

      const response = await getProperties();

      setProperties(
        response.data.filter(
          property => property.status === "Pending"
        )
      );

    } catch (error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };



  const loadDocuments = async () => {

    try {

      const response =
        await getDocumentsByProperty(
          "946daab0-a6f5-4c12-862b-89c19e81179b"
        );


      setDocuments(
        response.data.filter(
          document => document.status === "Pending"
        )
      );


    } catch (error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };



  useEffect(() => {

    loadProperties();
    loadDocuments();

  }, []);




  const changeStatus = async (propertyId, status) => {

    try {

      await updatePropertyStatus(
        propertyId,
        status
      );

      setProperties(
        properties.filter(
          property =>
            property.propertyId !== propertyId
        )
      );


    } catch (error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };





  const handleVerifyDocument = async (documentId) => {

    console.log(
      "VERIFY CLICKED:",
      documentId
    );


    try {

      const result =
        await verifyDocument(
          documentId
        );


      console.log(
        "VERIFY RESULT:",
        result
      );


      setDocuments(
        documents.filter(
          document =>
            document.documentId !== documentId
        )
      );


    } catch(error) {

      console.log(
        "VERIFY ERROR:",
        error.response?.data || error.message
      );

    }

  };




  return (
    <div>

      <h1>Admin Panel</h1>


      <h2>Pending Properties</h2>


      <table border="1">

        <thead>

          <tr>
            <th>ID</th>
            <th>City</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>

        </thead>


        <tbody>

          {properties.map((property)=>(

            <tr key={property.propertyId}>

              <td>
                {property.propertyId}
              </td>

              <td>
                {property.city}
              </td>

              <td>
                {property.status}
              </td>

              <td>

                <button
                  onClick={() =>
                    changeStatus(
                      property.propertyId,
                      "Verified"
                    )
                  }
                >
                  Verify
                </button>


                <button
                  onClick={() =>
                    changeStatus(
                      property.propertyId,
                      "Rejected"
                    )
                  }
                >
                  Reject
                </button>


              </td>

            </tr>

          ))}

        </tbody>

      </table>





      <h2>Pending Documents</h2>


      <table border="1">

        <thead>

          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>

        </thead>


        <tbody>

          {documents.map((document)=>(

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
                {document.status}
              </td>


              <td>

                <button
                  onClick={() =>
                    handleVerifyDocument(
                      document.documentId
                    )
                  }
                >
                  Verify
                </button>


              </td>


            </tr>

          ))}

        </tbody>

      </table>


    </div>
  );
}


export default Admin;