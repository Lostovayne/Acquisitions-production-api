export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  }),
  set: (res, name, value, options = {}) => {
    res.cookies.set(name, value, { ...cookies.getOptions(), ...options });
  },
  clear: (res, name, options = {}) => {
    res.clearCookie(name, { ...cookies.getOptions(), ...options });
  },
  get: (req, name) => req.cookies[name],
};
