import { useEffect, useState } from "react";

import {
  getTransfers,
  createTransfer,
  approveTransferByBuyer,
  approveTransferByAdmin
} from "../../services/transferService";


function Transfers() {

  const [transfers, setTransfers] = useState([]);

  const [form, setForm] = useState({
    propertyId: "",
    buyer: "",
    transferredShare: ""
  });


  const loadTransfers = async () => {

    try {

      const response =
        await getTransfers();

      setTransfers(
        response.data
      );

    } catch(error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };



  useEffect(() => {

    loadTransfers();

  }, []);




  const handleCreate = async () => {

    try {

      await createTransfer(form);

      setForm({
        propertyId: "",
        buyer: "",
        transferredShare: ""
      });

      loadTransfers();


    } catch(error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };




  const handleBuyerApprove = async (transferId) => {

    try {

      await approveTransferByBuyer(
        transferId
      );

      loadTransfers();


    } catch(error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };




  const handleAdminApprove = async (transferId) => {

    try {

      await approveTransferByAdmin(
        transferId
      );

      loadTransfers();


    } catch(error) {

      console.log(
        error.response?.data || error.message
      );

    }

  };



  return (
    <div>

      <h1>Transfers</h1>


      <h2>Create Transfer</h2>


      <input
        placeholder="Property ID"
        value={form.propertyId}
        onChange={(e)=>
          setForm({
            ...form,
            propertyId:e.target.value
          })
        }
      />


      <input
        placeholder="Buyer Wallet"
        value={form.buyer}
        onChange={(e)=>
          setForm({
            ...form,
            buyer:e.target.value
          })
        }
      />


      <input
        placeholder="Share %"
        value={form.transferredShare}
        onChange={(e)=>
          setForm({
            ...form,
            transferredShare:e.target.value
          })
        }
      />


      <button
        onClick={handleCreate}
      >
        Create
      </button>



      <h2>Transfers List</h2>


      <table border="1">

        <thead>

          <tr>
            <th>ID</th>
            <th>Property</th>
            <th>Seller</th>
            <th>Buyer</th>
            <th>Share</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>

        </thead>


        <tbody>

          {transfers.map((transfer)=>(

            <tr key={transfer.transferId}>


              <td>
                {transfer.transferId}
              </td>


              <td>
                {transfer.propertyId}
              </td>


              <td>
                {transfer.seller}
              </td>


              <td>
                {transfer.buyer}
              </td>


              <td>
                {transfer.transferredShare}
              </td>


              <td>
                {transfer.status}
              </td>


              <td>

                {transfer.status === "PendingBuyer" &&
                  <button
                    onClick={() =>
                      handleBuyerApprove(
                        transfer.transferId
                      )
                    }
                  >
                    Buyer Approve
                  </button>
                }



                {transfer.status === "PendingAdmin" &&
                  <button
                    onClick={() =>
                      handleAdminApprove(
                        transfer.transferId
                      )
                    }
                  >
                    Admin Approve
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


export default Transfers;