import { useState } from "react";
import { registerUser } from "../../services/authService";


function Register() {


  const [formData, setFormData] = useState({

    walletAddress: "",
    nationalIdHash: "",
    fullName: ""

  });



  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    try {


      const response = await registerUser(formData);


      console.log(response.data);


      alert("Register successful");


    } catch(error) {


      console.log(error.response?.data);


      alert(
        error.response?.data?.message ||
        "Register failed"
      );


    }


  };



  return (

    <div>


      <h1>
        Register
      </h1>



      <form onSubmit={handleSubmit}>


        <input

          name="walletAddress"

          placeholder="Wallet Address"

          onChange={handleChange}

        />



        <input

          name="nationalIdHash"

          placeholder="National ID Hash"

          onChange={handleChange}

        />



        <input

          name="fullName"

          placeholder="Full Name"

          onChange={handleChange}

        />



        <button>

          Register

        </button>


      </form>



    </div>

  );


}


export default Register;