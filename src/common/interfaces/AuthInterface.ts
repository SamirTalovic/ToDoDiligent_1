
export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    id: string;
    name: string;
    email: string;
    token: string;
}

export interface RegisterRequestDto {
    name: string;
    email: string;
    password: string;
}

export interface AuthUserDto {
    id: string;
    name: string;
    email: string;
    token: string;
}