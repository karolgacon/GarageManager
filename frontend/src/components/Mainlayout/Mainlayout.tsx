import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import FloatingChatButton from "../FloatingChatButton";
import Footer from "../Footer";
import {
	Box,
	Container,
	AppBar,
	Toolbar,
	IconButton,
	Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { COLOR_PRIMARY, COLOR_BACKGROUND } from "../../constants";

const Mainlayout = ({ children }: { children: React.ReactNode }) => {
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
				overflowX: "hidden", // Zapobiegnie poziomemu scrollowi
				width: "100%",
				maxWidth: "100vw", // Ogranicza szerokość do viewport
			}}
		>
			<Box
				sx={{
					display: "flex",
					flex: 1,
					overflowX: "hidden", // Zapobiegnie poziomemu scrollowi w main flex container
					width: "100%",
				}}
			>
				{isMobile && (
					<AppBar
						position="fixed"
						sx={{
							zIndex: 1300, // Wyższy z-index niż HeaderBar
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
						backgroundColor: COLOR_BACKGROUND, // Ciemne tło głównej zawartości
						width: "100%",
						maxWidth: "100%", // Ogranicza szerokość
						mt: isMobile ? 8 : 0, // Przywrócenie oryginalnego marginesu
						pb: "40px",
						overflowX: "hidden", // Zapobiegnie poziomemu scrollowi
					}}
				>
					<HeaderBar />
					<Container
						maxWidth="xl"
						className="thin-scrollbar"
						sx={{
							py: 0,
							pt: { xs: 9, sm: 2 }, // Dodatkowy padding na mobile dla fixed HeaderBar, normalny na desktop
							px: { xs: 1, sm: 2, md: 3 },
							flex: 1,
							width: "100%",
							maxWidth: { xs: "100%", sm: "100%", md: "100%" }, // Pełna szerokość ale bez overflow
							overflowX: "hidden", // Zapobiegnie poziomemu scrollowi
						}}
					>
						{children}
					</Container>
				</Box>
			</Box>

			{/* Floating Chat Button */}
			<FloatingChatButton
				position={{
					bottom: 64, // Above footer
					right: isMobile ? 16 : 24, // Mniejszy margin na mobile
				}}
			/>

			<Footer />
		</Box>
	);
};

export default Mainlayout;
