import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

const AdminDashboard: React.FC = () => {
	return (
		<Box sx={{ padding: 3 }}>
			<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
				Admin Dashboard
			</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Total Users</Typography>
							<Typography variant="h5" fontWeight="bold">
								1,245
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Active Bookings</Typography>
							<Typography variant="h5" fontWeight="bold">
								256
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Resolved Issues</Typography>
							<Typography variant="h5" fontWeight="bold">
								1,256
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default AdminDashboard;
