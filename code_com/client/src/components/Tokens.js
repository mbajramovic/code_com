var jwt = require('jsonwebtoken');

module.exports = {
    generisiToken : function(user) {
        var u = {
            name : user.korisnickoIme
        };

        return token = jwt.sign(u, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
         });
    }
}