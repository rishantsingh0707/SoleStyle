import jwt from "jsonwebtoken";

export const checkForAuthenticationCookies = (req, res, next) => {
  const token = req.cookies.token;
  if (!token){
    console.log("No token provided, redirecting to signin");
    req.flash("Error","No token Provided")
    return res.redirect("/")
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.flash("Error","Invalid Token")
    res.redirect("/");
  }
};

export const attachUserIfExists = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.user = null; 
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
};
