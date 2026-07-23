import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/home/Home";

import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";


function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route 
          path="/login"
          element={<Login />}
        />


        <Route 
          path="/register"
          element={<Register />}
        />


        {/* Public Layout */}

        <Route element={<MainLayout />}>

          <Route 
            path="/" 
            element={<Home />} 
          />


        </Route>



        {/* Protected Routes */}

       <Route element={<MainLayout />}>
  <Route path="/" element={<Home />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Route>
      </Routes>

    </BrowserRouter>
  );
}


export default AppRouter;