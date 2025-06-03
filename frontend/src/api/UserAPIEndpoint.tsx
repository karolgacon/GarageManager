import api from "../api";
import { User } from "../models/UserModel";

export const UserService = {
	getUsers: async (): Promise<User[]> => {
		const response = await api.get("/users/");
		return response.data;
	},

	getUser: async (id: number): Promise<User> => {
		const response = await api.get(`/users/${id}/`);
		return response.data;
	},

	createUser: async (userData: Partial<User>): Promise<User> => {
		const response = await api.post("/users/", userData);
		return response.data;
	},

	updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
		const response = await api.put(`/users/${id}/`, userData);
		return response.data;
	},

	deleteUser: async (id: number): Promise<void> => {
		await api.delete(`/users/${id}/`);
	},

	// Nowa funkcja - filtrowanie klientów lokalnie
	getClients: async (): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			// Filtruj użytkowników, którzy mają rolę 'client'
			return response.data.filter((user: User) => user.roles[0] === "client");
		} catch (error) {
			console.error("Error fetching and filtering clients:", error);
			throw error;
		}
	},

	// Funkcja do pobierania mechaników - również filtrowana lokalnie
	getMechanics: async (): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			// Filtruj użytkowników, którzy mają rolę 'mechanic'
			return response.data.filter((user: User) => user.roles[0] === "mechanic");
		} catch (error) {
			console.error("Error fetching and filtering mechanics:", error);
			throw error;
		}
	},

	// Funkcja do pobierania właścicieli warsztatów - również filtrowana lokalnie
	getOwners: async (): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			// Filtruj użytkowników, którzy mają rolę 'owner'
			return response.data.filter((user: User) => user.roles[0] === "owner");
		} catch (error) {
			console.error("Error fetching and filtering owners:", error);
			throw error;
		}
	},

	// Funkcja do pobierania dowolnej roli
	getUsersByRole: async (role: string): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			// Filtruj użytkowników według podanej roli
			return response.data.filter((user: User) => user.roles[0] === role);
		} catch (error) {
			console.error(
				`Error fetching and filtering users by role ${role}:`,
				error
			);
			throw error;
		}
	},
};
