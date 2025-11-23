const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { convertImageFile } = require('../../middlewares/convertImage')
const Blog = require('../../models/Blog')
const Kategori = require('../../models/Kategori')
const Tag = require('../../models/Tag')
const Pegawai = require('../../models/Pegawai')
const {authPustakawan} = require('../../middlewares/auth')

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

router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const offset = (page - 1) * limit

        const data = await Blog.getByStatusAndPegawai('Proses', req.session.pegawaiId, limit, offset)
        const totalData = await Blog.countByStatusAndPegawai('Proses', req.session.pegawaiId)
        const totalHalaman = Math.ceil(totalData / limit)

        res.render('pustakawan/blog/blog-proses/index', {
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

router.get('/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const blog = await Blog.getByIdWithRelations(id, req.session.pegawaiId)

        if (!blog) {
            req.flash('error', 'Blog tidak ditemukan')
            return res.redirect('/pustakawan/blog-proses')
        }

        if (blog.status !== 'Proses') {
            req.flash('error', 'Blog tidak dalam status Proses')
            return res.redirect('/pustakawan/blog-proses')
        }

        blog.foto_cover = Blog.normalizeImagePath(blog.foto_cover)

        res.render('pustakawan/blog/blog-proses/detail', {
            blog,
            pegawai
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog-proses')
    }
})

router.get('/edit/:id', authPustakawan, async (req, res) => {
    try {
        const {id} = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const blog = await Blog.getByIdForEdit(id, req.session.pegawaiId, 'Proses')
        const kategori = await Kategori.getLatest(10)
        const tag = await Tag.getLatest(10)

        if (!blog) {
            req.flash('error', 'Blog tidak ditemukan')
            return res.redirect('/pustakawan/blog-proses')
        }

        const formData = req.flash('data')[0] || {}
        const data = Object.keys(formData).length > 0 ? formData : {
            judul: blog.judul,
            ringkasan: blog.ringkasan,
            nama_pembuat: blog.nama_pembuat,
            isi: blog.isi,
            kategori: blog.kategori.map(k => k.id),
            tag: blog.tag.map(t => t.id),
            sumber: blog.sumber.length ? blog.sumber : ['']
        }

        res.render('pustakawan/blog/blog-proses/edit', {
            blog,
            pegawai,
            kategori,
            tag,
            data
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog-proses')
    }
})

router.post('/update/:id', authPustakawan, upload.single('foto_cover'), async (req, res) => {
    try {
        const {id} = req.params
        const {judul, ringkasan, nama_pembuat, isi, kategori, tag, sumber} = req.body
        
        const blog = await Blog.getByIdForEdit(id, req.session.pegawaiId, 'Proses')
        if (!blog) {
            if (req.file) {
                deleteUploadedFile(req.file)
            }
            req.flash('error', 'Blog tidak ditemukan')
            return res.redirect('/pustakawan/blog-proses')
        }

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
            if (req.file) {
                deleteUploadedFile(req.file)
            }
            req.flash("error", "Judul tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect(`/pustakawan/blog-proses/edit/${id}`)
        }

        if (!payload.ringkasan) {
            if (req.file) {
                deleteUploadedFile(req.file)
            }
            req.flash("error", "Ringkasan tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect(`/pustakawan/blog-proses/edit/${id}`)
        }

        if (!payload.nama_pembuat) {
            if (req.file) {
                deleteUploadedFile(req.file)
            }
            req.flash("error", "Nama pembuat tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect(`/pustakawan/blog-proses/edit/${id}`)
        }

        const cleanedIsi = rawIsi.replace(/<(.|\n)*?>/g, '').trim()
        if (!rawIsi || !cleanedIsi) {
            if (req.file) {
                deleteUploadedFile(req.file)
            }
            req.flash("error", "Isi blog tidak boleh kosong")
            req.flash('data', flashData)
            return res.redirect(`/pustakawan/blog-proses/edit/${id}`)
        }

        let fotoCover = blog.foto_cover
        if (req.file) {
            const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if (!allowedFormats.includes(req.file.mimetype)) {
                deleteUploadedFile(req.file)
                req.flash("error", "Hanya file gambar (jpg, jpeg, png, webp) yang diizinkan")
                req.flash('data', flashData)
                return res.redirect(`/pustakawan/blog-proses/edit/${id}`)
            }

            const inputPath = req.file.path
            const result = await convertImageFile(inputPath)

            if (!result) {
                deleteUploadedFile(req.file)
                req.flash("error", "Gagal memproses gambar")
                req.flash('data', flashData)
                return res.redirect(`/pustakawan/blog-proses/edit/${id}`)
            }

            fotoCover = '/images/blog/' + path.basename(result.outputPath)
        }

        let tautan = blog.tautan
        if (payload.judul !== blog.judul) {
            tautan = await Blog.generateTautan(payload.judul, id)
        }
        const blogData = {
            tautan,
            judul: payload.judul,
            foto_cover: fotoCover,
            ringkasan: payload.ringkasan,
            nama_pembuat: payload.nama_pembuat,
            isi: payload.isi
        }

        await Blog.update(id, blogData)

        await Blog.deleteTagBlog(id)
        if (tagSelected.length) {
            await Promise.all(
                tagSelected.map((idTag) => Blog.storeTagBlog(id, idTag))
            )
        }

        await Blog.deleteKategoriBlog(id)
        if (kategoriSelected.length) {
            await Promise.all(
                kategoriSelected.map((idKategori) => Blog.storeKategoriBlog(id, idKategori))
            )
        }

        await Blog.deleteSumber(id)
        if (sumberNormalized.length) {
            await Promise.all(
                sumberNormalized.map((namaSumber) => Blog.storeSumber(id, namaSumber))
            )
        }

        req.flash('success', 'Blog berhasil diubah')
        return res.redirect('/pustakawan/blog-proses')
    } catch (err) {
        console.error(err)
        if (req.file) {
            deleteUploadedFile(req.file)
        }
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/blog-proses')
    }
})

module.exports = router

