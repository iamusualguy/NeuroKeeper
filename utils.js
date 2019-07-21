function isWindows() {
    return process.platform === 'win32';
}

module.exports = {
    isWindows: isWindows,
};