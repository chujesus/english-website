export class Profile {
    public static Administrator = 0;
    public static Student = 1;
}

export class Status {
    public static Inactive = 0;
    public static Active = 1;
}

export interface GoogleAuthPayload {
    email: string;
    name: string;
    googleId: string;
    avatar?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
    ok: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse extends ApiResponse {
    message: string;
}


// User interface
export interface IUser {
    id?: number;
    google_id?: string;
    identification?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    password?: string;
    email?: string;
    phone?: string;
    password_token?: string;
    state?: number;
    user_state?: string;
    profile?: number;
    starting_module?: 'A1' | 'A2' | 'B1' | 'B2';
    url_image?: string;
    image_name?: string;
    token?: string;
    refresh_token?: string;
    created_at?: Date;
    updated_at?: Date;
}