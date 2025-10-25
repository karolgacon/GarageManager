import React from "react";
import { useParams } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { ChatLayout } from "../components/chat";

// Create theme for chat
const chatTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#dc004e",
		},
		background: {
			default: "#f5f5f5",
			paper: "#ffffff",
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
	components: {
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
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
