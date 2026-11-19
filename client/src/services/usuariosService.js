import { json, request } from './http'

const BASE = '/usuarios'

export const listUsers = () => request(BASE)

export const createUser = (data) => request(BASE, json('POST', data))

export const updateUser = (id, data) => request(`${BASE}/${id}`, json('PATCH', data))

export const resetPassword = (id, newPassword) =>
  request(`${BASE}/${id}/password`, json('POST', { newPassword }))
