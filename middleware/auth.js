import jwt from "jsonwebtoken";

export const checkForAuthenticationCookies = (req, res, next) => {
  const token = req.cookies.token;
  if (!token){
    console.log("No token provided, redirecting to signin");
    return res.status(401).json({ error: "No token provided" });
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
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
