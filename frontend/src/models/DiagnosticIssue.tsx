export interface DiagnosticIssue {
    id: number;
    vehicle_id: number;
    title: string;
    description: string;
    category: string;
    severity: "critical" | "warning" | "info";
    symptoms?: string[];
    causes?: string[];
    solutions?: string[];
    recommended_action?: string;
    created_at: string;
    updated_at: string;
}