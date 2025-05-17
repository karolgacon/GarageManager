export interface Part {
	id: number;
	name: string;
	product_id: string;
	description: string;
	quantity: number;
	price: number;
	category?: string;
	supplier?: string;
	image_url?: string;
	created_at?: string;
	updated_at?: string;
	is_available?: boolean;
	minimum_stock?: number;
}

export const defaultPart: Part = {
	id: 0,
	name: "",
	product_id: "",
	description: "",
	quantity: 0,
	price: 0,
};
