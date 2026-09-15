const express = require('express')
const Blog = require('../models/Blog')
const Kategori = require('../models/Kategori')
const Tag = require('../models/Tag')

const router = express.Router()

router.get('/blog', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 15
        const offset = (page - 1) * limit

        const blog = await Blog.getForAPI(limit, offset)
        const countResult = await Blog.getCountBlog()
        const totalBlog = countResult[0].total_blog
        const totalHalaman = Math.ceil(totalBlog / limit)

        res.status(200).json({
            blog,
            pagination: {
                page,
                limit,
                totalBlog,
                totalHalaman
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.post('/blog/search', async (req, res) => {
    try {
        const { keyword } = req.body

        if (!keyword || !keyword.trim()) {
            return res.status(400).json({ message: 'Keyword tidak boleh kosong' })
        }

        const blog = await Blog.searchByJudulForAPI(keyword.trim())
        res.status(200).json({ blog })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/blog/:tautan', async (req, res) => {
    try {

        const { tautan } = req.params

        const blog = await Blog.getBySlugWithRelations(tautan)

        const related = await Blog.getRandomRelatedByBlogId(blog.id)

        res.json({
            data: {
                id: blog.id,
                tautan: blog.tautan,
                judul: blog.judul,
                ringkasan: blog.ringkasan,
                foto_cover: blog.foto_cover,
                nama_pembuat: blog.nama_pembuat,
                isi: blog.isi,
                dibuat_pada: blog.dibuat_pada,
                tag: blog.tag.map((t) => ({ id: t.id, nama_tag: t.nama_tag })),
                kategori: blog.kategori.map((k) => ({ id: k.id, nama_kategori: k.nama_kategori })),
                related
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/tag/:id', async (req, res) => {
    try {
        const { id } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = 15
        const offset = (page - 1) * limit

        const tag = await Tag.getById(id)
        const data = await Blog.getValidByTagId(id, limit, offset)
        const countResult = await Blog.getCountBlogByTagId(id)
        const totalBlog = countResult[0].total_blog
        const totalHalaman = Math.ceil(totalBlog / limit)

        res.status(200).json({
            data,
            tag: tag ? { id: tag.id, nama_tag: tag.nama_tag } : null,
            pagination: {
                page,
                limit,
                totalBlog,
                totalHalaman
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/kategori/:id', async (req, res) => {
    try {
        const { id } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = 15
        const offset = (page - 1) * limit

        const kategori = await Kategori.getById(id)
        const data = await Blog.getValidByKategoriId(id, limit, offset)
        const countResult = await Blog.getCountBlogByKategoriId(id)
        const totalBlog = countResult[0].total_blog
        const totalHalaman = Math.ceil(totalBlog / limit)

        res.status(200).json({
            data,
            kategori: kategori ? { id: kategori.id, nama_kategori: kategori.nama_kategori } : null,
            pagination: {
                page,
                limit,
                totalBlog,
                totalHalaman
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = router