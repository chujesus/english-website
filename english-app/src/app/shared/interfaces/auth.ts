export class Profile {
    public static Administrator = 0;
    public static Instructor = 1;
    public static Student = 2;
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
    url_image?: string;
    image_name?: string;
    token?: string;
    refresh_token?: string;
    created_at?: Date;
    updated_at?: Date;
}
