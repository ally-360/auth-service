export interface JwtPayload {
  id: number;
  email: string;
  authId: string;
  selectedCompanyId?: number;
  role?: string;
}
