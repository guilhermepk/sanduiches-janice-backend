export type JwtPayload = {
  id: number;
  email: string;
  role: string;
}

export const JwtPayloadScheme: JwtPayload = {
  id: 0,
  email: '',
  role: ''
}