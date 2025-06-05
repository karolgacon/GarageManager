import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import {
	Box,
	Container,
	AppBar,
	Toolbar,
	IconButton,
	Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
	COLOR_PRIMARY,
	COLOR_SECONDARY,
	COLOR_DARK,
	COLOR_LIGHT,
} from "../../constants";

const Mainlayout = ({ children }) => {
	const [isMobile, setIsMobile] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const handleDrawerToggle = () => {
		setDrawerOpen(!drawerOpen);
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				position: "relative", 
			}}
		>
			<Box sx={{ display: "flex", flex: 1 }}>
				{isMobile && (
					<AppBar
						position="fixed"
						sx={{
							zIndex: (theme) => theme.zIndex.drawer + 1,
							backgroundColor: COLOR_PRIMARY,
						}}
					>
						<Toolbar>
							<IconButton
								color="inherit"
								aria-label="open drawer"
								edge="start"
								onClick={handleDrawerToggle}
								sx={{ mr: 2 }}
							>
								<MenuIcon />
							</IconButton>
							<Typography variant="h6" noWrap component="div">
								Garage Manager
							</Typography>
						</Toolbar>
					</AppBar>
				)}

				<Sidebar
					isMobile={isMobile}
					open={drawerOpen}
					onClose={handleDrawerToggle}
				/>

				<Box
					component="main"
					sx={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						backgroundColor: COLOR_LIGHT,
						width: "100%",
						mt: isMobile ? 8 : 0,
						pb: "40px",
					}}
				>
					<HeaderBar />
					<Container
						maxWidth="xl"
						sx={{
							py: 0, 
							pt: 2, 
							px: { xs: 1, sm: 2, md: 3 },
							flex: 1,
						}}
					>
						{children}
					</Container>
				</Box>
			</Box>

			<Box
				sx={{
					height: "32px", 
					padding: "6px", 
					textAlign: "center",
					bgcolor: COLOR_PRIMARY,
					color: "white",
					width: "100%",
					position: "fixed", 
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 1300,
				}}
			>
				<Typography variant="caption" component="div">
					COPYRIGHT | GARAGEMASTER 2025
				</Typography>
			</Box>
		</Box>
	);
};

export default Mainlayout;
