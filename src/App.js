import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import TrackProblem from "./pages/TrackProblem";
import ReportProblem from "./pages/ReportProblem";
import ExploreIssues from "./pages/ExploreIssues";
import WhatNeedsFixing from "./pages/WhatNeedsFixing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<TrackProblem />} />
          <Route path="/report" element={<ReportProblem />} />
          <Route path="/explore" element={<ExploreIssues />} />
          <Route path="/issues" element={<WhatNeedsFixing />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Role-Based Dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;