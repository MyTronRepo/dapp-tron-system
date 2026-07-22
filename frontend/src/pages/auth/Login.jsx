import { useState } from "react";
import { loginUser } from "../../services/authService";


function Login() {


const [formData,setFormData] = useState({
  email:"",
  password:""
});


const handleChange=(e)=>{

setFormData({
 ...formData,
 [e.target.name]:e.target.value
});

};



const handleSubmit=async(e)=>{

e.preventDefault();


try{

const response = await loginUser(formData);

console.log(response.data);

alert("Login successful");


}catch(error){

console.log(error);
alert("Login failed");

}


};



return(

<div>

<h1>
Login
</h1>


<form onSubmit={handleSubmit}>


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


<button>
Login
</button>


</form>


</div>

);


}


export default Login;