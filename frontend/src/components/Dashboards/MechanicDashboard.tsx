import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

const MechanicDashboard: React.FC = () => {
	return (
		<Box sx={{ padding: 3 }}>
			<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
				Mechanic Dashboard
			</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Pending Repairs</Typography>
							<Typography variant="h5" fontWeight="bold">
								15
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Completed Repairs</Typography>
							<Typography variant="h5" fontWeight="bold">
								120
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Parts Used</Typography>
							<Typography variant="h5" fontWeight="bold">
								45
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default MechanicDashboard;
