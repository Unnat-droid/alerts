import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import "./App.css";
import ChemicalChangePage from "./page/Chemical";
import HomePage from "./page/HomePage";

function App() {
   return (
      <>
         <Router>
            <div
               style={{
                  background: "#fff",
                  minHeight: "100vh",
               }}
            >
               <Routes>
                  <Route
                     path="/"
                     element={<HomePage/>}
                  />
                  <Route
                     path="/chemical-changes"
                     element={<ChemicalChangePage />}
                  />{" "}
               </Routes>
            </div>
         </Router>
      </>
   );
}

export default App;
