import { useEffect, useState } from "react";

import {
  getTransfers,
  approveTransferByBuyer,
  approveTransferByAdmin
} from "../../services/transferService";

import {
  createTransferRequest,
  getTransferRequest,
  getTransferCounter,
  checkTransaction,
  checkBlockchainOwners,
  getOwners,
  getProperty,
  getPropertyIds
} from "../../services/tronService";

import { getProperties } from "../../services/propertyService";


function Transfers() {

  const [transfers, setTransfers] = useState([]);

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);

  const [blockchainTransferId, setBlockchainTransferId] = useState(null);


  const [form, setForm] = useState({
    propertyId: "",
    buyer: "",
    transferredShare: ""
  });


  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {

    const storedUser =
      JSON.parse(
        localStorage.getItem("user")
      );

    setUser(storedUser);

    loadTransfers();

    loadProperties();

  }, []);


  // ==============================
  // LOAD TRANSFERS
  // ==============================

  const loadTransfers = async () => {

    try {

      setLoading(true);

      const response =
        await getTransfers();

      setTransfers(
        response.data || []
      );

    }
    catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

    }
    finally {

      setLoading(false);

    }

  };


  // ==============================
  // LOAD PROPERTIES
  // ==============================

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
    catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

    }

  };


  // ==============================
  // CREATE TRANSFER
  // OWNER → BLOCKCHAIN
  // ==============================

  const handleCreate = async () => {

    try {

      if (!form.propertyId) {

        throw new Error(
          "Property ID is required"
        );

      }


      if (!form.buyer) {

        throw new Error(
          "Buyer wallet is required"
        );

      }


      if (
        !form.transferredShare ||
        Number(form.transferredShare) <= 0
      ) {

        throw new Error(
          "Transferred share must be greater than 0"
        );

      }


      if (
        Number(form.transferredShare) > 100
      ) {

        throw new Error(
          "Transferred share cannot exceed 100"
        );

      }


      console.log(
        "STARTING BLOCKCHAIN TRANSFER REQUEST..."
      );


      const result =
        await createTransferRequest(
          form.propertyId,
          form.buyer,
          Number(form.transferredShare)
        );


      console.log(
  "BLOCKCHAIN TRANSFER REQUEST SUCCESS:",
  result
);

const transferId = await getTransferCounter();

console.log(
  "NEW BLOCKCHAIN TRANSFER ID:",
  transferId
);

setBlockchainTransferId(transferId);

alert(
  `Transfer request submitted successfully.\n\n` +
  `Blockchain Transfer ID: ${transferId}\n\n` +
  `TXID:\n${result.transactionId}`
);

      setForm({
        propertyId: "",
        buyer: "",
        transferredShare: ""
      });

    }
    catch (error) {

      console.error(
        "BLOCKCHAIN TRANSFER REQUEST ERROR:",
        error
      );


      alert(
        error?.message ||
        "Failed to create transfer request on blockchain"
      );

    }

  };


  // ==============================
  // CHECK BLOCKCHAIN TRANSFER
  // ==============================

  const testBlockchainTransfer = async () => {
  try {

    console.log(
      "CHECKING PREVIOUS TRANSACTION..."
    );

   const txid =
  "6f15ee9ae79f9e35bb187269768e99d99d895b18d7a930f70858acfa2b2273f7";

    const result =
      await checkTransaction(txid);

    console.log(
      "FINAL TRANSACTION CHECK:",
      result
    );

    alert(
      JSON.stringify(
        result,
        null,
        2
      )
    );

  } catch (error) {

    console.error(
      "TRANSACTION CHECK ERROR:",
      error
    );

    alert(
      error?.message ||
      "Failed to check transaction"
    );
  }
};

  // ==============================
  // CHECK BLOCKCHAIN OWNERS
  // ==============================

  
