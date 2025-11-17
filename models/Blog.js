const connection = require('../configs/database')

class Blog {
    static async countAllBlogValid() {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS count_all_valid FROM blog WHERE status = ?',
                ['Valid']
            )
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async countAllBlogTidakValid() {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS count_all_tidak_valid FROM blog WHERE status = ?',
                ['Tidak Valid']
            )
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async countAllBlogProses() {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS count_all_proses FROM blog WHERE status = ?',
                ['Proses']
            )
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async countBlogValidByPegawai(pegawai) {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS count_all_valid FROM blog WHERE status = ? AND nama_pembuat = ?',
                ['Valid', pegawai.nama]
            )
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async countAllBlogTidakValidByPegawai(pegawai) {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS count_all_tidak_valid FROM blog WHERE status = ? AND nama_pembuat = ?',
                ['Tidak Valid', pegawai.nama]
            )
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async countAllBlogProsesByPegawai(pegawai) {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS count_all_proses FROM blog WHERE status = ? AND nama_pembuat = ?',
                ['Proses', pegawai.nama]
            )
            return rows[0]
        } catch (err) {
            throw err
        }
    }
}

module.exports = Blog