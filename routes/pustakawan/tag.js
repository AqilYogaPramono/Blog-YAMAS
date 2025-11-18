const express = require('express')

const Tag = require('../../models/Tag')
const Pegawai = require('../../models/Pegawai')
const {authPustakawan} = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = await Tag.getAll()

        res.render('pustakawan/tag/index', {data, pegawai})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/tag')
    }
})

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        res.render('pustakawan/tag/buat', { 
            pegawai,
            data: req.flash('data')[0]
        })
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/tag')
    }
})

router.post('/create', authPustakawan, async (req, res) => {
    try {
        const {nama_tag} = req.body

        const data = {nama_tag}

        if (!data.nama_tag) {
            req.flash("error", "Nama tag tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/tag/buat')
        }

        if (await Tag.checkTagCreate(data)) {
            req.flash("error", "Tag sudah dibuat")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/tag/buat')
        }

        await Tag.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/pustakawan/tag')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/tag')
    }
})

router.get('/edit/:id', authPustakawan, async(req, res) => {
    try {
        const {id} = req.params

        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = await Tag.getById(id)

        res.render('pustakawan/tag/edit', {data, pegawai})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/tag')
    }
})

router.post('/update/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params
        const {nama_tag} = req.body

        const data = {nama_tag}
        
        if (!nama_tag) {
            req.flash("error", "Nama tag tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/tag/edit/${id}`)
        }

        if (await Tag.checkTagUpdate(data, id)) {
            req.flash("error", "Tag sudah dibuat")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/tag/edit/${id}`)
        }

        await Tag.update(data, id)
        req.flash('success', 'Data Berhasil Diedit')
        res.redirect('/pustakawan/tag')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        req.flash('data', req.body)
        return res.redirect('/pustakawan/tag')
    }
})

router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params

        await Tag.delete(id)
        req.flash('success', 'Data Berhasil Dihapus')
        res.redirect('/pustakawan/tag')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/tag')
    }
})

module.exports = router