const testBlockchainOwners = async () => {
    try {
        const propertyId =
            "01ad0123-ce34-4b75-954f-e36079194d84";

        console.log(
            "READING OWNERS FROM BLOCKCHAIN..."
        );

        const owners =
            await getOwners(propertyId);

        console.log(
            "BLOCKCHAIN OWNERS:",
            owners
        );

        alert(
            JSON.stringify(
                owners,
                (_, value) =>
                    typeof value === "bigint"
                        ? value.toString()
                        : value,
                2
            )
        );
    }
    catch (error) {
        console.error(
            "BLOCKCHAIN OWNERS READ ERROR:",
            error
        );

        alert(
            error?.message ||
            "Failed to read owners from blockchain"
        );
    }
};

  // ==============================
  // TEST BLOCKCHAIN PROPERTY IDS
  // ==============================

  const testBlockchainProperties = async () => {

    try {

      console.log(
        "READING PROPERTY IDS FROM BLOCKCHAIN..."
      );


      const propertyIds =
        await getPropertyIds();


      console.log(
        "BLOCKCHAIN PROPERTY IDS:",
        propertyIds
      );


      alert(
        JSON.stringify(
          propertyIds,
          null,
          2
        )
      );

    }
    catch (error) {

      console.error(
        "BLOCKCHAIN PROPERTY IDS READ ERROR:",
        error
      );


      alert(
        error?.message ||
        "Failed to read property IDs"
      );

    }

  };


  // ==============================
  // TEST BLOCKCHAIN PROPERTY
  // ==============================

  const testBlockchainProperty = async () => {

    try {

      const propertyId =
        "6154063f-aad6-4288-ba5f-98b4eeabbd4c";


      console.log(
        "READING PROPERTY FROM BLOCKCHAIN..."
      );


      const property =
        await getProperty(propertyId);


      console.log(
        "BLOCKCHAIN PROPERTY RESULT:",
        property
      );


      alert(
        JSON.stringify(
          property,
          null,
          2
        )
      );

    }
    catch (error) {

      console.error(
        "BLOCKCHAIN PROPERTY READ ERROR:",
        error
      );


      alert(
        error?.message ||
        "Failed to read property from blockchain"
      );

    }

  };


  // ==============================
  // BUYER APPROVAL
  // ==============================

  const handleBuyerApprove = async (
    transferId
  ) => {

    try {

      await approveTransferByBuyer(
        transferId
      );

      await loadTransfers();

    }
    catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

    }

  };


  // ==============================
  // ADMIN APPROVAL
  // ==============================

  const handleAdminApprove = async (
    transferId
  ) => {

    try {

      await approveTransferByAdmin(
        transferId
      );

      await loadTransfers();

    }
    catch (error) {

      console.log(
        error.response?.data ||
        error.message
      );

    }

  };


  // ==============================
  // RENDER
  // ==============================

  return (

    <div>

      <h1>
        Transfers
      </h1>


      {
        user &&
        user.role?.toLowerCase() === "owner" && (

          <>

            <h2>
              Create Transfer
            </h2>


            <input
              placeholder="Property ID"
              value={
                form.propertyId
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  propertyId:
                    e.target.value
                })
              }
            />


            <input
              placeholder="Buyer Wallet"
              value={
                form.buyer
              }
              onChange={(e) =>
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
              onChange={(e) =>
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


            <button
              onClick={
                testBlockchainTransfer
              }
            >
              Check Blockchain Transfer
            </button>


            <button
              onClick={
                testBlockchainOwners
              }
            >
              Check Blockchain Owners
            </button>


            <button
              onClick={
                testBlockchainProperties
              }
            >
              Read Blockchain Properties
            </button>


            <button
              onClick={
                testBlockchainProperty
              }
            >
              Read Blockchain Property
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
                  (transfer) => (

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

                          transfer.buyer ===
                            user.walletAddress &&

                          transfer.status ===
                            "PendingBuyer" && (

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

                          transfer.status ===
                            "PendingAdmin" && (

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