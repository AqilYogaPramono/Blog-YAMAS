const express = require('express')
const bcrypt = require('bcryptjs')

const Pegawai = require('../../models/Pegawai')
const { authPustakawan } = require('../../middlewares/auth')

const router = express.Router()

router.get('/ubah-kata-sandi', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        res.render('pustakawan/ubah-kata-sandi', {
            pegawai,
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Terjadi kesalahan saat memuat halaman')
        res.redirect('/pustakawan/dashboard')
    }
})

router.post('/ubah-kata-sandi', authPustakawan, async (req, res) => {
    try {
        const { kata_sandi, kata_sandi_baru, konfirmasi_kata_sandi_baru } = req.body
        const data = { kata_sandi, kata_sandi_baru, konfirmasi_kata_sandi_baru }

        if (!kata_sandi) {
            req.flash('error', 'Kata sandi lama wajib diisi')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (!kata_sandi_baru) {
            req.flash('error', 'Kata sandi baru wajib diisi')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (!konfirmasi_kata_sandi_baru) {
            req.flash('error', 'Konfirmasi kata sandi baru wajib diisi')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        const pegawai = await Pegawai.getById(req.session.pegawaiId)

        if (!pegawai) {
            req.flash('error', 'Data pegawai tidak ditemukan')
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        const isPasswordMatch = await bcrypt.compare(kata_sandi, pegawai.kata_sandi)
        if (!isPasswordMatch) {
            req.flash('error', 'Kata sandi lama yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (kata_sandi_baru.length < 6) {
            req.flash('error', 'Kata sandi baru minimal 6 karakter')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (!/[A-Z]/.test(kata_sandi_baru)) {
            req.flash('error', 'Kata sandi baru minimal mengandung 1 huruf kapital')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (!/[a-z]/.test(kata_sandi_baru)) {
            req.flash('error', 'Kata sandi baru minimal mengandung 1 huruf kecil')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (!/\d/.test(kata_sandi_baru)) {
            req.flash('error', 'Kata sandi baru minimal mengandung 1 angka')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        if (kata_sandi_baru !== konfirmasi_kata_sandi_baru) {
            req.flash('error', 'Konfirmasi kata sandi baru tidak sesuai')
            req.flash('data', data)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }
        
        await Pegawai.changePassword(req.session.pegawaiId, data)
        req.flash('success', 'Kata sandi berhasil diperbarui')
        res.redirect('/pustakawan/dashboard')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/pustakawan/dashboard')
    }
})

module.exports = router