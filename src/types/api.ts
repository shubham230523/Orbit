export interface LoginRequest {
  email: string;
  password: String;
}

export interface SignupRequest {
  email: string;
  password: String;
  name?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}
