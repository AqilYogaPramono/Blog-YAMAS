const express = require('express')
const Blog = require('../../models/Blog')
const Pegawai = require('../../models/Pegawai')
const { authManajer } = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authManajer, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        const flashedKeyword = req.flash('keyword')[0]
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const offset = (page - 1) * limit

        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

        const formatData = (rows) => {
            return rows.map(item => {
                const dateObj = new Date(item.dibuat_pada)
                const day = dateObj.getDate()
                const month = months[dateObj.getMonth()]
                const year = dateObj.getFullYear()
                const hours = String(dateObj.getHours()).padStart(2, '0')
                const minutes = String(dateObj.getMinutes()).padStart(2, '0')

                return {
                    ...item,
                    dibuat_pada_display: `${day} ${month} ${year} ${hours}:${minutes}`,
                    diverifikasi_oleh_display: item.diverifikasi_oleh || '-'
                }
            })
        }

        if (flashedKeyword) {
            const rows = await Blog.searchJudulBlogByStatusManajer(
                'Valid',
                flashedKeyword
            )

            const data = formatData(rows)

            return res.render('manajer/blog/blog-valid/index', {
                data,
                pegawai,
                page: 1,
                totalHalaman: 1,
                keyword: flashedKeyword
            })
        }

        const rows = await Blog.getByStatus('Valid', limit, offset)
        const data = formatData(rows)

        const totalData = await Blog.countByStatus('Valid')
        const totalHalaman = Math.ceil(totalData / limit)

        res.render('manajer/blog/blog-valid/index', {
            data,
            pegawai,
            page,
            totalHalaman
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/manajer/dashboard')
    }
})

router.post('/search', authManajer, async (req, res) => {
    try {
        const { judul } = req.body

        if (!judul || !judul.trim()) {
            return res.redirect('/manajer/blog-valid')
        }

        req.flash('keyword', judul)
        return res.redirect('/manajer/blog-valid')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/manajer/dashboard')
    }
})


router.get('/:id', authManajer, async (req, res) => {
    try {
        const {id} = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const blog = await Blog.getByIdWithRelationsForManajer(id)

        if (!blog) {
            req.flash('error', 'Blog tidak ditemukan')
            return res.redirect('/manajer/blog-valid')
        }

        if (blog.status !== 'Valid') {
            req.flash('error', 'Blog tidak dalam status Valid')
            return res.redirect('/manajer/blog-valid')
        }

        blog.foto_cover = Blog.normalizeImagePath(blog.foto_cover)

        res.render('manajer/blog/blog-valid/detail', {
            blog,
            pegawai
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/manajer/blog-valid')
    }
})

module.exports = router

