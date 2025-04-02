import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthProvider.tsx'
import './index.css'
import UserList from './components/Users/UserList.tsx';
import UserDetail from './components/Users/UserDetail.tsx';
import UserForm from './components/Users/UserForm.tsx';
// import ProfileComponent from './components/Profile/ProfileComponent.tsx';
// import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Home from "./pages/Home.tsx";
import RequireAuth from "./components/Auth/RequireAuth.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route element={<RequireAuth requiredRole={["client","admin","mechanic","owner"]} />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/users/new" element={<UserForm mode="create" />} />
                    <Route path="/users/edit/:id" element={<UserForm mode="edit" />} />
                    <Route path="/users/:id" element={<UserDetail />} />
                </Route>
                {/*<Route path="/register" element={<Register />} />*/}
                <Route path="/login" element={<Login />} />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
