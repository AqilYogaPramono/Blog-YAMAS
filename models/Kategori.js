const connection = require('../configs/database')

class Kategori {
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT * FROM kategori ORDER BY id ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getLatest(limit = 10) {
        const size = Number(limit) || 10
        try {
            const [rows] = await connection.query(`SELECT * FROM kategori ORDER BY id DESC LIMIT ?`, [size])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO kategori SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE kategori SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM kategori WHERE id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM kategori WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }

    static async checkKategoriCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT nama_kategori FROM kategori WHERE nama_kategori = ?`, [data.nama_kategori])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async checkKategoriUpdate(data, id) {
        try {
            const [rows] = await connection.query(`SELECT nama_kategori FROM kategori WHERE nama_kategori = ? AND id != ?`, [data.nama_kategori, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async searchByNama(nama) {
        try {
            const [rows] = await connection.query(
                `SELECT * FROM kategori WHERE nama_kategori LIKE ? ORDER BY id ASC`,
                [`%${nama}%`]
            )
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getKategori(limit, offset) {
        try {
            const [rows] = await connection.query(
                `SELECT * FROM kategori ORDER BY id ASC LIMIT ? OFFSET ?`,
                [limit, offset]
            )
            return rows
        } catch (err) {
            throw err
        }
    }

    static async countKategori() {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id) AS total FROM kategori`)
            return rows[0].total
        } catch (err) {
            throw err
        }
    }

    static async checkKategoriUsed(id) {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id_blog) AS total FROM kategori_blog WHERE id_kategori = ?`,[id])
            return rows[0].total > 0
        } catch (err) {
            throw err
        }
    }
}

module.exports = Kategori
