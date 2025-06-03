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

	getClients: async (): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			return response.data.filter((user: User) => user.roles[0] === "client");
		} catch (error) {
			throw error;
		}
	},

	getMechanics: async (): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			return response.data.filter((user: User) => user.roles[0] === "mechanic");
		} catch (error) {
			throw error;
		}
	},

	getOwners: async (): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			return response.data.filter((user: User) => user.roles[0] === "owner");
		} catch (error) {
			throw error;
		}
	},

	getUsersByRole: async (role: string): Promise<User[]> => {
		try {
			const response = await api.get("/users/");
			return response.data.filter((user: User) => user.roles[0] === role);
		} catch (error) {
			throw error;
		}
	},
};
