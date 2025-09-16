
// This file defines the shape of the data that will be stored in the user's session cookie.
// It is used by `iron-session` to provide type-safe access to session data.

export type SessionData = {
  isLoggedIn: boolean;
  uid: string;
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
};
