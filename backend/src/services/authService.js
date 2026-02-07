const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const jwt = require('jsonwebtoken');

class AuthService {
    static async login(email, password) {
        const user = await User.findWithPassword(email);

        if (!user) {
            throw new ErrorResponse('Invalid credentials', 401);
        }

        const isMatch = await User.comparePassword(password, user.password_hash);

        if (!isMatch) {
            throw new ErrorResponse('Invalid credentials', 401);
        }

        // Remove password from output
        delete user.password_hash;

        const accessToken = User.getSignedJwtToken(user.id);
        const refreshToken = User.getSignedRefreshToken(user.id);

        return { user, accessToken, refreshToken };
    }

    static async refreshToken(token) {
        if (!token) {
            throw new ErrorResponse('No refresh token provided', 401);
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                throw new ErrorResponse('User not found', 404);
            }

            const accessToken = User.getSignedJwtToken(user.id);
            return { accessToken };
        } catch (err) {
            throw new ErrorResponse('Invalid refresh token', 401);
        }
    }

    static async getMe(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }
        return user;
    }
}

module.exports = AuthService;
