const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { convertImageFile } = require('../../middlewares/convertImage')

const Blog = require('../../models/Blog')
const Kategori = require('../../models/Kategori')
const Tag = require('../../models/Tag')
const Pegawai = require('../../models/Pegawai')
const { authPustakawan } = require('../../middlewares/auth')

const router = express.Router()

const toArray = (value) => {
    if (typeof value === 'undefined' || value === null) return []
    return Array.isArray(value) ? value : [value]
}

const normalizeIds = (value) => {
    return [...new Set(toArray(value).map((item) => item && item.toString()).filter(Boolean))]
}

const normalizeTextArray = (value) => {
    return toArray(value)
        .map((item) => (item || '').toString().trim())
        .filter(Boolean)
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/images/blog')
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({storage})

const deleteUploadedFile = (file) => {
    if (file && file.path) {
        const filePath = path.join(__dirname, '../../public/images/blog', file.filename)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    }
}

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const kategori = await Kategori.getAll()
        const tag = await Tag.getAll()

        res.render('pustakawan/blog/buat', {
            pegawai,
            kategori,
            tag,
            data: req.flash('data')[0] || {}
        })
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal Server Error')
        return res.redirect('/pustakawan/dashboard')
    }
})

router.post('/upload-gambar', authPustakawan, upload.single('gambar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file yang diupload' })
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (!allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)
            return res.status(400).json({ error: 'Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan' })
        }

        const inputPath = req.file.path
        const result = await convertImageFile(inputPath)

        if (!result) {
            deleteUploadedFile(req.file)
            return res.status(500).json({ error: 'Gagal memproses gambar' })
        }

        const relativePath = '/images/blog/' + path.basename(result.outputPath)

        res.json({ url: relativePath })
    } catch (err) {
        console.error(err)
        if (req.file) {
            deleteUploadedFile(req.file)
        }
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.post('/create', authPustakawan, async (req, res) => {
    try {
        const {judul, ringkasan, nama_pembuat, isi, kategori, tag, sumber} = req.body
        
        const rawIsi = typeof isi === 'string' ? isi : ''
        const payload = {
            judul: (judul || '').trim(),
            ringkasan: (ringkasan || '').trim(),
            nama_pembuat: (nama_pembuat || '').trim(),
            isi: rawIsi
        }

        const kategoriSelected = normalizeIds(kategori || req.body['kategori[]'])
        const tagSelected = normalizeIds(tag || req.body['tag[]'])
        const sumberInputs = toArray(sumber || req.body['sumber[]'])
        const sumberNormalized = normalizeTextArray(sumberInputs)

        const flashData = {
            ...payload,
            kategori: kategoriSelected,
            tag: tagSelected,
            sumber: sumberInputs.length ? sumberInputs : ['']
        }

        if (!payload.judul) {
            req.flash("error", "Judul tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        if (!payload.ringkasan) {
            req.flash("error", "Ringkasan tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        if (!payload.nama_pembuat) {
            req.flash("error", "Nama pembuat tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        const cleanedIsi = rawIsi.replace(/<(.|\n)*?>/g, '').trim()
        if (!rawIsi || !cleanedIsi) {
            req.flash("error", "Isi blog tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        const pegawai = await Pegawai.getById(req.session.pegawaiId)
        const tautan = await Blog.generateTautan(payload.judul)
        const blogData = {
            tautan,
            judul: payload.judul,
            ringkasan: payload.ringkasan,
            nama_pembuat: payload.nama_pembuat,
            isi: payload.isi,
            id_pegawai: req.session.pegawaiId,
            dibuat_oleh: pegawai.nama
        }

        const result = await Blog.store(blogData)
        const idBlog = result.insertId

        if (tagSelected.length) {
            await Promise.all(
                tagSelected.map((idTag) => Blog.storeTagBlog(idBlog, idTag))
            )
        }

        if (kategoriSelected.length) {
            await Promise.all(
                kategoriSelected.map((idKategori) => Blog.storeKategoriBlog(idBlog, idKategori))
            )
        }

        if (sumberNormalized.length) {
            await Promise.all(
                sumberNormalized.map((namaSumber) => Blog.storeSumber(idBlog, namaSumber))
            )
        }

        req.flash('success', 'Blog berhasil dibuat')
        return res.redirect('/pustakawan/blog')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog/buat')
    }
})

router.post('/kategori/create', authPustakawan, async (req, res) => {
    try {
        const {nama_kategori, judul, ringkasan, nama_pembuat, isi, kategori, tag, sumber} = req.body

        const data = {nama_kategori}

        if (!data.nama_kategori) {
            req.flash("error", "Nama kategori tidak boleh kosong")
            if (judul || ringkasan || nama_pembuat || isi) {
                const flashData = {
                    judul: judul || '',
                    ringkasan: ringkasan || '',
                    nama_pembuat: nama_pembuat || '',
                    isi: isi || '',
                    kategori: kategori || [],
                    tag: tag || [],
                    sumber: sumber || []
                }
                req.flash('data', flashData)
            }
            return res.redirect('/pustakawan/blog/buat')
        }

        if (await Kategori.checkKategoriCreate(data)) {
            req.flash("error", "Kategori sudah dibuat")
            if (judul || ringkasan || nama_pembuat || isi) {
                const flashData = {
                    judul: judul || '',
                    ringkasan: ringkasan || '',
                    nama_pembuat: nama_pembuat || '',
                    isi: isi || '',
                    kategori: kategori || [],
                    tag: tag || [],
                    sumber: sumber || []
                }
                req.flash('data', flashData)
            }
            return res.redirect('/pustakawan/blog/buat')
        }

        await Kategori.store(data)
        req.flash('success', 'Kategori berhasil ditambahkan')
        if (judul || ringkasan || nama_pembuat || isi) {
            const flashData = {
                judul: judul || '',
                ringkasan: ringkasan || '',
                nama_pembuat: nama_pembuat || '',
                isi: isi || '',
                kategori: kategori || [],
                tag: tag || [],
                sumber: sumber || []
            }
            req.flash('data', flashData)
        }
        res.redirect('/pustakawan/blog/buat')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog/buat')
    }
})

router.post('/tag/create', authPustakawan, async (req, res) => {
    try {
        const {nama_tag, judul, ringkasan, nama_pembuat, isi, kategori, tag, sumber} = req.body

        const data = {nama_tag}

        if (!data.nama_tag) {
            req.flash("error", "Nama tag tidak boleh kosong")
            if (judul || ringkasan || nama_pembuat || isi) {
                const flashData = {
                    judul: judul || '',
                    ringkasan: ringkasan || '',
                    nama_pembuat: nama_pembuat || '',
                    isi: isi || '',
                    kategori: kategori || [],
                    tag: tag || [],
                    sumber: sumber || []
                }
                req.flash('data', flashData)
            }
            return res.redirect('/pustakawan/blog/buat')
        }

        if (await Tag.checkTagCreate(data)) {
            req.flash("error", "Tag sudah dibuat")
            if (judul || ringkasan || nama_pembuat || isi) {
                const flashData = {
                    judul: judul || '',
                    ringkasan: ringkasan || '',
                    nama_pembuat: nama_pembuat || '',
                    isi: isi || '',
                    kategori: kategori || [],
                    tag: tag || [],
                    sumber: sumber || []
                }
                req.flash('data', flashData)
            }
            return res.redirect('/pustakawan/blog/buat')
        }

        await Tag.store(data)
        req.flash('success', 'Tag berhasil ditambahkan')
        if (judul || ringkasan || nama_pembuat || isi) {
            const flashData = {
                judul: judul || '',
                ringkasan: ringkasan || '',
                nama_pembuat: nama_pembuat || '',
                isi: isi || '',
                kategori: kategori || [],
                tag: tag || [],
                sumber: sumber || []
            }
            req.flash('data', flashData)
        }
        res.redirect('/pustakawan/blog/buat')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog/buat')
    }
})

module.exports = router