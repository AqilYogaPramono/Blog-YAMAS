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
                ['Tidak-Valid']
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
                ['Tidak-Valid', pegawai.nama]
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

    static async generateTautan(judul, excludeId = null) {
        try {
            let baseTautan = judul
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()

            let tautan = baseTautan
            let counter = 1

            while (true) {
                let query = 'SELECT id FROM blog WHERE tautan = ?'
                let params = [tautan]
                
                if (excludeId) {
                    query += ' AND id != ?'
                    params.push(excludeId)
                }

                const [rows] = await connection.query(query, params)

                if (rows.length === 0) {
                    break
                }

                tautan = `${baseTautan}-${counter}`
                counter++
            }

            return tautan
        } catch (err) {
            throw err
        }
    }

    static async store(data) {
        try {
            const [result] = await connection.query('INSERT INTO blog SET ?', [data])
            return result
        } catch (err) {
            throw err
        }
    }

    static async storeTagBlog(idBlog, idTag) {
        try {
            await connection.query(
                'INSERT INTO tag_blog (id_blog, id_tag) VALUES (?, ?)',
                [idBlog, idTag]
            )
        } catch (err) {
            throw err
        }
    }

    static async storeKategoriBlog(idBlog, idKategori) {
        try {
            await connection.query(
                'INSERT INTO kategori_blog (id_blog, id_kategori) VALUES (?, ?)',
                [idBlog, idKategori]
            )
        } catch (err) {
            throw err
        }
    }

    static async storeSumber(idBlog, namaSumber) {
        try {
            await connection.query(
                'INSERT INTO sumber (id_blog, nama_sumber) VALUES (?, ?)',
                [idBlog, namaSumber]
            )
        } catch (err) {
            throw err
        }
    }

    static async getByStatusAndPegawai(status, idPegawai, limit, offset) {
        try {
            const [rows] = await connection.query(
                'SELECT id, tautan, judul, nama_pembuat, status, dibuat_pada, diverifikasi_oleh FROM blog WHERE status = ? AND id_pegawai = ? ORDER BY dibuat_pada DESC LIMIT ? OFFSET ?',
                [status, idPegawai, limit, offset]
            )
            return rows
        } catch (err) {
            throw err
        }
    }

    static async countByStatusAndPegawai(status, idPegawai) {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS total FROM blog WHERE status = ? AND id_pegawai = ?',
                [status, idPegawai]
            )
            return rows[0].total
        } catch (err) {
            throw err
        }
    }

    static normalizeImagePath(imagePath) {
        if (!imagePath) {
            return null
        }

        const trimmedPath = imagePath.trim()
        if (/^https?:\/\//i.test(trimmedPath)) {
            return trimmedPath
        }

        const cleanedPath = trimmedPath.replace(/^public\//i, '')
        return cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`
    }

    static async getByIdWithRelations(id, idPegawai) {
        try {
            const [blogRows] = await connection.query(
                'SELECT * FROM blog WHERE id = ? AND id_pegawai = ?',
                [id, idPegawai]
            )
            
            if (blogRows.length === 0) {
                return null
            }

            const blog = blogRows[0]
            blog.foto_cover = Blog.normalizeImagePath(blog.foto_cover)

            const [kategoriRows] = await connection.query(
                `SELECT k.id, k.nama_kategori 
                 FROM kategori k 
                 INNER JOIN kategori_blog kb ON k.id = kb.id_kategori 
                 WHERE kb.id_blog = ?`,
                [id]
            )

            const [tagRows] = await connection.query(
                `SELECT t.id, t.nama_tag 
                 FROM tag t 
                 INNER JOIN tag_blog tb ON t.id = tb.id_tag 
                 WHERE tb.id_blog = ?`,
                [id]
            )

            const [sumberRows] = await connection.query(
                'SELECT nama_sumber FROM sumber WHERE id_blog = ?',
                [id]
            )

            blog.kategori = kategoriRows
            blog.tag = tagRows
            blog.sumber = sumberRows.map(s => s.nama_sumber)

            return blog
        } catch (err) {
            throw err
        }
    }

    static async getByIdForEdit(id, idPegawai, status) {
        try {
            const [blogRows] = await connection.query(
                'SELECT * FROM blog WHERE id = ? AND id_pegawai = ? AND status = ?',
                [id, idPegawai, status]
            )
            
            if (blogRows.length === 0) {
                return null
            }

            const blog = blogRows[0]
            blog.foto_cover = Blog.normalizeImagePath(blog.foto_cover)

            const [kategoriRows] = await connection.query(
                `SELECT k.id, k.nama_kategori 
                 FROM kategori k 
                 INNER JOIN kategori_blog kb ON k.id = kb.id_kategori 
                 WHERE kb.id_blog = ?`,
                [id]
            )

            const [tagRows] = await connection.query(
                `SELECT t.id, t.nama_tag 
                 FROM tag t 
                 INNER JOIN tag_blog tb ON t.id = tb.id_tag 
                 WHERE tb.id_blog = ?`,
                [id]
            )

            const [sumberRows] = await connection.query(
                'SELECT nama_sumber FROM sumber WHERE id_blog = ?',
                [id]
            )

            blog.kategori = kategoriRows
            blog.tag = tagRows
            blog.sumber = sumberRows.map(s => s.nama_sumber)

            return blog
        } catch (err) {
            throw err
        }
    }

    static async deleteTagBlog(idBlog) {
        try {
            await connection.query(
                'DELETE FROM tag_blog WHERE id_blog = ?',
                [idBlog]
            )
        } catch (err) {
            throw err
        }
    }

    static async deleteKategoriBlog(idBlog) {
        try {
            await connection.query(
                'DELETE FROM kategori_blog WHERE id_blog = ?',
                [idBlog]
            )
        } catch (err) {
            throw err
        }
    }

    static async deleteSumber(idBlog) {
        try {
            await connection.query(
                'DELETE FROM sumber WHERE id_blog = ?',
                [idBlog]
            )
        } catch (err) {
            throw err
        }
    }

    static async update(id, data) {
        try {
            await connection.query(
                'UPDATE blog SET ?, status = "Proses" WHERE id = ?',
                [data, id]
            )
        } catch (err) {
            throw err
        }
    }

    static async getByStatus(status, limit, offset) {
        try {
            const [rows] = await connection.query(
                'SELECT id, tautan, judul, nama_pembuat, status, dibuat_pada, diverifikasi_oleh FROM blog WHERE status = ? ORDER BY dibuat_pada DESC LIMIT ? OFFSET ?',
                [status, limit, offset]
            )
            return rows
        } catch (err) {
            throw err
        }
    }

    static async countByStatus(status) {
        try {
            const [rows] = await connection.query(
                'SELECT COUNT(id) AS total FROM blog WHERE status = ?',
                [status]
            )
            return rows[0].total
        } catch (err) {
            throw err
        }
    }

    static async getByIdWithRelationsForManajer(id) {
        try {
            const [blogRows] = await connection.query(
                'SELECT * FROM blog WHERE id = ?',
                [id]
            )
            
            if (blogRows.length === 0) {
                return null
            }

            const blog = blogRows[0]
            blog.foto_cover = Blog.normalizeImagePath(blog.foto_cover)

            const [kategoriRows] = await connection.query(
                `SELECT k.id, k.nama_kategori 
                 FROM kategori k 
                 INNER JOIN kategori_blog kb ON k.id = kb.id_kategori 
                 WHERE kb.id_blog = ?`,
                [id]
            )

            const [tagRows] = await connection.query(
                `SELECT t.id, t.nama_tag 
                 FROM tag t 
                 INNER JOIN tag_blog tb ON t.id = tb.id_tag 
                 WHERE tb.id_blog = ?`,
                [id]
            )

            const [sumberRows] = await connection.query(
                'SELECT nama_sumber FROM sumber WHERE id_blog = ?',
                [id]
            )

            blog.kategori = kategoriRows
            blog.tag = tagRows
            blog.sumber = sumberRows.map(s => s.nama_sumber)

            return blog
        } catch (err) {
            throw err
        }
    }

    static async updateStatus(id, status, diverifikasiOleh, catatanManajer) {
        try {
            const updateData = {
                status,
                diverifikasi_oleh: diverifikasiOleh,
                diverifikasi_pada: new Date(),
                catatan_manajer: catatanManajer.trim()
            }

            await connection.query(
                'UPDATE blog SET ? WHERE id = ?',
                [updateData, id]
            )
        } catch (err) {
            throw err
        }
    }

    static async getAllValidOrderedByVerified(limit = 50, offset = 0) {
        try {
            const size = Number(limit) || 50
            const start = Number(offset) || 0

            const [rows] = await connection.query(
                `SELECT id, tautan, judul, foto_cover, ringkasan, nama_pembuat, dibuat_pada 
                 FROM blog 
                 WHERE status = 'Valid' 
                 ORDER BY diverifikasi_pada DESC, dibuat_pada DESC 
                 LIMIT ? OFFSET ?`,
                [size, start]
            )

            return rows
        } catch (err) {
            throw err
        }
    }

    static async getBySlugWithRelations(tautan) {
        try {
            const [blogRows] = await connection.query(
                'SELECT * FROM blog WHERE tautan = ? AND status = "Valid" LIMIT 1',
                [tautan]
            )

            const blog = blogRows[0]
            const id = blog.id
            blog.foto_cover = Blog.normalizeImagePath(blog.foto_cover)

            const [kategoriRows] = await connection.query(
                `SELECT k.id, k.nama_kategori 
                 FROM kategori k 
                 INNER JOIN kategori_blog kb ON k.id = kb.id_kategori 
                 WHERE kb.id_blog = ?`,
                [id]
            )

            const [tagRows] = await connection.query(
                `SELECT t.id, t.nama_tag 
                 FROM tag t 
                 INNER JOIN tag_blog tb ON t.id = tb.id_tag 
                 WHERE tb.id_blog = ?`,
                [id]
            )

            blog.kategori = kategoriRows
            blog.tag = tagRows

            return blog
        } catch (err) {
            throw err
        }
    }

    static async getRandomRelatedByBlogId(idBlog) {
        try {

            const [rows] = await connection.query(
                `SELECT DISTINCT b.id, b.tautan, b.judul, b.foto_cover, b.dibuat_pada
                 FROM blog b
                 LEFT JOIN tag_blog tb ON b.id = tb.id_blog
                 LEFT JOIN kategori_blog kb ON b.id = kb.id_blog
                 WHERE b.status = 'Valid'
                   AND b.id != ?
                   AND (
                        tb.id_tag IN (SELECT id_tag FROM tag_blog WHERE id_blog = ?)
                        OR kb.id_kategori IN (SELECT id_kategori FROM kategori_blog WHERE id_blog = ?)
                   )
                 ORDER BY RAND()
                 LIMIT 5`,
                [idBlog, idBlog, idBlog]
            )

            return rows
        } catch (err) {
            throw err
        }
    }

    static async getValidByTagId(idTag, limit = 50, offset = 0) {
        try {
            const size = Number(limit) || 50
            const start = Number(offset) || 0

            const [rows] = await connection.query(
                `SELECT b.id, b.tautan, b.judul, b.foto_cover, b.ringkasan, 
                        b.nama_pembuat, b.dibuat_pada
                 FROM blog b
                 INNER JOIN tag_blog tb ON b.id = tb.id_blog
                 WHERE b.status = 'Valid' AND tb.id_tag = ?
                 ORDER BY b.diverifikasi_pada DESC, b.dibuat_pada DESC
                 LIMIT ? OFFSET ?`,
                [idTag, size, start]
            )

            return rows
        } catch (err) {
            throw err
        }
    }

    static async getValidByKategoriId(idKategori, limit = 50, offset = 0) {
        try {
            const size = Number(limit) || 50
            const start = Number(offset) || 0

            const [rows] = await connection.query(
                `SELECT b.id, b.tautan, b.judul, b.foto_cover, b.ringkasan, 
                        b.nama_pembuat, b.dibuat_pada
                 FROM blog b
                 INNER JOIN kategori_blog kb ON b.id = kb.id_blog
                 WHERE b.status = 'Valid' AND kb.id_kategori = ?
                 ORDER BY b.diverifikasi_pada DESC, b.dibuat_pada DESC
                 LIMIT ? OFFSET ?`,
                [idKategori, size, start]
            )

            return rows.map((row) => ({
                ...row,
                foto_cover: Blog.normalizeImagePath(row.foto_cover)
            }))
        } catch (err) {
            throw err
        }
    }
}

module.exports = Blog
