import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import "./App.css";
import ChemicalChangePage from "./page/Chemical";

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
                     element={<div>Woeking</div>}
                  />
                  <Route
                     path="/chemical-changes/:application"
                     element={<ChemicalChangePage />}
                  />{" "}
               </Routes>
            </div>
         </Router>
      </>
   );
}

export default App;
