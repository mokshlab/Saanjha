function getPasswordError(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters and include a letter and a number';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must be at least 8 characters and include a letter and a number';
  }
  return null;
}

module.exports = { getPasswordError };
