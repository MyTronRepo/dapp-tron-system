import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateProperty from "../pages/properties/CreateProperty";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/home/Home";
import Dashboard from "../pages/dashboard/Dashboard";

import Properties from "../pages/properties/Properties";
import PropertyDetails from "../pages/properties/PropertyDetails";

import Documents from "../pages/documents/Documents";
import DocumentDetails from "../pages/documents/DocumentDetails";

import Transfers from "../pages/transfers/Transfers";
import Admin from "../pages/admin/Admin";
import Logs from "../pages/logs/Logs";

import ProtectedRoute from "./ProtectedRoute";


function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


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


          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <Properties />
              </ProtectedRoute>
            }
          />


          <Route
            path="/properties/create"
            element={
              <ProtectedRoute>
                <CreateProperty />
              </ProtectedRoute>
            }
          />


          <Route
            path="/properties/:propertyId"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />


          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />


          <Route
            path="/documents/:documentId"
            element={
              <ProtectedRoute>
                <DocumentDetails />
              </ProtectedRoute>
            }
          />


          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <Transfers />
              </ProtectedRoute>
            }
          />


          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />


          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />


        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default AppRouter;