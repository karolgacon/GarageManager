import React, { useContext } from "react";
import { Button, Box } from "@mui/material";
import AuthContext from "../context/AuthProvider";
import AdminDashboard from "../components/Dashboards/AdminDashboard";
import OwnerDashboard from "../components/Dashboards/OwnerDashboard";
import MechanicDashboard from "../components/Dashboards/MechanicDashboard";
import ClientDashboard from "../components/Dashboards/ClientDashboard";

const Home: React.FC = () => {
	const { auth, isAdmin, isOwner, isMechanic, isClient, logout } =
		useContext(AuthContext);

	const renderContent = () => {
		if (isAdmin()) {
			return <AdminDashboard />;
		} else if (isOwner()) {
			return <OwnerDashboard />;
		} else if (isMechanic()) {
			return <MechanicDashboard />;
		} else if (isClient()) {
			return <ClientDashboard />;
		} else {
			return <p>Unauthorized</p>;
		}
	};

	return (
		<Box sx={{ padding: 3 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
				}}
			>
				<h1>Welcome, {auth.username || "User"}!</h1>
				<Button
					variant="contained"
					color="error"
					onClick={logout}
					sx={{ textTransform: "none" }}
				>
					Logout
				</Button>
			</Box>
			{renderContent()}
		</Box>
	);
};

export default Home;
