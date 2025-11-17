const express = require('express')
const bcrypt = require('bcryptjs')

const Pegawai = require('../models/Pegawai')

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        res.render('auths/login', { data: req.flash('data')[0] })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.post('/log', async (req, res) => {
    try {
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/')
        }

        const pegawai = await Pegawai.login(data)
        if (!pegawai) {
            req.flash('error', 'Nomor Pegawai yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/')
        }

        const aplikasiBlog = pegawai.aplikasi.find(
            app => app.nama_aplikasi == 'blog'
        )

        if (!aplikasiBlog) {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (aplikasiBlog.hak_akses != "pustakawan" && aplikasiBlog.hak_akses != "manajer") {
            req.flash('error', 'Akun Anda tidak memiliki hak akses yang sesuai')
            req.flash('data', data)
            return res.redirect('/')
        }

        const now = new Date()
        const mulai = pegawai.periode_mulai ? new Date(pegawai.periode_mulai) : null
        const berakhir = pegawai.periode_berakhir ? new Date(pegawai.periode_berakhir) : null

        if (mulai !== null && berakhir !== null) {
            if (!(now >= mulai && now <= berakhir)) {
                req.flash('error', 'Akun Anda tidak aktif pada periode ini')
                req.flash('data', data)
                return res.redirect('/')
            }
        }

        if (pegawai.status_akun != 'Aktif') {
            req.flash('error', 'Akun Anda belum aktif, silakan hubungi Admin')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (!await bcrypt.compare(kata_sandi, pegawai.kata_sandi)) {
            req.flash('error', 'Kata sandi yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/')
        }

        req.session.pegawaiId = pegawai.id
        req.session.hak_akses = aplikasiBlog.hak_akses
        req.flash('success', 'Anda berhasil masuk')

        if (aplikasiBlog.hak_akses == 'pustakawan') {
            return res.redirect('/pustakawan/dashboard')
        }

        if (aplikasiBlog.hak_akses == 'manajer') {
            return res.redirect('/manajer/dashboard')
        }

        return res.redirect('/')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.get('/logout', async(req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        if (req.session.hak_akses == "pustakawan") return res.redirect('/pustakawan/dashboard')
        if (req.session.hak_akses == "manajer") return res.redirect('/manajer/dashboard')
        return res.redirect('/')
    }
})

module.exports = router