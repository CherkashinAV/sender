export interface Template {
    id: number;
    publicId: string;
    name: string;
	body: string;
	theme: string;
}

export interface EmailData {
    id: number,
    email: string;
    password: string;
    secretCode: string;
}