const onlyDomain = {
    origin: function (origin, callback) {
        const allowedOrigin = process.env.ALLOWED_ORIGIN
        if (!origin || origin === allowedOrigin) {
            callback(null, true)
        } else {
            return res.status(403).json({
                status: false,
                message: 'Akses Ditolak'
            })
        }
    },
    credentials: true
}

module.exports = { onlyDomain }