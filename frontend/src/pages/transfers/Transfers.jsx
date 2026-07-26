import { useEffect, useState } from "react";
import {
  getTransfers,
  createTransfer,
  approveTransferByBuyer,
  approveTransferByAdmin
} from "../../services/transferService";

import { getProperties } from "../../services/propertyService";


function Transfers() {


  const [transfers, setTransfers] = useState([]);

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);


  const [form, setForm] = useState({

    propertyId: "",

    buyer: "",

    transferredShare: ""

  });






  useEffect(() => {


    const storedUser =
      JSON.parse(
        localStorage.getItem("user")
      );


    setUser(storedUser);


    loadTransfers();

    loadProperties();


  }, []);







  const loadTransfers = async () => {

    try {

      setLoading(true);


      const response =
        await getTransfers();


      setTransfers(
        response.data || []
      );


    } catch(error) {


      console.log(
        error.response?.data ||
        error.message
      );


    }
    finally {

      setLoading(false);

    }

  };








  const loadProperties = async () => {

    try {


      const response =
        await getProperties();


      setProperties(

        response.data.filter(

          property =>
            property.status === "Verified"

        )

      );


    }
    catch(error) {


      console.log(

        error.response?.data ||
        error.message

      );


    }

  };









  const handleCreate = async () => {


    try {


      await createTransfer({

        propertyId:
          form.propertyId,


        buyer:
          form.buyer,


        transferredShare:
          Number(
            form.transferredShare
          )

      });




      setForm({

        propertyId:"",

        buyer:"",

        transferredShare:""

      });




      await loadTransfers();



    }
    catch(error) {


      console.log(

        error.response?.data ||
        error.message

      );


    }


  };









  const handleBuyerApprove = async (transferId) => {


    try {


      await approveTransferByBuyer(

        transferId

      );


      await loadTransfers();



    }
    catch(error) {


      console.log(

        error.response?.data ||
        error.message

      );


    }


  };









  const handleAdminApprove = async (transferId) => {


    try {


      await approveTransferByAdmin(

        transferId

      );


      await loadTransfers();



    }
    catch(error) {


      console.log(

        error.response?.data ||
        error.message

      );


    }


  };









  return (

    <div>


      <h1>
        Transfers
      </h1>







      {
  user && user.role?.toLowerCase() === "owner" && (

          <>

            <h2>
              Create Transfer
            </h2>





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

              value={
                form.buyer
              }

              onChange={(e)=>

                setForm({

                  ...form,

                  buyer:
                    e.target.value

                })

              }

            />







            <input

              placeholder="Share %"

              type="number"

              value={
                form.transferredShare
              }

              onChange={(e)=>

                setForm({

                  ...form,

                  transferredShare:
                    e.target.value

                })

              }

            />







            <button

              onClick={
                handleCreate
              }

            >

              Create Transfer

            </button>



          </>

        )
      }









      <h2>
        Transfers List
      </h2>







      {

        loading ? (

          <h3>
            Loading...
          </h3>


        ) : (


          <table border="1">


            <thead>


              <tr>

                <th>
                  ID
                </th>


                <th>
                  Property
                </th>


                <th>
                  Seller
                </th>


                <th>
                  Buyer
                </th>


                <th>
                  Share
                </th>


                <th>
                  Status
                </th>


                <th>
                  Actions
                </th>


              </tr>


            </thead>







            <tbody>


              {

                transfers.map(

                  (transfer)=>(


                    <tr

                      key={
                        transfer.transferId
                      }

                    >



                      <td>

                        {
                          transfer.transferId
                        }

                      </td>




                      <td>

                        {
                          transfer.propertyId
                        }

                      </td>




                      <td>

                        {
                          transfer.seller
                        }

                      </td>




                      <td>

                        {
                          transfer.buyer
                        }

                      </td>




                      <td>

                        {
                          transfer.transferredShare
                        }%

                      </td>




                      <td>

                        {
                          transfer.status
                        }

                      </td>




                      <td>





                        {
                          user?.role === "buyer" &&

                          transfer.buyer === user.walletAddress &&

                          transfer.status === "PendingBuyer" &&


                          (

                            <button

                              onClick={() =>
                                handleBuyerApprove(
                                  transfer.transferId
                                )
                              }

                            >

                              Buyer Approve

                            </button>

                          )

                        }








                        {
                          user?.role === "admin" &&

                          transfer.status === "PendingAdmin" &&


                          (

                            <button

                              onClick={() =>
                                handleAdminApprove(
                                  transfer.transferId
                                )
                              }

                            >

                              Admin Approve

                            </button>

                          )

                        }





                      </td>




                    </tr>


                  )

                )

              }



            </tbody>



          </table>


        )

      }





    </div>

  );


}


export default Transfers;