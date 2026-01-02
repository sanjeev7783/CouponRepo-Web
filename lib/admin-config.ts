// Authorized admin users configuration
export const AUTHORIZED_ADMINS = [
  'sanjeev77830@gmail.com',
  'admin@temple.com'
  // Add more authorized admin emails here as needed
]

export const isAuthorizedAdmin = (email: string): boolean => {
  return AUTHORIZED_ADMINS.includes(email.toLowerCase())
}