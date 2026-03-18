import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Not authorized"));
  }
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      res.status(401);
      return next(new Error("Not authorized"));
    }
    req.admin = admin;
    next();
  } catch (err) {
    res.status(401);
    next(new Error("Token invalid"));
  }
};
