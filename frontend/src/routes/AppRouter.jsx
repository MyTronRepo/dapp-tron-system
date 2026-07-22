import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/home/Home";


function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

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