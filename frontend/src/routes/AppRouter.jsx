import { BrowserRouter, Routes, Route } from "react-router-dom";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route 
          path="/" 
          element={<h1>Real Estate DApp</h1>} 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;