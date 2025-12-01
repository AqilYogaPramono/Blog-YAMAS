const express = require('express')
const bcrypt = require('bcryptjs')

const Pegawai = require('../models/Pegawai')

const router = express.Router()

router.get('/masuk-pustakawan', async (req, res) => {
    try {
        res.render('auths/login-pustakawan', { data: req.flash('data')[0] })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.get('/masuk-manajer', async (req, res) => {
    try {
        res.render('auths/login-manajer', { data: req.flash('data')[0] })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/')
    }
})

router.post('/log-pustakawan', async (req, res) => {
    try {
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const pegawai = await Pegawai.login(data)
        if (!pegawai) {
            req.flash('error', 'Nomor Pegawai yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const aplikasiBlog = pegawai.aplikasi.find(
            app => app.nama_aplikasi == 'blog'
        )

        if (!aplikasiBlog) {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const hasPustakawanAccess = pegawai.aplikasi.some(
            app => app.nama_aplikasi == 'blog' && app.hak_akses == 'pustakawan'
        )

        if (!hasPustakawanAccess) {
            req.flash('error', 'Akun Anda tidak memiliki hak akses sebagai Pustakawan')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const now = new Date()
        const mulai = pegawai.periode_mulai ? new Date(pegawai.periode_mulai) : null
        const berakhir = pegawai.periode_berakhir ? new Date(pegawai.periode_berakhir) : null

        if (mulai !== null && berakhir !== null) {
            if (!(now >= mulai && now <= berakhir)) {
                req.flash('error', 'Akun Anda tidak aktif pada periode ini')
                req.flash('data', data)
                return res.redirect('/masuk-pustakawan')
            }
        }

        if (pegawai.status_akun != 'Aktif') {
            req.flash('error', 'Akun Anda belum aktif, silakan hubungi Admin')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        if (!await bcrypt.compare(kata_sandi, pegawai.kata_sandi)) {
            req.flash('error', 'Kata sandi yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        req.session.pegawaiId = pegawai.id
        req.session.hak_akses = 'pustakawan'
        req.flash('success', 'Anda berhasil masuk')
        return res.redirect('/pustakawan/dashboard')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/masuk-pustakawan')
    }
})

router.post('/log-manajer', async (req, res) => {
    try {
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const pegawai = await Pegawai.login(data)
        if (!pegawai) {
            req.flash('error', 'Nomor Pegawai yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const aplikasiBlog = pegawai.aplikasi.find(
            app => app.nama_aplikasi == 'blog'
        )

        if (!aplikasiBlog) {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const hasManajerAccess = pegawai.aplikasi.some(
            app => app.nama_aplikasi == 'blog' && app.hak_akses == 'manajer'
        )

        if (!hasManajerAccess) {
            req.flash('error', 'Akun Anda tidak memiliki hak akses sebagai Manajer')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const now = new Date()
        const mulai = pegawai.periode_mulai ? new Date(pegawai.periode_mulai) : null
        const berakhir = pegawai.periode_berakhir ? new Date(pegawai.periode_berakhir) : null

        if (mulai !== null && berakhir !== null) {
            if (!(now >= mulai && now <= berakhir)) {
                req.flash('error', 'Akun Anda tidak aktif pada periode ini')
                req.flash('data', data)
                return res.redirect('/masuk-manajer')
            }
        }

        if (pegawai.status_akun != 'Aktif') {
            req.flash('error', 'Akun Anda belum aktif, silakan hubungi Admin')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        if (!await bcrypt.compare(kata_sandi, pegawai.kata_sandi)) {
            req.flash('error', 'Kata sandi yang anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        req.session.pegawaiId = pegawai.id
        req.session.hak_akses = 'manajer'
        req.flash('success', 'Anda berhasil masuk')
        return res.redirect('/manajer/dashboard')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        res.redirect('/masuk-manajer')
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