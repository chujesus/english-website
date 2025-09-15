const crypto = require('crypto');

const getSHA256 = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password, 'utf-8').digest('hex');
    return hash;
};

const getRandomSHA256 = () => {
    const randomBytes = crypto.randomBytes(64);
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(randomBytes).digest('hex');
    return hash;
};

const compareCrypto = (password, userPassword) => {
    const providedPasswordHash = getSHA256(password);
    return providedPasswordHash === userPassword;
};

module.exports = {
    getSHA256,
    getRandomSHA256,
    compareCrypto
};
