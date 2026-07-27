import { useEffect, useState } from "react";

import { getProperties } from "../../services/propertyService";

import {
  updatePropertyStatus,
  getUsers,
  updateUserRole,
  updateUserStatus
} from "../../services/adminService";

import {
  getDashboardStatistics
} from "../../services/dashboardService";

import {
  getDocumentsByProperty,
  verifyDocument,
  rejectDocument
} from "../../services/documentService";


function Admin() {


  const [properties, setProperties] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [users, setUsers] = useState([]);

  const [statistics, setStatistics] = useState(null);



  const loadProperties = async () => {

    try {

      const response =
        await getProperties();


      const data =
        response.data || response;


      setProperties(

        data.filter(

          property =>
            property.status === "Pending"

        )

      );


    } catch(error) {

      console.log(
        error.response?.data || error.message
      );

      setProperties([]);

    }

  };




  const loadDocuments = async () => {

    try {


      const response =
        await getDocumentsByProperty();


      const data =
        response.data || response;



      setDocuments(

        data.filter(

          document =>
            document.status === "Pending"

        )

      );


    } catch(error) {


      console.log(
        error.response?.data || error.message
      );


      setDocuments([]);

    }

  };






  const loadUsers = async () => {

    try {


      const response =
        await getUsers();



      const data =
        response.data || response;



      setUsers(data);



    } catch(error) {


      console.log(
        error.response?.data || error.message
      );


      setUsers([]);

    }

  };







  const loadStatistics = async () => {


    try {


      const response =
        await getDashboardStatistics();


      setStatistics(

        response.data?.stats || {}

      );


    } catch(error) {


      console.log(
        error.response?.data || error.message
      );


      setStatistics(null);

    }


  };








  useEffect(()=>{


    loadProperties();

    loadDocuments();

    loadUsers();

    loadStatistics();


  },[]);









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










  const handleVerifyDocument = async(
    documentId
  )=>{


    try{


      await verifyDocument(
        documentId
      );


      setDocuments(

        documents.filter(

          document =>
            document.documentId !== documentId

        )

      );


    }catch(error){

      console.log(
        error.response?.data || error.message
      );

    }


  };








  const handleRejectDocument = async(
    documentId
  )=>{


    try{


      await rejectDocument(
        documentId
      );


      setDocuments(

        documents.filter(

          document =>
            document.documentId !== documentId

        )

      );


    }catch(error){

      console.log(
        error.response?.data || error.message
      );

    }


  };








  const handleRoleChange = async(
    userId,
    role
  )=>{


    try{


      await updateUserRole(
        userId,
        role
      );


      loadUsers();


    }catch(error){


      console.log(
        error.response?.data || error.message
      );


    }


  };








  const handleStatusChange = async(
    userId,
    status
  )=>{


    try{


      await updateUserStatus(
        userId,
        status
      );


      loadUsers();


    }catch(error){


      console.log(
        error.response?.data || error.message
      );


    }


  };











  return (

    <div>


      <h1>Admin Panel</h1>



      <h2>Admin Statistics</h2>


      {statistics && (


        <table border="1">

          <tbody>

            <tr>
              <td>Users</td>
              <td>{statistics.users}</td>
            </tr>


            <tr>
              <td>Properties</td>
              <td>{statistics.properties}</td>
            </tr>


            <tr>
              <td>Documents</td>
              <td>{statistics.documents}</td>
            </tr>


            <tr>
              <td>Transfers</td>
              <td>{statistics.transfers}</td>
            </tr>


          </tbody>


        </table>


      )}






      <h2>
        Pending Properties
      </h2>


      <table border="1">

        <tbody>


        {(properties || []).map(

          property => (


          <tr key={property.propertyId}>


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










      <h2>
        Pending Documents
      </h2>


      <table border="1">


      <tbody>


      {(documents || []).map(

        document => (


        <tr key={document.documentId}>


          <td>
            {document.documentName}
          </td>


          <td>
            {document.documentType}
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









      <h2>
        Users
      </h2>


      <table border="1">


      <tbody>


      {(users || []).map(

        user => (


        <tr key={user._id || user.walletAddress}>


          <td>
            {user.walletAddress}
          </td>


          <td>
            {user.fullName}
          </td>


          <td>


          <select

          value={user.role}

          onChange={(e) =>
            handleRoleChange(
              user._id,
              e.target.value
            )
          }

          >

          <option value="owner">
            owner
          </option>


          <option value="buyer">
            buyer
          </option>


          <option value="admin">
            admin
          </option>


          <option value="observer">
            observer
          </option>


          </select>


          </td>



          <td>


          {
            user.status === "active"

            ?

            <button

            onClick={() =>
              handleStatusChange(
                user._id,
                "blocked"
              )
            }

            >

            Block

            </button>


            :


            <button

            onClick={() =>
              handleStatusChange(
                user._id,
                "active"
              )
            }

            >

            Activate

            </button>

          }


          </td>


        </tr>


      ))}


      </tbody>


      </table>



    </div>

  );


}


export default Admin;