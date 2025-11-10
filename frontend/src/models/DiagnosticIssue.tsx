export interface DiagnosticIssue {
	id: number;
	vehicle: number;
	diagnostic_date: string;
	diagnostic_notes: string;
	estimated_repair_cost: number;
	severity_level: "low" | "medium" | "high" | "critical";
	diagnostic_result?: any;
	next_inspection_date?: string | null;
	email_notification: boolean;
	sms_notification: boolean;
}
