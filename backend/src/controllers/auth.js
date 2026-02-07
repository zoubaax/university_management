const AuthService = require('../services/authService');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.login(email, password);
        sendTokenResponse(token, 200, res);
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await AuthService.getMe(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, data: {} });
};

const sendTokenResponse = (token, statusCode, res) => {
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') options.secure = true;
    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};
