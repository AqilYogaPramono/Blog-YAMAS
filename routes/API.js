const express = require('express')
const Blog = require('../models/Blog')

const router = express.Router()

router.get('/blog', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 50
        const offset = parseInt(req.query.offset, 10) || 0

        const data = await Blog.getAllValidOrderedByVerified(limit, offset)

        res.json({ data })
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Internal Server Error'})
    }
})

router.get('/blog/:tautan', async (req, res) => {
    try {
        
        const {tautan} = req.params

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
                tag: blog.tag.map((t) => ({id: t.id, nama_tag: t.nama_tag})),
                kategori: blog.kategori.map((k) => ({id: k.id, nama_kategori: k.nama_kategori})),
                related
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error'})
    }
})

router.get('/tag/:id', async (req, res) => {
    try {
        const {id} = req.params
        const limit = parseInt(req.query.limit, 10) || 50
        const offset = parseInt(req.query.offset, 10) || 0

        const data = await Blog.getValidByTagId(id, limit, offset)

        res.json({ data })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/kategori/:id', async (req, res) => {
    try {
        const {id} = req.params
        const limit = parseInt(req.query.limit, 10) || 50
        const offset = parseInt(req.query.offset, 10) || 0

        const data = await Blog.getValidByKategoriId(id, limit, offset)

        res.json({ data })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = router