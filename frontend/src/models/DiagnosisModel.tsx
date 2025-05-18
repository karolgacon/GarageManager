export interface DiagnosisIssue {
	id?: number;
	title: string;
	description: string;
	symptoms: string[];
	causes: string[];
	solutions: string[];
	category: string;
	severity: "low" | "medium" | "high";
}

export const ISSUE_CATEGORIES = [
	{ value: "engine", label: "Engine" },
	{ value: "brakes", label: "Brakes" },
	{ value: "electrical", label: "Electrical" },
	{ value: "suspension", label: "Suspension" },
	{ value: "transmission", label: "Transmission" },
	{ value: "cooling", label: "Cooling System" },
	{ value: "exhaust", label: "Exhaust" },
	{ value: "fuel", label: "Fuel System" },
	{ value: "steering", label: "Steering" },
	{ value: "battery", label: "Battery" },
	{ value: "other", label: "Other" },
];

export const defaultDiagnosisIssue: DiagnosisIssue = {
	title: "",
	description: "",
	symptoms: [],
	causes: [],
	solutions: [],
	category: "engine",
	severity: "medium",
};
