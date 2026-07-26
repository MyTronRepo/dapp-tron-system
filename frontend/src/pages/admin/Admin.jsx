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

      const response = await getProperties();


      setProperties(

        response.data.filter(

          property => property.status === "Pending"

        )

      );


    } catch(error) {

      console.log(error.response?.data || error.message);

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


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };






  const loadUsers = async () => {

    try {

      const response = await getUsers();

      setUsers(response.data);


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };







  const loadStatistics = async () => {

    try {

      const response =
        await getDashboardStatistics();


      setStatistics(
        response.data
      );


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };







  useEffect(() => {

    loadProperties();

    loadDocuments();

    loadUsers();

    loadStatistics();

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

      console.log(error.response?.data || error.message);

    }

  };







  const handleVerifyDocument = async (
    documentId
  ) => {

    try {

      await verifyDocument(documentId);


      setDocuments(

        documents.filter(

          document =>
            document.documentId !== documentId

        )

      );


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };







  const handleRejectDocument = async (
    documentId
  ) => {

    try {

      await rejectDocument(documentId);


      setDocuments(

        documents.filter(

          document =>
            document.documentId !== documentId

        )

      );


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };







  const handleRoleChange = async (
    userId,
    role
  ) => {

    try {

      await updateUserRole(
        userId,
        role
      );


      loadUsers();


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };







  const handleStatusChange = async (
    userId,
    status
  ) => {

    try {

      await updateUserStatus(
        userId,
        status
      );


      loadUsers();


    } catch(error) {

      console.log(error.response?.data || error.message);

    }

  };








  return (

    <div>


      <h1>Admin Panel</h1>





      <h2>Admin Statistics</h2>


      {statistics && (

        <table border="1">

          <thead>

            <tr>

              <th>Total Users</th>

              <th>Total Properties</th>

              <th>Total Documents</th>

              <th>Total Transfers</th>

              <th>Pending Transfers</th>

              <th>Approved Transfers</th>

              <th>Verified Documents</th>

              <th>Pending Documents</th>

            </tr>

          </thead>


          <tbody>

            <tr>

              <td>{statistics.users}</td>

              <td>{statistics.properties}</td>

              <td>{statistics.documents}</td>

              <td>{statistics.transfers}</td>

              <td>{statistics.pendingTransfers}</td>

              <td>{statistics.approvedTransfers}</td>

              <td>{statistics.verifiedDocuments}</td>

              <td>{statistics.pendingDocuments}</td>

            </tr>

          </tbody>

        </table>

      )}







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


              <td>{property.propertyId}</td>

              <td>{property.city}</td>

              <td>{property.status}</td>


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


              <td>{document.documentId}</td>

              <td>{document.documentName}</td>

              <td>{document.documentType}</td>

              <td>{document.status}</td>


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

            <th>Actions</th>

          </tr>

        </thead>


        <tbody>


          {users.map((user)=>(

            <tr key={user.walletAddress}>


              <td>{user.walletAddress}</td>

              <td>{user.fullName}</td>


              <td>

                <select

                  value={user.role}

                  onChange={(e)=>
                    handleRoleChange(
                      user._id,
                      e.target.value
                    )
                  }

                >

                  <option value="owner">owner</option>

                  <option value="buyer">buyer</option>

                  <option value="admin">admin</option>

                  <option value="observer">observer</option>

                </select>


              </td>


              <td>{user.status}</td>


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