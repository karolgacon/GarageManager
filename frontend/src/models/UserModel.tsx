import { Profile } from "./ProfileModel";

export interface User {
	id: number;
	username?: string;
	email: string;
	first_name?: string;
	last_name?: string;
	full_name?: string;
	roles: string[];
	is_active?: boolean;
	date_joined?: string;
	last_login?: string;
	workshop_id?: number;
	phone_number?: string;
	avatar?: string;
	address?: string;
	profile?: Profile;
}

export const USER_ROLES = [
	{ value: "admin", label: "Administrator" },
	{ value: "owner", label: "Workshop Owner" },
	{ value: "mechanic", label: "Mechanic" },
	{ value: "client", label: "Client" },
];

export const defaultUser: User = {
	id: 0,
	email: "",
	username: "",
	first_name: "",
	last_name: "",
	roles: ["client"],
	is_active: true,
};
