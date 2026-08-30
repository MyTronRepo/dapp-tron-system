import { useState } from "react";
import { registerProperty } from "../../services/propertyService";


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

    owners[index][e.target.name] = e.target.value;

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

      await registerProperty({

        ...form,

        area: Number(form.area),

        buildYear: Number(form.buildYear),

        latitude: Number(form.latitude),

        longitude: Number(form.longitude),

        owners: form.owners.map((owner) => ({

          ...owner,

          share: Number(owner.share)

        }))

      });


      alert("Property registered");


    } catch (error) {

      alert(
        error.response?.data?.message ||
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
              onChange={(e) => handleOwnerChange(index, e)}
            />


            <input
              name="nationalIdHash"
              placeholder="National ID Hash"
              value={owner.nationalIdHash}
              onChange={(e) => handleOwnerChange(index, e)}
            />


            <input
              name="share"
              placeholder="Share"
              value={owner.share}
              onChange={(e) => handleOwnerChange(index, e)}
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
