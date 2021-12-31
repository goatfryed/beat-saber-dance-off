export interface UserProfile {
  id: string
  name: string
}

export interface User {
  id: string
  profile: UserProfile
  token: string
}

const users: User[] = [];

export interface LoginData {
  name: string
}

export function loginAsUser(loginData: LoginData) {
  let userData = users.find(it => it.id === loginData.name);
  if (userData !== undefined) return userData;

  userData = {
    id: loginData.name,
    token: loginData.name,
    profile: {
      id: loginData.name,
      name: loginData.name,
    },
  };
  users.push(userData);

  return userData.profile;
}

export function findUserByToken(token: string) {
  return users.find( it => it.token === token) ?? null;
}

export function getAllUsers(): UserProfile[] {
  return users.map( ({profile}) => profile);
}
