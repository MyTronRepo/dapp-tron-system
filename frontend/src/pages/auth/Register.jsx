import { useState } from "react";
import { registerUser } from "../../services/authService";


function Register() {

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    walletAddress: "",
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

      console.log(error);
      alert("Register failed");

    }

  };


  return (

    <div>

      <h1>
        Register
      </h1>


      <form onSubmit={handleSubmit}>

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />


        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />


        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />


        <input
          name="walletAddress"
          placeholder="Wallet Address"
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