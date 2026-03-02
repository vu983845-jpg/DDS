export type UserRole = 'viewer' | 'dept_user' | 'hse_admin';
export type DepartmentName = 'Steaming' | 'Shelling' | 'Borma' | 'Peeling MC' | 'ColorSorter' | 'HandPeeling' | 'Packing';
export type IssueStatus = 'Open' | 'Closed';
export type SafetySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Profile {
    id: string;
    name: string | null;
    role: UserRole;
    department: DepartmentName | null;
    created_at: string;
}

export interface Issue {
    id: string;
    department: DepartmentName;
    start_time: string;
    end_time: string | null;
    is_ongoing: boolean;
    machine_area: string | null;
    reason_code: string | null;
    description: string | null;
    duration_mins: number | null;
    impact_level: string | null;
    notes: string | null;
    attachment_url: string | null;
    status: IssueStatus;
    reporter_id: string | null;
    created_at: string;
    updated_at: string;
    // joined relations
    profiles?: {
        name: string
    }
}

export interface SafetyTrigger {
    id: string;
    severity: SafetySeverity;
    description: string;
    status: IssueStatus;
    owner: string | null;
    action_required: string | null;
    created_at: string;
    updated_at: string;
}

export interface DDSNote {
    id: string;
    date: string;
    notes: string | null;
    actions_decided: any | null;
    created_at: string;
    updated_at: string;
}
