const express = require('express')

const Pegawai = require('../../models/Pegawai')
const Blog = require('../../models/Blog')
const { authManajer } = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authManajer, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const [countBlogValid, countBlogTidakValid, countBlogProses] = await Promise.all([
            Blog.countBlogValidByPegawai(pegawai),
            Blog.countAllBlogTidakValidByPegawai(pegawai),
            Blog.countAllBlogProsesByPegawai(pegawai)
        ])

        res.render('manajer/dashboard', {
            pegawai,
            countBlogValid,
            countBlogTidakValid,
            countBlogProses
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/')
    }
})

module.exports = router