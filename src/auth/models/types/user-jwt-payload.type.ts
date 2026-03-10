export type UserJwtPayload = {
  id: number;
  email: string;
  role: string;
}

export const UserJwtPayloadScheme: UserJwtPayload = {
  id: 0,
  email: '',
  role: ''
}