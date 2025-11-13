import Cookies from "js-cookie"

const TOKEN_KEY = "token"

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { secure: true, sameSite: "strict" })
}

export function getToken() {
  return Cookies.get(TOKEN_KEY) || null
}

export function clearToken() {
  Cookies.remove(TOKEN_KEY)
}
