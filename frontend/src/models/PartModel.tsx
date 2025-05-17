export interface Part {
	id?: number;
	name: string;
	manufacturer: string;
	price: number;
	stock_quantity: number;
	minimum_stock_level: number;
	category: string;
	supplier?: string;
}

export const defaultPart: Part = {
	id: undefined,
	name: "",
	manufacturer: "",
	price: 0,
	stock_quantity: 0,
	minimum_stock_level: 5,
	category: "body",
	supplier: "",
};

export const CATEGORY_OPTIONS = [
	{ value: "engine", label: "Engine" },
	{ value: "electrical", label: "Electrical" },
	{ value: "brake", label: "Brake" },
	{ value: "suspension", label: "Suspension" },
	{ value: "body", label: "Body" },
];
