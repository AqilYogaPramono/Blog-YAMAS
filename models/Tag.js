const connection = require('../configs/database')

class Tag {
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT * FROM tag ORDER BY id ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getLatest(limit = 10) {
        const size = Number(limit) || 10
        try {
            const [rows] = await connection.query(`SELECT * FROM tag ORDER BY id DESC LIMIT ?`, [size])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getByIds(ids) {
        const normalized = (Array.isArray(ids) ? ids : [ids])
            .map((item) => (item || '').toString().trim())
            .filter(Boolean)

        const uniqueIds = [...new Set(normalized)]
        if (!uniqueIds.length) {
            return []
        }

        const placeholders = uniqueIds.map(() => '?').join(', ')
        try {
            const [rows] = await connection.query(`SELECT * FROM tag WHERE id IN (${placeholders}) ORDER BY id DESC`, uniqueIds)
            return rows
        } catch (err) {
            throw err
        }
    }

    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO tag SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE tag SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM tag WHERE id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM tag WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }

    static async checkTagCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT nama_tag FROM tag WHERE nama_tag = ?`, [data.nama_tag])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async checkTagUpdate(data, id) {
        try {
            const [rows] = await connection.query(`SELECT nama_tag FROM tag WHERE nama_tag = ? AND id != ?`, [data.nama_tag, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async searchByNama(nama) {
        try {
            const [rows] = await connection.query(`SELECT * FROM tag WHERE nama_tag LIKE ? ORDER BY id ASC`, [`%${nama}%`])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async searchByNamaLatest(nama, limit = 50) {
        const keyword = (nama || '').toString().trim()
        const size = Math.max(1, Math.min(Number(limit) || 50, 200))
        try {
            const [rows] = await connection.query(
                `SELECT * FROM tag WHERE nama_tag LIKE ? ORDER BY id DESC LIMIT ?`,
                [`%${keyword}%`, size]
            )
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getTag(limit, offset) {
        try {
            const [rows] = await connection.query(`SELECT * FROM tag ORDER BY id ASC LIMIT ? OFFSET ?`,[limit, offset])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async countTag() {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id) AS total FROM tag`)
            return rows[0].total
        } catch (err) {
            throw err
        }
    }

    static async checkTagUsed(id) {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id_blog) AS total FROM tag_blog WHERE id_tag = ?`, [id])
            return rows[0].total > 0
        } catch (err) {
            throw err
        }
    }
}

module.exports = Tag
