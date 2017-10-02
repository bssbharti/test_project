module.exports = (req, res, next) => {
  let password = req.body.password;
  if (!password) return res.json({ status: 'error', message: 'password is required' });
  if (password.length < 8) return res.json({ status: 'error', message: 'Password should have at least 8 characters' });
  let hasCapitalAlpabet = false;
  let hasNumber = false;
  // let hasSpecialCharacter = false;
  for (let i = 0; i < password.length; i++) {
    let charCode = password.charCodeAt(i);
    if (parseInt(password[i]) > -1) {
      hasNumber = true;
    } else if (charCode >= 65 && charCode <= 90) {
      hasCapitalAlpabet = true;
    }
    // else if ((charCode >= 32 && charCode <= 47) || (charCode >= 58 && charCode <= 64) || (charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 127)) {
    //   hasSpecialCharacter = true;
    // }
  }
  if (hasCapitalAlpabet && hasNumber) {
    next();
  } else {
    return res.json({ status: 'error', message: 'Passwords require 8 characters minimum, 1 number and 1 cap. Please check your password and try again.' });
  }
};