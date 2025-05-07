import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

const ClientDashboard: React.FC = () => {
	return (
		<Box sx={{ padding: 3 }}>
			<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
				Client Dashboard
			</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Upcoming Bookings</Typography>
							<Typography variant="h5" fontWeight="bold">
								2
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Invoices</Typography>
							<Typography variant="h5" fontWeight="bold">
								$1,200.00
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Loyalty Points</Typography>
							<Typography variant="h5" fontWeight="bold">
								150
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ClientDashboard;
