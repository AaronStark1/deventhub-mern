// Where each role lands after login, or when bounced from a page it can't use.
export const HOME_BY_ROLE = {
  host: "/host/dashboard",
  user: "/events",
};

export const homeFor = (role) => HOME_BY_ROLE[role] ?? "/";
