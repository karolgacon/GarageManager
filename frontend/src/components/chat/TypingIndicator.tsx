import React from "react";
import { Box, Typography, Avatar, Fade } from "@mui/material";
import { Person as PersonIcon, Build as BuildIcon } from "@mui/icons-material";
import { Conversation } from "../../models/chat";

interface TypingIndicatorProps {
	conversation: Conversation;
	visible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
	conversation,
	visible,
}) => {
	const typingUsers = conversation.participants.filter((p) => p.is_typing);

	if (!visible || typingUsers.length === 0) {
		return null;
	}

	const TypingAnimation = () => (
		<Box
			sx={{
				display: "flex",
				gap: "2px",
				alignItems: "center",
			}}
		>
			{[0, 1, 2].map((index) => (
				<Box
					key={index}
					sx={{
						width: 4,
						height: 4,
						bgcolor: "text.secondary",
						borderRadius: "50%",
						animation: "typing 1.4s infinite ease-in-out",
						animationDelay: `${index * 0.2}s`,
						"@keyframes typing": {
							"0%, 80%, 100%": {
								transform: "scale(0.8)",
								opacity: 0.5,
							},
							"40%": {
								transform: "scale(1)",
								opacity: 1,
							},
						},
					}}
				/>
			))}
		</Box>
	);

	const getTypingText = () => {
		if (typingUsers.length === 1) {
			return `${typingUsers[0].user_name} pisze...`;
		} else if (typingUsers.length === 2) {
			return `${typingUsers[0].user_name} i ${typingUsers[1].user_name} piszą...`;
		} else {
			return `${typingUsers.length} osób pisze...`;
		}
	};

	return (
		<Fade in={visible}>
			<Box
				sx={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					bgcolor: "background.paper",
					borderTop: 1,
					borderColor: "divider",
					p: 1,
					display: "flex",
					alignItems: "center",
					gap: 1,
				}}
			>
				<Avatar sx={{ width: 24, height: 24, bgcolor: "action.hover" }}>
					{typingUsers.length === 1 && typingUsers[0].user_name ? (
						<PersonIcon fontSize="small" />
					) : (
						<BuildIcon fontSize="small" />
					)}
				</Avatar>

				<Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
					{getTypingText()}
				</Typography>

				<TypingAnimation />
			</Box>
		</Fade>
	);
};

export default TypingIndicator;
