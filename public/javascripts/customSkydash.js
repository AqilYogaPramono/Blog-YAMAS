(function() {
    function isMobile() {
        return window.matchMedia('(max-width: 991.98px)').matches;
    }

    function closeSidebar() {
        $('#sidebar').removeClass('active');
        $('body').removeClass('sidebar-mobile-open');
    }

    $(document).on('click', '.navbar-toggler[data-toggle="offcanvas"]', function() {
        if (isMobile()) {
            setTimeout(function() {
                $('body').toggleClass('sidebar-mobile-open', $('#sidebar').hasClass('active'));
            }, 0);
        }
    });

    $(document).on('click', function(e) {
        if (!isMobile()) return;
        var $target = $(e.target);
        var clickInsideSidebar = $target.closest('#sidebar').length > 0;
        var clickOnToggler = $target.closest('.navbar-toggler[data-toggle="offcanvas"]').length > 0;
        if (!clickInsideSidebar && !clickOnToggler) {
            closeSidebar();
        }
    });

    $(document).on('click', '#sidebar .nav-link', function(e) {
        if (!isMobile()) return;
        var $link = $(this);
        var isCollapseToggle = ($link.attr('data-toggle') === 'collapse');
        if (isCollapseToggle) return;
    });

    $(document).on('keydown', function(e) {
        if (isMobile() && e.key === 'Escape') {
            closeSidebar();
        }
    });

    $(window).on('resize', function() {
        if (!isMobile()) {
            $('body').removeClass('sidebar-mobile-open');
            $('#sidebar').removeClass('active');
        }
    });

    $(window).on('beforeunload', function() {
        if (isMobile()) {
            closeSidebar();
        }
    });

    function showLoading() {
        var overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
    }

    function hideLoading() {
        var overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    $(document).on('submit', 'form[data-loading], form', function() {
        showLoading();
    });

    $(document).on('click', 'a[data-loading]', function() {
        showLoading();
    });

    $(window).on('pageshow', function() {
        hideLoading();
    });

    var pendingDeleteUrl = null;
    $(document).on('click', '.btn-delete', function() {
        pendingDeleteUrl = this.getAttribute('data-url');
        $('#modalConfirmDelete').modal('show');
    });

    $(document).on('click', '#btnConfirmDelete', function() {
        if (!pendingDeleteUrl) return;
        $('#modalConfirmDelete').modal('hide');
        showLoading();
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = pendingDeleteUrl;
        document.body.appendChild(form);
        form.submit();
    });
})();

(function(){
    function showImagePreview(src){
        var modal = document.getElementById('globalImagePreviewModal');
        if (!modal) return;
        var img = modal.querySelector('#globalImagePreviewEl');
        if (img) img.src = src;
        $('#globalImagePreviewModal').modal('show');
    }

    $(document).on('click', '.img-click-preview, #previewTambah, #previewEdit, #detailCover', function(){
        var src = this.getAttribute('data-src') || this.getAttribute('src');
        if (!src) return;
        showImagePreview(src);
    });

    window.addEventListener('preview-image', function(e){
        if (!e || !e.detail || !e.detail.src) return;
        showImagePreview(e.detail.src);
    });
})();

(function() {
    function setupPasswordToggle() {
        $(document).on('click', '.password-toggle-btn', function() {
            var $btn = $(this);
            var targetId = $btn.data('target');
            var $input = $('#' + targetId);
            var $icon = $btn.find('i');

            if ($input.attr('type') === 'password') {
                $input.attr('type', 'text');
                $icon.removeClass('mdi-eye-off').addClass('mdi-eye');
            } else {
                $input.attr('type', 'password');
                $icon.removeClass('mdi-eye').addClass('mdi-eye-off');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupPasswordToggle);
    } else {
        setupPasswordToggle();
    }
})();

(function() {
    function dismissFlash(el) {
        if (!el) return;
        el.style.animation = 'flash-out 180ms ease-in forwards';
        setTimeout(function(){
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }, 200);
    }

    function setupFlash() {
        var container = document.querySelector('.flash-container');
        if (!container) return;

        var flashes = container.querySelectorAll('.flash');
        flashes.forEach(function(el){
            var closeBtn = el.querySelector('.flash-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function(){ dismissFlash(el); });
            }
            if (el.classList.contains('flash-success')) {
                setTimeout(function(){ dismissFlash(el); }, 6000);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFlash);
    } else {
        setupFlash();
    }
})();

(function() {
    function setupImagePreview() {
        $(document).on('change', 'input[type="file"][accept*="image"]', function(e) {
            const files = e.target.files;
            const previewId = this.getAttribute('data-preview') || 'previewTambah';
            const preview = document.getElementById(previewId);
            const previewContainer = document.getElementById(previewId + 'Container');
            
            if (files.length > 0) {
                if (files.length === 1 && !this.hasAttribute('multiple')) {
                    // Single file preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (preview) {
                            preview.src = e.target.result;
                            preview.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(files[0]);
                } else {
                    // Multiple files preview
                    if (previewContainer) {
                        previewContainer.innerHTML = '';
                        preview.style.display = 'block';
                        
                        Array.from(files).forEach((file, index) => {
                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = function(e) {
                                    const img = document.createElement('img');
                                    img.src = e.target.result;
                                    img.className = 'img-click-preview';
                                    img.style.cssText = 'height:60px;width:auto;border-radius:6px;object-fit:cover;cursor:zoom-in;margin:2px;';
                                    img.alt = 'preview ' + (index + 1);
                                    previewContainer.appendChild(img);
                                };
                                reader.readAsDataURL(file);
                            }
                        });
                    }
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupImagePreview);
    } else {
        setupImagePreview();
    }
})();

(function() {
    function waitForQuill(callback, attempt) {
        var tries = typeof attempt === 'number' ? attempt : 0;
        if (window.Quill) {
            callback();
            return;
        }
        if (tries > 40) return;
        setTimeout(function() {
            waitForQuill(callback, tries + 1);
        }, 100);
    }

    function initBlogCreatePage() {
        var form = document.getElementById('formBlog');
        if (!form) return;

        setupSumberInputs();
        setupKategoriModal();
        setupTagModal();
        initQuillEditor(form);
    }

    function setupSumberInputs() {
        var container = document.getElementById('sumberContainer');
        var addBtn = document.getElementById('tambahSumber');
        if (!container || !addBtn) return;

        function updateDeleteButtons() {
            var groups = container.querySelectorAll('.blog-sumber-chip');
            var buttons = container.querySelectorAll('.btn-hapus-sumber');
            var show = groups.length > 1;
            buttons.forEach(function(btn) {
                if (show) {
                    btn.classList.remove('btn-hapus-sumber--hidden');
                } else {
                    btn.classList.add('btn-hapus-sumber--hidden');
                }
            });
        }

        addBtn.addEventListener('click', function() {
            var group = document.createElement('div');
            group.className = 'blog-sumber-chip';
            group.innerHTML = '<input type="text" class="form-control" name="sumber[]" placeholder="Masukkan sumber">' +
                '<button type="button" class="btn btn-icon btn-outline-danger btn-hapus-sumber"><i class="mdi mdi-close"></i></button>';
            container.appendChild(group);
            updateDeleteButtons();
        });

        container.addEventListener('click', function(e) {
            var targetBtn = e.target.closest('.btn-hapus-sumber');
            if (!targetBtn || !container.contains(targetBtn)) return;
            var groups = container.querySelectorAll('.blog-sumber-chip');
            if (groups.length <= 1) return;
            var group = targetBtn.closest('.blog-sumber-chip');
            if (group) {
                group.remove();
                updateDeleteButtons();
            }
        });

        updateDeleteButtons();
    }

    function setupKategoriModal() {
        var button = document.getElementById('btnSimpanKategori');
        var input = document.getElementById('nama_kategori_modal');
        var formBlog = document.getElementById('formBlog');
        if (!button || !input) return;

        button.addEventListener('click', function() {
            var namaKategori = input.value.trim();
            if (!namaKategori) {
                alert('Nama kategori tidak boleh kosong');
                return;
            }

            var formData = new FormData();
            formData.append('nama_kategori', namaKategori);

            if (formBlog) {
                var judul = formBlog.querySelector('[name="judul"]');
                var ringkasan = formBlog.querySelector('[name="ringkasan"]');
                var nama_pembuat = formBlog.querySelector('[name="nama_pembuat"]');
                var isi = formBlog.querySelector('[name="isi"]');
                var kategoriInputs = formBlog.querySelectorAll('[name="kategori[]"]:checked');
                var tagInputs = formBlog.querySelectorAll('[name="tag[]"]:checked');
                var sumberInputs = formBlog.querySelectorAll('[name="sumber[]"]');

                if (judul) formData.append('judul', judul.value);
                if (ringkasan) formData.append('ringkasan', ringkasan.value);
                if (nama_pembuat) formData.append('nama_pembuat', nama_pembuat.value);
                if (isi) formData.append('isi', isi.value);
                kategoriInputs.forEach(function(input) {
                    formData.append('kategori[]', input.value);
                });
                tagInputs.forEach(function(input) {
                    formData.append('tag[]', input.value);
                });
                sumberInputs.forEach(function(input) {
                    if (input.value) formData.append('sumber[]', input.value);
                });
            }

            fetch('/pustakawan/blog/kategori/create', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                if (response.redirected) {
                    window.location.href = response.url;
                }
            })
            .catch(function(err) {
                console.error('Error:', err);
                alert('Gagal menambahkan kategori');
            });
        });
    }

    function setupTagModal() {
        var button = document.getElementById('btnSimpanTag');
        var input = document.getElementById('nama_tag_modal');
        var formBlog = document.getElementById('formBlog');
        if (!button || !input) return;

        button.addEventListener('click', function() {
            var namaTag = input.value.trim();
            if (!namaTag) {
                alert('Nama tag tidak boleh kosong');
                return;
            }

            var formData = new FormData();
            formData.append('nama_tag', namaTag);

            if (formBlog) {
                var judul = formBlog.querySelector('[name="judul"]');
                var ringkasan = formBlog.querySelector('[name="ringkasan"]');
                var nama_pembuat = formBlog.querySelector('[name="nama_pembuat"]');
                var isi = formBlog.querySelector('[name="isi"]');
                var kategoriInputs = formBlog.querySelectorAll('[name="kategori[]"]:checked');
                var tagInputs = formBlog.querySelectorAll('[name="tag[]"]:checked');
                var sumberInputs = formBlog.querySelectorAll('[name="sumber[]"]');

                if (judul) formData.append('judul', judul.value);
                if (ringkasan) formData.append('ringkasan', ringkasan.value);
                if (nama_pembuat) formData.append('nama_pembuat', nama_pembuat.value);
                if (isi) formData.append('isi', isi.value);
                kategoriInputs.forEach(function(input) {
                    formData.append('kategori[]', input.value);
                });
                tagInputs.forEach(function(input) {
                    formData.append('tag[]', input.value);
                });
                sumberInputs.forEach(function(input) {
                    if (input.value) formData.append('sumber[]', input.value);
                });
            }

            fetch('/pustakawan/blog/tag/create', {
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                if (response.redirected) {
                    window.location.href = response.url;
                }
            })
            .catch(function(err) {
                console.error('Error:', err);
                alert('Gagal menambahkan tag');
            });
        });
    }

    function initQuillEditor(form) {
        var editorEl = document.getElementById('editor');
        var isiInput = document.getElementById('isi');
        if (!editorEl || !isiInput) return;

        waitForQuill(function() {
            var quill = new Quill('#editor', {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: [
                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                            [{ font: [] }],
                            [{ size: [] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ color: [] }, { background: [] }],
                            [{ script: 'sub' }, { script: 'super' }],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            [{ indent: '-1' }, { indent: '+1' }],
                            [{ direction: 'rtl' }],
                            [{ align: [] }],
                            ['link', 'image', 'video', 'formula'],
                            ['clean']
                        ],
                        handlers: {
                            image: function() {
                                var input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.click();

                                input.onchange = function() {
                                    var file = input.files && input.files[0];
                                    if (!file) return;
                                    var formData = new FormData();
                                    formData.append('gambar', file);
                                    fetch('/pustakawan/blog/upload-gambar', {
                                        method: 'POST',
                                        body: formData
                                    })
                                    .then(function(res) { return res.json(); })
                                    .then(function(data) {
                                        if (data.url) {
                                            var range = quill.getSelection(true);
                                            quill.insertEmbed(range.index, 'image', data.url);
                                        } else {
                                            alert('Gagal mengupload gambar');
                                        }
                                    })
                                    .catch(function(err) {
                                        console.error('Error:', err);
                                        alert('Gagal mengupload gambar');
                                    });
                                };
                            }
                        }
                    }
                },
                placeholder: 'Tulis isi blog di sini...'
            });

            quill.on('text-change', function() {
                isiInput.value = quill.root.innerHTML;
            });

            quill.root.addEventListener('paste', function(e) {
                var clipboardData = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
                if (!clipboardData || !clipboardData.items) return;
                for (var i = 0; i < clipboardData.items.length; i++) {
                    if (clipboardData.items[i].type.indexOf('image') === -1) continue;
                    e.preventDefault();
                    var file = clipboardData.items[i].getAsFile();
                    if (!file) return;
                    var formData = new FormData();
                    formData.append('gambar', file);
                    fetch('/pustakawan/blog/upload-gambar', {
                        method: 'POST',
                        body: formData
                    })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        if (data.url) {
                            var range = quill.getSelection(true);
                            quill.insertEmbed(range.index, 'image', data.url);
                        } else {
                            alert('Gagal mengupload gambar');
                        }
                    })
                    .catch(function(err) {
                        console.error('Error:', err);
                        alert('Gagal mengupload gambar');
                    });
                    return;
                }
            });

            var initialNode = document.getElementById('initialIsi');
            var initialContent = initialNode ? (initialNode.value || initialNode.textContent || '') : '';
            if (initialContent) {
                quill.root.innerHTML = initialContent;
                isiInput.value = initialContent;
            }

            form.addEventListener('submit', function(e) {
                var content = quill.root.innerHTML;
                if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
                    e.preventDefault();
                    alert('Isi blog tidak boleh kosong');
                    return false;
                }
                isiInput.value = content;
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlogCreatePage);
    } else {
        initBlogCreatePage();
    }
})();