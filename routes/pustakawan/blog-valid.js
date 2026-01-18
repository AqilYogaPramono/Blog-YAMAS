const express = require('express')
const Blog = require('../../models/Blog')
const Pegawai = require('../../models/Pegawai')
const {authPustakawan} = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authPustakawan, async (req, res) => {
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
            const rows = await Blog.searchJudulBlogByStatus('Valid', flashedKeyword, req.session.pegawaiId)

            const data = formatData(rows)

            return res.render('pustakawan/blog/blog-valid/index', {
                data,
                pegawai,
                page: 1,
                totalHalaman: 1,
                keyword: flashedKeyword
            })
        }

        const rows = await Blog.getByStatusAndPegawai('Valid', req.session.pegawaiId, limit, offset)

        const data = formatData(rows)

        const totalData = await Blog.countByStatusAndPegawai('Valid', req.session.pegawaiId)

        const totalHalaman = Math.ceil(totalData / limit)

        res.render('pustakawan/blog/blog-valid/index', {
            data,
            pegawai,
            page,
            totalHalaman
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/dashboard')
    }
})

router.post('/search', authPustakawan, async (req, res) => {
    try {
        const { judul } = req.body

        if (!judul || !judul.trim()) {
            return res.redirect('/pustakawan/blog-valid')
        }

        req.flash('keyword', judul)
        return res.redirect('/pustakawan/blog-valid')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/dashboard')
    }
})


router.get('/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const blog = await Blog.getByIdWithRelations(id, req.session.pegawaiId)

        if (!blog) {
            req.flash('error', 'Blog tidak ditemukan')
            return res.redirect('/pustakawan/blog-valid')
        }

        if (blog.status !== 'Valid') {
            req.flash('error', 'Blog tidak dalam status Valid')
            return res.redirect('/pustakawan/blog-valid')
        }

        res.render('pustakawan/blog/blog-valid/detail', {
            blog,
            pegawai
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog-valid')
    }
})

module.exports = router

