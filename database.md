CREATE TABLE blog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tautan VARCHAR(255) UNIQUE NOT NULL,
    judul VARCHAR(255) NOT NULL,
    foto_cover VARCHAR(255) NOT NULL,
    ringkasan VARCHAR(255) NOT NULL,
    nama_pembuat VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    status ENUM('Valid', 'Proses', 'Tidak-Valid') DEFAULT 'Proses',
    id_pegawai INT,
    dibuat_oleh VARCHAR(255),
    dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
    diubah_pada DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    diverifikasi_oleh VARCHAR(255),
    diverifikasi_pada DATETIME,
    catatan_manajer TEXT
);

CREATE TABLE tag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_tag VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE tag_blog (
    id_blog INT,
    id_tag INT,
    PRIMARY KEY (id_blog, id_tag),
    FOREIGN KEY (id_blog) REFERENCES blog(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tag) REFERENCES tag(id)
);

CREATE TABLE kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE kategori_blog (
    id_blog INT,
    id_kategori INT,
    PRIMARY KEY (id_blog, id_kategori),
    FOREIGN KEY (id_blog) REFERENCES blog(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kategori) REFERENCES kategori(id)
);

CREATE TABLE sumber (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_blog INT NOT NULL,
    nama_sumber VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_blog) REFERENCES blog(id) ON DELETE CASCADE
);