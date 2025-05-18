import React from "react";
import {
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	useTheme,
} from "@mui/material";

interface IssueCardProps {
	title: string;
	description: string;
	onViewDetails: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({
	title,
	description,
	onViewDetails,
}) => {
	const theme = useTheme();

	return (
		<Card
			sx={{
				mb: 2,
				borderRadius: 2,
				transition: "all 0.3s",
				"&:hover": {
					boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
					transform: "translateY(-2px)",
				},
			}}
		>
			<CardContent sx={{ p: 2 }}>
				<Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
					{title}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{description}
				</Typography>
				<Box display="flex" justifyContent="flex-end">
					<Button
						variant="contained"
						color="primary"
						onClick={onViewDetails}
						sx={{
							bgcolor: theme.palette.error.main,
							"&:hover": { bgcolor: theme.palette.error.dark },
							borderRadius: "20px",
							px: 3,
						}}
					>
						View Details
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
};

export default IssueCard;
