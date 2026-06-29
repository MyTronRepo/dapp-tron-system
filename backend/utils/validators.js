const isValidTronAddress = (address) => {

    if (!address) return false;

    return /^T[a-zA-Z0-9]{33}$/.test(address);

};

const isValidLatitude = (latitude) => {

    return latitude >= -90 && latitude <= 90;

};

const isValidLongitude = (longitude) => {

    return longitude >= -180 && longitude <= 180;

};

const isValidBuildYear = (year) => {

    const currentYear = new Date().getFullYear();

    return year >= 1800 && year <= currentYear;

};

module.exports = {

    isValidTronAddress,

    isValidLatitude,

    isValidLongitude,

    isValidBuildYear

};