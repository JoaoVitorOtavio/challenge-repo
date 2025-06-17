export function validateJwt(token: string | null): boolean {
  if (!token) return false;

  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    const exp = decodedPayload.exp;
    const now = Math.floor(Date.now() / 1000);

    return exp > now;
  } catch {
    return false;
  }
}
