import { useState } from "react";

import { registerProperty } from "../../services/propertyService";

import { registerPropertyOnBlockchain } from "../../services/tronService";


function CreateProperty() {

  const [form, setForm] = useState({

    province: "",
    city: "",
    district: "",
    parcelNumber: "",
    area: "",
    buildYear: "",
    usageType: "",
    constructionStatus: "",
    latitude: "",
    longitude: "",

    owners: [
      {
        walletAddress: "",
        nationalIdHash: "",
        share: ""
      }
    ]

  });


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  const handleOwnerChange = (index, e) => {

    const owners = [...form.owners];

    owners[index][e.target.name] =
      e.target.value;

    setForm({
      ...form,
      owners
    });

  };


  const addOwner = () => {

    setForm({

      ...form,

      owners: [

        ...form.owners,

        {
          walletAddress: "",
          nationalIdHash: "",
          share: ""
        }

      ]

    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      // =========================================
      // 1. PREPARE PROPERTY DATA
      // =========================================

      const propertyData = {

        ...form,

        area: Number(form.area),

        buildYear: Number(form.buildYear),

        latitude: Number(form.latitude),

        longitude: Number(form.longitude),

        owners: form.owners.map((owner) => ({

          ...owner,

          share: Number(owner.share)

        }))

      };


      console.log(
        "REGISTERING PROPERTY IN BACKEND..."
      );


      // =========================================
      // 2. REGISTER IN BACKEND / MONGODB
      // =========================================

      const backendResponse =
        await registerProperty(propertyData);


      console.log(
        "BACKEND PROPERTY RESPONSE:",
        backendResponse
      );


      // =========================================
      // 3. GET REAL PROPERTY ID
      // =========================================

      const propertyId =
        backendResponse?.property?.propertyId ||
        backendResponse?.data?.property?.propertyId ||
        backendResponse?.propertyId ||
        backendResponse?.data?.propertyId;


      if (!propertyId) {

        throw new Error(
          "Property registered in backend, but Property ID was not returned."
        );

      }


      console.log(
        "PROPERTY ID:",
        propertyId
      );


      // =========================================
      // 4. REGISTER PROPERTY ON BLOCKCHAIN
      // =========================================

      console.log(
        "REGISTERING PROPERTY ON BLOCKCHAIN..."
      );


      const blockchainResult =
        await registerPropertyOnBlockchain({

          propertyId,

          province: form.province,

          city: form.city,

          district: form.district,

          parcelNumber: form.parcelNumber,

          area: Number(form.area),

          buildYear: Number(form.buildYear),

          usageType: form.usageType,

          constructionStatus:
            form.constructionStatus,

          latitude: Number(form.latitude),

          longitude: Number(form.longitude)

        });


      console.log(
        "BLOCKCHAIN PROPERTY RESULT:",
        blockchainResult
      );


      // =========================================
      // 5. SUCCESS
      // =========================================

      alert(

        "Property registered successfully.\n\n" +

        `Property ID:\n${propertyId}\n\n` +

        `Blockchain TXID:\n${blockchainResult.transactionId}`

      );


    } catch (error) {

      console.error(
        "PROPERTY REGISTRATION ERROR:",
        error
      );


      alert(

        error?.response?.data?.message ||

        error?.message ||

        "Registration failed"

      );

    }

  };


  return (

    <div>

      <h1>Create Property</h1>


      <form onSubmit={handleSubmit}>


        <input
          name="province"
          placeholder="Province"
          value={form.province}
          onChange={handleChange}
        />


        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />


        <input
          name="district"
          placeholder="District"
          value={form.district}
          onChange={handleChange}
        />


        <input
          name="parcelNumber"
          placeholder="Parcel Number"
          value={form.parcelNumber}
          onChange={handleChange}
        />


        <input
          name="area"
          placeholder="Area"
          value={form.area}
          onChange={handleChange}
        />


        <input
          name="buildYear"
          placeholder="Build Year"
          value={form.buildYear}
          onChange={handleChange}
        />


        <input
          name="usageType"
          placeholder="Usage Type"
          value={form.usageType}
          onChange={handleChange}
        />


        <input
          name="constructionStatus"
          placeholder="Construction Status"
          value={form.constructionStatus}
          onChange={handleChange}
        />


        <input
          name="latitude"
          placeholder="Latitude"
          value={form.latitude}
          onChange={handleChange}
        />


        <input
          name="longitude"
          placeholder="Longitude"
          value={form.longitude}
          onChange={handleChange}
        />


        <h2>Owners</h2>


        {form.owners.map((owner, index) => (

          <div key={index}>

            <input
              name="walletAddress"
              placeholder="Wallet Address"
              value={owner.walletAddress}
              onChange={(e) =>
                handleOwnerChange(index, e)
              }
            />


            <input
              name="nationalIdHash"
              placeholder="National ID Hash"
              value={owner.nationalIdHash}
              onChange={(e) =>
                handleOwnerChange(index, e)
              }
            />


            <input
              name="share"
              placeholder="Share"
              value={owner.share}
              onChange={(e) =>
                handleOwnerChange(index, e)
              }
            />

          </div>

        ))}


        <button
          type="button"
          onClick={addOwner}
        >
          Add Owner
        </button>


        <button type="submit">
          Create
        </button>


      </form>

    </div>

  );

}


export default CreateProperty;