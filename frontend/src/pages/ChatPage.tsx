import React from "react";
import { useParams } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { ChatLayout } from "../components/chat";
import {
	COLOR_PRIMARY,
	COLOR_BACKGROUND,
	COLOR_SURFACE,
	COLOR_TEXT_PRIMARY,
	COLOR_TEXT_SECONDARY,
	COLOR_SUCCESS,
	COLOR_WARNING,
	COLOR_ERROR,
} from "../constants";

// Create dark theme for chat
const chatTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: COLOR_PRIMARY,
			contrastText: "#FFFFFF",
		},
		secondary: {
			main: COLOR_TEXT_SECONDARY,
		},
		background: {
			default: COLOR_BACKGROUND,
			paper: COLOR_SURFACE,
		},
		text: {
			primary: COLOR_TEXT_PRIMARY,
			secondary: COLOR_TEXT_SECONDARY,
		},
		success: {
			main: COLOR_SUCCESS,
		},
		warning: {
			main: COLOR_WARNING,
		},
		error: {
			main: COLOR_ERROR,
		},
		divider: COLOR_TEXT_SECONDARY + "30",
		action: {
			hover: COLOR_SURFACE + "80",
			selected: COLOR_PRIMARY + "20",
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
	components: {
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: COLOR_SURFACE,
					backgroundImage: "none",
					color: COLOR_TEXT_PRIMARY,
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						backgroundColor: COLOR_SURFACE,
						"& fieldset": {
							borderColor: COLOR_TEXT_SECONDARY + "40",
						},
						"&:hover fieldset": {
							borderColor: COLOR_PRIMARY,
						},
						"&.Mui-focused fieldset": {
							borderColor: COLOR_PRIMARY,
						},
					},
					"& .MuiInputLabel-root": {
						color: COLOR_TEXT_SECONDARY,
					},
					"& .MuiInputLabel-root.Mui-focused": {
						color: COLOR_PRIMARY,
					},
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				contained: {
					backgroundColor: COLOR_PRIMARY,
					color: "#FFFFFF",
					"&:hover": {
						backgroundColor: COLOR_PRIMARY + "CC",
					},
				},
				outlined: {
					borderColor: COLOR_PRIMARY,
					color: COLOR_PRIMARY,
					"&:hover": {
						borderColor: COLOR_PRIMARY + "CC",
						backgroundColor: COLOR_PRIMARY + "10",
					},
				},
				text: {
					color: COLOR_TEXT_PRIMARY,
					"&:hover": {
						backgroundColor: COLOR_SURFACE + "80",
					},
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				},
				outlined: {
					borderColor: COLOR_TEXT_SECONDARY + "40",
				},
				colorSuccess: {
					backgroundColor: COLOR_SUCCESS + "20",
					color: COLOR_SUCCESS,
					borderColor: COLOR_SUCCESS,
				},
				colorWarning: {
					backgroundColor: COLOR_WARNING + "20",
					color: COLOR_WARNING,
					borderColor: COLOR_WARNING,
				},
				colorError: {
					backgroundColor: COLOR_ERROR + "20",
					color: COLOR_ERROR,
					borderColor: COLOR_ERROR,
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: COLOR_SURFACE,
					color: COLOR_TEXT_PRIMARY,
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					"&:hover": {
						backgroundColor: COLOR_SURFACE + "80",
					},
					"&.Mui-selected": {
						backgroundColor: COLOR_PRIMARY + "20",
						"&:hover": {
							backgroundColor: COLOR_PRIMARY + "30",
						},
					},
				},
			},
		},
	},
});

const ChatPage: React.FC = () => {
	const { conversationId } = useParams<{ conversationId?: string }>();

	return (
		<ThemeProvider theme={chatTheme}>
			<CssBaseline />
			<Box sx={{ height: "100vh", width: "100%" }}>
				<ChatLayout
					defaultConversationUuid={conversationId}
					isEmbedded={false}
				/>
			</Box>
		</ThemeProvider>
	);
};

export default ChatPage;
