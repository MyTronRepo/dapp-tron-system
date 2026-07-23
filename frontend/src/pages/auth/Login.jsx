import { useState } from "react";
import { loginUser } from "../../services/authService";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";


function Login() {


  const navigate = useNavigate();


  const login = useAuthStore(
    (state) => state.login
  );


  const [walletAddress, setWalletAddress] = useState("");



  const handleSubmit = async (e) => {

    e.preventDefault();


    console.log("LOGIN BUTTON CLICKED");

    console.log("State value:", walletAddress);



    try {


      const loginData = {
  walletAddress: walletAddress
};



      console.log("Sending:", loginData);



      const response = await loginUser(loginData);



      console.log(JSON.stringify(response.data, null, 2));



      login(
  response.data.data.user,
  response.data.data.token
);



      navigate("/dashboard");



    } catch (error) {


      console.log(JSON.stringify(error.response?.data, null, 2));


      alert(

        error.response?.data?.message ||

        "Login failed"

      );


    }


  };



  return (

    <div>


      <h1>
        Login
      </h1>



      <form onSubmit={handleSubmit}>


        <input

          name="walletAddress"

          placeholder="Wallet Address"

          value={walletAddress}

          onChange={(e) => {

            console.log(
              "Input value:",
              e.target.value
            );


            setWalletAddress(
              e.target.value
            );

          }}

        />



        <button type="submit">

          Login

        </button>



      </form>


    </div>

  );


}


export default Login;