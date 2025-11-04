import React, { useContext } from "react";
import { Button, Box } from "@mui/material";
import AuthContext from "../context/AuthProvider";
import AdminDashboard from "../components/Dashboards/AdminDashboard";
import OwnerDashboard from "../components/Dashboards/OwnerDashboard";
import MechanicDashboard from "../components/Dashboards/MechanicDashboard";
import ClientDashboard from "../components/Dashboards/ClientDashboard";
import Mainlayout from "../components/Mainlayout/Mainlayout";
import { COLOR_TEXT_PRIMARY } from "../constants";

const Dashboard: React.FC = () => {
	const { auth, isAdmin, isOwner, isMechanic, isClient, isRoot, logout } =
		useContext(AuthContext);

	const renderContent = () => {
		if (isRoot() || isAdmin()) {
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
		<Mainlayout>
			<Box sx={{ padding: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}
				>
					<h1 style={{ color: COLOR_TEXT_PRIMARY }}>
						Welcome, {auth.username || "User"}!
					</h1>
				</Box>
				{renderContent()}
			</Box>
		</Mainlayout>
	);
};

export default Dashboard;
