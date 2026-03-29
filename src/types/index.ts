export interface AppEnv {
  Variables: {
    requestId: string
    user?: { id: string, name: string, email: string }
    jwtPayload?: JwtPayload
  }
}

export interface JwtPayload {
  sub: string
  name: string
  email: string
  exp: number
}
