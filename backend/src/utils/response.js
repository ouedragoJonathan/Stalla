/**
 * Envoie une réponse JSON standardisée à toutes les routes API.
 * @param {import('express').Response} res
 * @param {{ status?: number, success?: boolean, message: string, data?: any, errors?: object }} options
 */
export function sendResponse(res, { status = 200, success = true, message, data = null, errors = null }) {
  const payload = { success, message };
  if (data !== undefined && data !== null) payload.data = data;
  if (errors && typeof errors === "object") payload.errors = errors;
  return res.status(status).json(payload);
}
