import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Verifies the token in the request header.
 * @param req - The request object.
 * @param res - The response object. Returns a success boolean.
 * @param next - The next function.
 * @throws Throws an error if the token is invalid.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Token not provided' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err) => {
    if (err) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    next();
  });
}
