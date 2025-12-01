const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
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

const isSixteenByNinePhoto = async (filePath, tolerance = 0.02) => {
    try {
        const metadata = await sharp(filePath).metadata()
        if (!metadata.width || !metadata.height) return false
        const ratio = metadata.width / metadata.height
        const expected = 16 / 9
        return Math.abs(ratio - expected) <= tolerance
    } catch (err) {
        console.error('Error checking blog cover photo ratio:', err)
        return false
    }
}

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const kategori = await Kategori.getLatest(10)
        const tag = await Tag.getLatest(10)

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


router.post('/create', authPustakawan, upload.single('foto_cover'), async (req, res) => {
    try {
        const {judul, ringkasan, nama_pembuat, isi, kategori, tag, sumber, base64_images} = req.body
        
        var processedIsi = typeof isi === 'string' ? isi : ''
        
        if (base64_images) {
            try {
                const base64Array = JSON.parse(base64_images)
                for (let i = 0; i < base64Array.length; i++) {
                    const base64 = base64Array[i]
                    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
                    if (matches) {
                        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
                        const imageData = matches[2]
                        const buffer = Buffer.from(imageData, 'base64')
                        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext
                        const filePath = path.join(__dirname, '../../public/images/blog', filename)
                        
                        fs.writeFileSync(filePath, buffer)
                        const result = await convertImageFile(filePath)
                        
                        if (result) {
                            const relativePath = '/images/blog/' + path.basename(result.outputPath)
                            processedIsi = processedIsi.replace(base64, relativePath)
                        } else {
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath)
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error processing base64 images:', err)
            }
        }
        
        const rawIsi = processedIsi
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

        if (!req.file) {
            req.flash("error", "Foto cover tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (!allowedFormats.includes(req.file.mimetype)) {
            deleteUploadedFile(req.file)
            req.flash("error", "Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        if (req.file && req.file.path) {
            const isValidSize = await isSixteenByNinePhoto(req.file.path)
            if (!isValidSize) {
                deleteUploadedFile(req.file)
                req.flash("error", "Foto cover harus berukuran 16:9")
                req.flash('data', flashData)
                return res.redirect('/pustakawan/blog/buat')
            }
        }

        const inputPath = req.file.path
        const result = await convertImageFile(inputPath)

        if (!result) {
            deleteUploadedFile(req.file)
            req.flash("error", "Gagal memproses gambar")
            req.flash('data', flashData)
            return res.redirect('/pustakawan/blog/buat')
        }

        const fotoCover = '/images/blog/' + path.basename(result.outputPath)

        const pegawai = await Pegawai.getById(req.session.pegawaiId)
        const tautan = await Blog.generateTautan(payload.judul)
        const blogData = {
            tautan,
            judul: payload.judul,
            foto_cover: fotoCover,
            ringkasan: payload.ringkasan,
            nama_pembuat: payload.nama_pembuat,
            isi: payload.isi,
            id_pegawai: req.session.pegawaiId,
            dibuat_oleh: pegawai.nama
        }

        const blogResult = await Blog.store(blogData)
        const idBlog = blogResult.insertId

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
        return res.redirect('/pustakawan/blog-proses')
    } catch (err) {
        console.error(err)
        if (req.file) {
            deleteUploadedFile(req.file)
        }
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog/buat')
    }
})

module.exports = router