import React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Button,
	Box,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BuildIcon from "@mui/icons-material/Build";
import { DiagnosisIssue } from "../../models/DiagnosisModel";

interface IssueDetailDialogProps {
	open: boolean;
	onClose: () => void;
	issue: DiagnosisIssue | null;
}

const IssueDetailDialog: React.FC<IssueDetailDialogProps> = ({
	open,
	onClose,
	issue,
}) => {
	const theme = useTheme();

	if (!issue) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="md"
			PaperProps={{
				sx: { borderRadius: 2 },
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					bgcolor: theme.palette.error.main,
					color: "white",
					py: 2,
				}}
			>
				<Typography variant="h6" component="div" fontWeight="bold">
					{issue.title}
				</Typography>
				<IconButton
					aria-label="close"
					onClick={onClose}
					sx={{ color: "white" }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers sx={{ p: 3 }}>
				<Typography variant="body1" paragraph>
					{issue.description}
				</Typography>

				{/* Symptoms section */}
				<Box mb={3}>
					<Typography
						variant="h6"
						sx={{ mb: 1, color: theme.palette.error.main }}
					>
						Symptoms
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<List dense disablePadding>
						{issue.symptoms.map((symptom, index) => (
							<ListItem key={index} disableGutters sx={{ py: 0.5 }}>
								<ListItemIcon sx={{ minWidth: 32 }}>
									<ErrorOutlineIcon color="error" />
								</ListItemIcon>
								<ListItemText primary={symptom} />
							</ListItem>
						))}
					</List>
				</Box>

				{/* Causes section */}
				<Box mb={3}>
					<Typography
						variant="h6"
						sx={{ mb: 1, color: theme.palette.warning.dark }}
					>
						Possible Causes
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<List dense disablePadding>
						{issue.causes.map((cause, index) => (
							<ListItem key={index} disableGutters sx={{ py: 0.5 }}>
								<ListItemIcon sx={{ minWidth: 32 }}>
									<ErrorOutlineIcon color="warning" />
								</ListItemIcon>
								<ListItemText primary={cause} />
							</ListItem>
						))}
					</List>
				</Box>

				{/* Solutions section */}
				<Box>
					<Typography
						variant="h6"
						sx={{ mb: 1, color: theme.palette.success.main }}
					>
						Solutions
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<List dense disablePadding>
						{issue.solutions.map((solution, index) => (
							<ListItem key={index} disableGutters sx={{ py: 0.5 }}>
								<ListItemIcon sx={{ minWidth: 32 }}>
									<BuildIcon color="success" />
								</ListItemIcon>
								<ListItemText primary={solution} />
							</ListItem>
						))}
					</List>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button
					onClick={onClose}
					variant="contained"
					sx={{
						bgcolor: theme.palette.error.main,
						"&:hover": { bgcolor: theme.palette.error.dark },
					}}
				>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default IssueDetailDialog;
