import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Auth Middleware: Token received", token.substring(0, 10) + "...");
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            console.log("Auth Middleware: Decoded ID", decoded.id);
            req.user = await User.findById(decoded.id).select('-password');
            console.log("Auth Middleware: User found?", !!req.user);

            if (!req.user) {
                console.log("Auth Middleware: User not found in DB");
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const optionalProtect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Optional auth failure is ignored
            req.user = undefined;
        }
    }
    next();
};

