import { useEffect, useState } from "react";

import { getProperties } from "../../services/propertyService";
import { updatePropertyStatus, getUsers } from "../../services/adminService";

import {
  getDocumentsByProperty,
  verifyDocument,
  rejectDocument
} from "../../services/documentService";



function Admin() {


  const [properties, setProperties] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [users, setUsers] = useState([]);




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







  const loadUsers = async () => {

    try {

      const response = await getUsers();


      setUsers(

        response.data

      );


    } catch(error) {

      console.log(

        error.response?.data || error.message

      );

    }

  };







  useEffect(() => {

    loadProperties();

    loadDocuments();

    loadUsers();

  }, []);







  const changeStatus = async (

    propertyId,

    status

  ) => {


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



    } catch(error) {


      console.log(

        error.response?.data || error.message

      );


    }


  };








  const handleVerifyDocument = async (

    documentId

  ) => {


    try {


      await verifyDocument(

        documentId

      );



      setDocuments(

        documents.filter(

          document =>

            document.documentId !== documentId

        )

      );



    } catch(error) {


      console.log(

        error.response?.data || error.message

      );


    }


  };








  const handleRejectDocument = async (

    documentId

  ) => {


    try {


      await rejectDocument(

        documentId

      );



      setDocuments(

        documents.filter(

          document =>

            document.documentId !== documentId

        )

      );



    } catch(error) {


      console.log(

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

            <th>Actions</th>


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





                <button

                  onClick={() =>

                    handleRejectDocument(

                      document.documentId

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








      <h2>Users</h2>




      <table border="1">


        <thead>


          <tr>


            <th>Wallet</th>

            <th>Name</th>

            <th>Role</th>

            <th>Status</th>


          </tr>


        </thead>





        <tbody>



          {users.map((user)=>(



            <tr key={user.walletAddress}>


              <td>

                {user.walletAddress}

              </td>



              <td>

                {user.fullName}

              </td>



              <td>

                {user.role}

              </td>



              <td>

                {user.status}

              </td>



            </tr>



          ))}



        </tbody>


      </table>



    </div>


  );


}



export default Admin;