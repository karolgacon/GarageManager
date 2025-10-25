import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthProvider.tsx";
import "./index.css";
import UserList from "./components/Users/UserList.tsx";
import UserDetail from "./components/Users/UserDetail.tsx";
import UserForm from "./components/Users/UserForm.tsx";
import ProfileComponent from "./components/Profile/ProfileComponent.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import RequireAuth from "./components/Auth/RequireAuth.tsx";
import NotFound from "./pages/NotFound.tsx";
import Inventory from "./pages/Inventory.tsx";
import Services from "./pages/ServicePage.tsx";
import Vehicles from "./pages/Vehicles.tsx";
import RegisterComplete from "./pages/RegisterComplete.tsx";
import Profile from "./pages/Profile.tsx";
import Customers from "./pages/Customers.tsx";
import Bookings from "./pages/Bookings.tsx";
import Diagnostics from "./pages/Diagnostics.tsx";
import StaffManagement from "./pages/StaffManagement.tsx";
import Invoices from "./pages/Invoices.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route
						element={
							<RequireAuth
								requiredRole={["client", "admin", "mechanic", "owner"]}
							/>
						}
					>
						<Route path="/" element={<Dashboard />} />
						<Route path="/home" element={<Dashboard />} />
						<Route path="/users" element={<UserList />} />
						<Route path="/users/new" element={<UserForm mode="create" />} />
						<Route path="/users/edit/:id" element={<UserForm mode="edit" />} />
						<Route path="/users/:id" element={<UserDetail />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/inventory" element={<Inventory />} />
						<Route path="/services" element={<Services />} />
						<Route path="/vehicles" element={<Vehicles />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/customers" element={<Customers />} />
						<Route path="/bookings" element={<Bookings />} />
						<Route path="/diagnostics" element={<Diagnostics />} />
						<Route path="/staff" element={<StaffManagement />} />
						<Route path="/invoices" element={<Invoices />} />
					</Route>
					<Route path="/register" element={<RegisterComplete />} />
					<Route path="/login" element={<Login />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
