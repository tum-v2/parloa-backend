import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ success: false, message: 'Token not provided' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err, decoded) => {
    if (err) {
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    // If token is valid, attach the decoded payload to the request object
    req.body.decoded = decoded;
    next();
  });
}
