const express = require('express')

const Pegawai = require('../../models/Pegawai')
const Blog = require('../../models/Blog')
const { authPustakawan } = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const countAllBlogValid = await Blog.countAllBlogValid()
        const countAllBlogTidakValid = await Blog.countAllBlogTidakValid()
        const countAllBlogProses = await Blog.countAllBlogProses()

        res.render('pustakawan/dashboard', {
            pegawai,
            countAllBlogValid,
            countAllBlogTidakValid,
            countAllBlogProses
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/')
    }
})

module.exports = router