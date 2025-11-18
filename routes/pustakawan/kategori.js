const express = require('express')

const Kategori = require('../../models/Kategori')
const Pegawai = require('../../models/Pegawai')
const {authPustakawan} = require('../../middlewares/auth')

const router = express.Router()

router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = await Kategori.getAll()

        res.render('pustakawan/kategori/index', {data, pegawai})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/kategori')
    }
})

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        res.render('pustakawan/kategori/buat', { 
            pegawai,
            data: req.flash('data')[0]
        })
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/kategori')
    }
})

router.post('/create', authPustakawan, async (req, res) => {
    try {
        const {nama_kategori} = req.body

        const data = {nama_kategori}

        if (!data.nama_kategori) {
            req.flash("error", "Nama kategori tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/kategori/buat')
        }

        if (await Kategori.checkKategoriCreate(data)) {
            req.flash("error", "Kategori sudah dibuat")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/kategori/buat')
        }

        await Kategori.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/pustakawan/kategori')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/kategori')
    }
})

router.get('/edit/:id', authPustakawan, async(req, res) => {
    try {
        const {id} = req.params

        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = await Kategori.getById(id)

        res.render('pustakawan/kategori/edit', {data, pegawai})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/kategori')
    }
})

router.post('/update/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params
        const {nama_kategori} = req.body

        const data = {nama_kategori}
        
        if (!nama_kategori) {
            req.flash("error", "Nama kategori tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/kategori/edit/${id}`)
        }

        if (await Kategori.checkKategoriUpdate(data, id)) {
            req.flash("error", "Kategori sudah dibuat")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/kategori/edit/${id}`)
        }

        await Kategori.update(data, id)
        req.flash('success', 'Data Berhasil Diedit')
        res.redirect('/pustakawan/kategori')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        req.flash('data', req.body)
        return res.redirect('/pustakawan/kategori')
    }
})

router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params

        await Kategori.delete(id)
        req.flash('success', 'Data Berhasil Dihapus')
        res.redirect('/pustakawan/kategori')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/kategori')
    }
})

module.exports = router
