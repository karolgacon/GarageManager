import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

const OwnerDashboard: React.FC = () => {
	return (
		<Box sx={{ padding: 3 }}>
			<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
				Owner Dashboard
			</Typography>
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Garage Revenue</Typography>
							<Typography variant="h5" fontWeight="bold">
								$56,345.98
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="subtitle2">Customer Satisfaction</Typography>
							<Typography variant="h5" fontWeight="bold">
								95%
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default OwnerDashboard;
