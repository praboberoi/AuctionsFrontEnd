import React from 'react';
import './App.css'
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login";
import Auctions from "./components/Auctions";
import Register from "./components/Register";
import AuctionDetails from "./components/AuctionDetails";


function App() {
  return (
      <div className= "App">
        <Router>
          <div>
            <Routes>
                <Route path="/login" element={<Login/>} />
                <Route path="/auctions" element={<Auctions/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/" element={<Navigate to="/login"/>}/>
                <Route path="*" element={<Navigate to="/login"/>}/>
                <Route path="/AuctionDetails/:id" element={<AuctionDetails/>}/>
             </Routes>
          </div>
        </Router>
      </div>
  )
};

export default App;