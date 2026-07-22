import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/home/Home";


function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route 
          path="/login"
          element={<Login />}
        />

        <Route 
          path="/register"
          element={<Register />}
        />

        <Route element={<MainLayout />}>

          <Route 
            path="/" 
            element={<Home />} 
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default AppRouter;