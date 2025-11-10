import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with auth interceptor
const createApiClient = () => {
	const client = axios.create({
		baseURL: API_BASE_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

	// Add auth token to requests
	client.interceptors.request.use((config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	});

	return client;
};

export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	role: string;
}

export interface Workshop {
	id: number;
	name: string;
	address: string;
	phone: string;
}

export class ResourcesApiClient {
	private client = createApiClient();

	async getMechanics(): Promise<User[]> {
		const response = await this.client.get("/api/v1/users/", {
			params: {
				role: "mechanic",
			},
		});
		return response.data.results || response.data;
	}

	async getWorkshops(): Promise<Workshop[]> {
		const response = await this.client.get("/api/v1/workshops/");
		return response.data.results || response.data;
	}
}

// Create singleton instance
export const resourcesApiClient = new ResourcesApiClient();

export default resourcesApiClient;