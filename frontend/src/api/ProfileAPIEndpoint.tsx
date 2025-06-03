import axios from "axios";
import { BASE_API_URL } from "../constants";

const API_URL = `${BASE_API_URL}/users/profile/`;

export class ProfileService {
	static async getProfile(userId: string) {
		const token = localStorage.getItem("token");

		console.log("Token:", token);
		console.log("API URL:", API_URL);
		console.log("Full URL:", `${API_URL}`);

		if (!token) {
			throw new Error("No authentication token found");
		}

		const response = await axios.get(`${API_URL}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}

	static async createProfile(profileData: any) {
		const token = localStorage.getItem("token");
		const response = await axios.post(`${API_URL}`, profileData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	}

	static async updateProfile(userId: string, profileData: any) {
		const token = localStorage.getItem("token");
		const response = await axios.put(`${API_URL}`, profileData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		return response.data;
	}

	static async deleteProfile() {
		const token = localStorage.getItem("token");
		const response = await axios.delete(`${API_URL}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	}
}
