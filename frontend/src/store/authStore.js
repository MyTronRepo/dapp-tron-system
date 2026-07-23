import { create } from "zustand";


const getUser = () => {

  const user = localStorage.getItem("user");


  if (!user || user === "undefined") {

    return null;

  }


  try {

    return JSON.parse(user);

  } catch (error) {

    return null;

  }

};



const useAuthStore = create((set)=>({


  user: getUser(),


  token: localStorage.getItem("token") || null,



  login:(user, token)=>{


    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );


    localStorage.setItem(
      "token",
      token
    );



    set({

      user,

      token

    });


  },



  logout:()=>{


    localStorage.removeItem("user");

    localStorage.removeItem("token");



    set({

      user:null,

      token:null

    });


  }


}));



export default useAuthStore;