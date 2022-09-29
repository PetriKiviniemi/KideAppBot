import React, { useState } from 'react';
import './App.css';
import Home from './Home.js';
import Login from './Login.js';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate} from 'react-router-dom';
import { ProtectedRoute, RedirectToHome, AuthProvider, useAuth, AuthContext } from './Authentication.js'


function App() {

  return (
    <div className="App">
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            <Route path="/" element={
                <ProtectedRoute>
                    <Home/>
                </ProtectedRoute>
            }>
            </Route>
          <Route path="/login" element={
              <Login/>
          }/>
            <Route path="/home" element={
                <ProtectedRoute>
                    <Home/>
                </ProtectedRoute>
            }/>
          </Routes>
      </AuthProvider>
      </BrowserRouter>
    </div>
  );
}



export default App;
