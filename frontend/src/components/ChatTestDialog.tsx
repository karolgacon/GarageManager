import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	CircularProgress,
	Alert,
	Paper,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import {
	Chat as ChatIcon,
	Warning as WarningIcon,
	CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { COLOR_PRIMARY } from "../constants";

interface ChatTestDialogProps {
	onClose?: () => void;
}

const ChatTestDialog: React.FC<ChatTestDialogProps> = ({ onClose }) => {
	const [status, setStatus] = useState("Sprawdzanie połączenia...");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tests, setTests] = useState<
		Array<{
			name: string;
			status: "pending" | "success" | "error";
			message?: string;
		}>
	>([
		{ name: "Autoryzacja", status: "pending" },
		{ name: "Backend API", status: "pending" },
		{ name: "Chat Endpoints", status: "pending" },
		{ name: "WebSocket", status: "pending" },
	]);

	useEffect(() => {
		runTests();
	}, []);

	const updateTest = (
		index: number,
		status: "success" | "error",
		message?: string
	) => {
		setTests((prev) =>
			prev.map((test, i) => (i === index ? { ...test, status, message } : test))
		);
	};

	const runTests = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Test 1: Autoryzacja
			const token = localStorage.getItem("token"); // Używamy "token" zamiast "authToken"
			if (!token) {
				updateTest(0, "error", "Brak tokenu autoryzacji");
				setError("Musisz być zalogowany żeby używać czatu");
				setIsLoading(false);
				return;
			}
			updateTest(0, "success", `Token: ${token.substring(0, 20)}...`);

			// Test 2: Backend API
			try {
				const backendResponse = await fetch("http://localhost:8000/api/v1/", {
					method: "HEAD",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (backendResponse.ok) {
					updateTest(1, "success", "Backend dostępny");
				} else {
					updateTest(1, "error", `Backend error: ${backendResponse.status}`);
				}
			} catch (err) {
				updateTest(1, "error", `Nie można połączyć z backendem: ${err}`);
			}

			// Test 3: Chat Endpoints
			try {
				const chatResponse = await fetch(
					"http://localhost:8000/api/v1/chat/conversations/",
					{
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					}
				);

				if (chatResponse.ok) {
					const data = await chatResponse.json();
					updateTest(
						2,
						"success",
						`Znaleziono ${data.results?.length || 0} konwersacji`
					);
				} else if (chatResponse.status === 401) {
					updateTest(2, "error", "Nieprawidłowy token autoryzacji");
				} else {
					updateTest(2, "error", `Chat API error: ${chatResponse.status}`);
				}
			} catch (err) {
				updateTest(2, "error", `Chat API niedostępne: ${err}`);
			}

			// Test 4: WebSocket
			try {
				const wsUrl = `ws://localhost:8000/ws/chat/notifications/?token=${encodeURIComponent(
					token
				)}`;
				const ws = new WebSocket(wsUrl);

				const wsPromise = new Promise((resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error("WebSocket timeout"));
						ws.close();
					}, 5000);

					ws.onopen = () => {
						clearTimeout(timeout);
						resolve("success");
						ws.close();
					};

					ws.onerror = (err) => {
						clearTimeout(timeout);
						reject(err);
					};
				});

				await wsPromise;
				updateTest(3, "success", "WebSocket działa");
			} catch (err) {
				updateTest(3, "error", `WebSocket error: ${err}`);
			}

			setStatus("Testy zakończone");
		} catch (err) {
			setError(`Nieoczekiwany błąd: ${err}`);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return <CheckIcon sx={{ color: "success.main" }} />;
			case "error":
				return <WarningIcon sx={{ color: "error.main" }} />;
			default:
				return <CircularProgress size={20} />;
		}
	};

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			{/* Header */}
			<Box
				sx={{
					p: 2,
					bgcolor: COLOR_PRIMARY,
					color: "white",
					display: "flex",
					alignItems: "center",
					gap: 1,
				}}
			>
				<ChatIcon />
				<Typography variant="h6">Test Połączenia Czatu</Typography>
				<Box sx={{ flexGrow: 1 }} />
				{onClose && (
					<Button onClick={onClose} sx={{ color: "white", minWidth: "auto" }}>
						✕
					</Button>
				)}
			</Box>

			{/* Content */}
			<Box sx={{ flex: 1, p: 3 }}>
				<Typography variant="h6" gutterBottom>
					Status: {status}
				</Typography>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Paper sx={{ mt: 2 }}>
					<List>
						{tests.map((test, index) => (
							<ListItem key={index}>
								{getStatusIcon(test.status)}
								<ListItemText
									primary={test.name}
									secondary={test.message}
									sx={{ ml: 2 }}
								/>
							</ListItem>
						))}
					</List>
				</Paper>

				<Box sx={{ mt: 3, display: "flex", gap: 2 }}>
					<Button
						variant="contained"
						onClick={runTests}
						disabled={isLoading}
						sx={{ bgcolor: COLOR_PRIMARY }}
					>
						{isLoading ? "Testowanie..." : "Uruchom testy ponownie"}
					</Button>

					{!isLoading && tests.every((t) => t.status === "success") && (
						<Button
							variant="outlined"
							onClick={() => {
								// Tutaj można przełączyć na właściwy chat
								alert("Wszystkie testy przeszły! Chat powinien działać.");
							}}
						>
							Otwórz Chat
						</Button>
					)}
				</Box>

				<Box sx={{ mt: 3 }}>
					<Typography variant="body2" color="text.secondary">
						Ten komponent testuje wszystkie połączenia potrzebne do działania
						czatu:
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						component="ul"
						sx={{ mt: 1 }}
					>
						<li>Sprawdza czy użytkownik jest zalogowany</li>
						<li>Testuje połączenie z backendem</li>
						<li>Sprawdza dostępność API czatu</li>
						<li>Testuje WebSocket do komunikacji w czasie rzeczywistym</li>
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default ChatTestDialog;
