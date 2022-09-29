import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './Authentication.js'

const Login = () => {
    const loginField = useRef();
    const { bearerToken, onLogin } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault()
        onLogin(loginField.current.value)
        console.log("Logged in!")
    }

    return(
        <div>
          <form onSubmit={(e) => {handleSubmit(e)}}>
            <label>
              Bearer token:
              <input 
              type="text"
              name="bearer-token"
              ref={loginField}
              />
            </label>
            <input
            type="submit"
            value="Submit"
            />
          </form>
        </div>
    )
}


export default Login;
