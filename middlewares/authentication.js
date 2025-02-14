const { validateToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            
            return next(); // Call next() here to pass control if no cookie is present
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
           
        } catch (error) {
            console.error('Invalid token:', error); // Log the error for debugging
        }

        return next(); // Call next() here to pass control to the next middleware or route handler
    }
}

module.exports = {
    checkForAuthenticationCookie,
};
