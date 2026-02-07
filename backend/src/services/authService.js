const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

class AuthService {
    static async login(email, password) {
        const user = await User.findByEmail(email);

        if (!user) {
            throw new ErrorResponse('Invalid credentials', 401);
        }

        const isMatch = await User.comparePassword(password, user.password_hash);

        if (!isMatch) {
            throw new ErrorResponse('Invalid credentials', 401);
        }

        const token = User.getSignedJwtToken(user.id);
        return { user, token };
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
