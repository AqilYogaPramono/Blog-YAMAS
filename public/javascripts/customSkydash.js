/* ============================================
   Quill Editor - Simple Initialization
   Fallback sederhana untuk inisialisasi Quill
   ============================================ */
(function() {
    'use strict';
    
    function initSimpleQuill() {
    const editorEl = document.querySelector("#editor");
    const initialIsiEl = document.querySelector("#initialIsi");

        // Skip jika sudah diinisialisasi oleh blog editor atau tidak ada element
    if (!editorEl || !initialIsiEl) return;

        // Check apakah form blog ada - jika ada, biarkan blog editor yang handle
        var form = document.getElementById('formBlog');
        if (form) {
            // Form blog ada, tunggu blog editor yang akan inisialisasi
            // Jangan jalankan simple init untuk halaman blog
            return;
        }
        
        // Check multiple ways untuk memastikan tidak double init
        if (editorEl.classList.contains('ql-container') || 
            editorEl.querySelector('.ql-toolbar') || 
            editorEl.dataset.quillInitialized === 'true' ||
            editorEl.dataset.quillInitialized === 'initializing') {
            return; // Sudah diinisialisasi oleh blog editor
        }

        // Pastikan Quill sudah dimuat
        if (typeof Quill === 'undefined') {
            // Retry setelah 100ms jika Quill belum dimuat
            setTimeout(initSimpleQuill, 100);
            return;
        }

        try {
            // Mark as initializing
            editorEl.dataset.quillInitialized = 'initializing';
            
            // Gunakan toolbar lengkap sesuai dokumentasi Quill
            // Format: Array of arrays, setiap array adalah satu baris toolbar
            var toolbarOptions = [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'align': [] }],
                ['link', 'image', 'video', 'formula'],
                ['blockquote', 'code-block'],
                ['clean']
            ];
            
            const quill = new Quill("#editor", {
                theme: "snow",
                modules: {
                    toolbar: {
                        container: toolbarOptions,
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
                                        console.error('[Quill] Upload error:', err);
                                        alert('Gagal mengupload gambar');
                                    });
                                };
                            }
                        }
                    },
                    clipboard: {
                        matchVisual: false
                    }
                },
                placeholder: 'Tulis isi blog di sini...'
            });

            // Load initial content dari textarea
            var initialContent = initialIsiEl.value || initialIsiEl.textContent || '';
            if (initialContent && initialContent.trim() !== '') {
                quill.root.innerHTML = initialContent;
                quill.history.clear(); // Clear history setelah load
            }

            // Update hidden input on change
    quill.on("text-change", () => {
                const isiInput = document.getElementById("isi");
                if (isiInput) {
                    isiInput.value = quill.root.innerHTML;
                }
            });
            
            // Set initial value ke hidden input
            const isiInput = document.getElementById("isi");
            if (isiInput) {
                isiInput.value = quill.root.innerHTML;
            }
            
            // Form validation
            const form = document.getElementById('formBlog');
            if (form) {
                form.addEventListener('submit', function(e) {
                    var content = quill.root.innerHTML;
                    if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
                        e.preventDefault();
                        alert('Isi blog tidak boleh kosong');
                        return false;
                    }
                    if (isiInput) {
                        isiInput.value = content;
                    }
                });
            }
            
            // Mark as initialized
            editorEl.dataset.quillInitialized = 'true';
        } catch (error) {
            console.error('[Quill] Error initializing editor:', error);
            editorEl.dataset.quillInitialized = 'false';
        }
    }
    
    // Initialize saat DOM ready atau jika sudah ready
    // Delay sedikit untuk memastikan blog editor dijalankan terlebih dahulu
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", function() {
            // Delay 50ms untuk memastikan blog editor dijalankan terlebih dahulu
            setTimeout(initSimpleQuill, 50);
        });
    } else {
        // DOM sudah ready, delay sedikit untuk memastikan blog editor dijalankan terlebih dahulu
        setTimeout(initSimpleQuill, 50);
    }
})();


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

/* ============================================
   Image Preview Popup - DIHAPUS
   Preview gambar sekarang menggunakan full screen
   seperti di halaman detail blog
   ============================================ */

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

/* ============================================
   Image Preview Handler - Full Screen Style
   Menampilkan preview gambar dengan style
   full screen seperti di halaman detail
   ============================================ */
(function() {
    'use strict';
    
    function setupImagePreview() {
        // Handle file input change untuk preview gambar
        $(document).on('change', 'input[type="file"][accept*="image"][data-preview]', function(e) {
            const files = e.target.files;
            const previewId = this.getAttribute('data-preview') || 'previewTambah';
            const preview = document.getElementById(previewId);
            const previewContainer = document.getElementById(previewId + 'Container');
            
            if (files.length > 0 && files.length === 1 && !this.hasAttribute('multiple')) {
                // Single image preview dengan style full screen
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (preview) {
                            preview.src = e.target.result;
                        }
                    if (previewContainer) {
                        previewContainer.style.display = 'block';
                    }
                };
                reader.readAsDataURL(files[0]);
            } else {
                // Hide preview jika tidak ada file
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
            }
        });

        // Initialize preview untuk file yang sudah ada (edit mode)
        document.querySelectorAll('input[type="file"][accept*="image"][data-preview]').forEach(function(input) {
            const previewId = input.getAttribute('data-preview');
            const preview = document.getElementById(previewId);
            const previewContainer = document.getElementById(previewId + 'Container');
            
            if (preview && preview.src && preview.src !== '#' && preview.src !== '' && 
                !preview.src.includes('data:') && preview.src !== window.location.href) {
                if (previewContainer) {
                    previewContainer.style.display = 'block';
                }
            } else if (previewContainer) {
                previewContainer.style.display = 'none';
            }
        });
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupImagePreview);
    } else {
        setupImagePreview();
    }
})();

/* ============================================
   Blog Quill Editor - Native Implementation
   Khusus untuk halaman blog buat/edit
   
   PENJELASAN CARA KERJA QUILL:
   ============================================
   
   1. QUICK OVERVIEW:
      Quill adalah rich text editor yang menggunakan Delta format
      untuk menyimpan perubahan. Delta adalah format JSON yang
      merepresentasikan perubahan pada dokumen.
   
   2. INISIALISASI:
      - waitForQuill(): Menunggu library Quill dimuat dari CDN
      - initBlogQuillEditor(): Menginisialisasi editor dengan konfigurasi
   
   3. CUSTOM CLIPBOARD:
      - CustomClipboard: Override modul clipboard default Quill
      - onPaste(): Menangani paste gambar dari clipboard
      - Upload gambar ke server saat paste, lalu insert URL ke editor
   
   4. TOOLBAR & MODULES:
      - Toolbar: Konfigurasi tombol formatting (bold, italic, dll)
      - Handlers: Custom handler untuk upload gambar via toolbar
      - Clipboard: Konfigurasi untuk paste behavior
   
   5. CONTENT SYNC:
      - Event 'text-change': Update hidden input setiap ada perubahan
      - Hidden input (#isi): Menyimpan HTML content untuk form submission
   
   6. VALIDATION:
      - Form submit: Validasi content tidak kosong sebelum submit
      - Check: Content tidak boleh kosong atau hanya <p><br></p>
   
   7. INITIAL CONTENT:
      - Load dari #initialIsi: Mengisi editor dengan content existing
      - quill.history.clear(): Clear undo/redo history setelah load
   
   ============================================ */
(function() {
    'use strict';
    
    // Setup Sumber Inputs
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

    /**
     * Wait for Quill Library
     * Menunggu library Quill dimuat dari CDN sebelum inisialisasi
     * 
     * @param {Function} callback - Function yang akan dipanggil saat Quill ready
     * @param {Number} maxAttempts - Maksimal percobaan (default: 50 = 5 detik)
     */
    function waitForQuill(callback, maxAttempts) {
        var attempts = maxAttempts || 0;
        
        // Jika Quill sudah dimuat, langsung eksekusi callback
        if (typeof Quill !== 'undefined') {
            callback();
            return;
        }
        
        // Jika sudah mencapai maksimal percobaan, tampilkan error
        if (attempts >= 50) {
            console.error('[Quill] Library tidak ditemukan setelah 5 detik. Pastikan CDN dimuat.');
            return;
        }
        
        // Retry setiap 100ms
        setTimeout(function() {
            waitForQuill(callback, attempts + 1);
        }, 100);
    }

    // Initialize Quill Editor
    function initBlogQuillEditor() {
        var editorEl = document.getElementById('editor');
        var isiInput = document.getElementById('isi');
        var form = document.getElementById('formBlog');
        
        if (!editorEl || !isiInput || !form) {
            return;
        }
        
        // Skip if already initialized (check multiple ways)
        if (editorEl.classList.contains('ql-container') || 
            editorEl.querySelector('.ql-toolbar') || 
            editorEl.dataset.quillInitialized === 'true') {
            return;
        }
        
        // Mark as initializing to prevent double init
        editorEl.dataset.quillInitialized = 'initializing';

        waitForQuill(function() {
            try {
                /**
                 * INISIALISASI QUILL EDITOR
                 * 
                 * KONFIGURASI MODULES:
                 * - toolbar: Konfigurasi tombol formatting
                 * - clipboard: Konfigurasi paste behavior (default)
                 * 
                 * TOOLBAR CONTAINER:
                 * Array yang mendefinisikan tombol-tombol di toolbar
                 * - Header: Dropdown untuk heading (H1-H6)
                 * - Font: Dropdown untuk font family
                 * - Size: Dropdown untuk ukuran font
                 * - Formatting: Bold, italic, underline, strikethrough
                 * - Color: Text color dan background color
                 * - Script: Subscript dan superscript
                 * - List: Ordered dan bullet list
                 * - Indent: Increase/decrease indent
                 * - Direction: RTL support
                 * - Align: Text alignment
                 * - Media: Link, image, video, formula
                 * - Clean: Remove formatting
                 */
                // Toolbar options sesuai dokumentasi Quill
                var toolbarOptions = [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'font': [] }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video', 'formula'],
                    ['blockquote', 'code-block'],
                    ['clean']
                ];
                
                // Inisialisasi Quill dengan toolbar lengkap
                // Menggunakan clipboard default untuk stabilitas
                var quill = new Quill('#editor', {
                    theme: 'snow', // Theme visual Quill
                    modules: {
                        toolbar: {
                            container: toolbarOptions,
                            /**
                             * CUSTOM HANDLERS
                             * Handler khusus untuk tombol tertentu
                             * 
                             * image handler:
                             * - Membuat input file tersembunyi
                             * - Trigger click untuk membuka file picker
                             * - Upload file ke server saat dipilih
                             * - Insert URL gambar ke editor
                             */
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
                                            if (data && data.url) {
                                                // Insert gambar di posisi cursor
                                                var range = quill.getSelection(true);
                                                if (range) {
                                                quill.insertEmbed(range.index, 'image', data.url);
                                                }
                                            } else {
                                                alert('Gagal mengupload gambar');
                                            }
                                        })
                                        .catch(function(err) {
                                            console.error('[Quill] Upload error:', err);
                                            alert('Gagal mengupload gambar');
                                        });
                                    };
                                }
                            }
                        },
                        clipboard: {
                            matchVisual: false // Tidak match visual formatting saat paste
                        }
                    },
                    placeholder: 'Tulis isi blog di sini...'
                });

                /**
                 * CONTENT SYNC - Event Listener
                 * 
                 * text-change event:
                 * - Triggered setiap kali ada perubahan di editor
                 * - Update hidden input (#isi) dengan HTML content
                 * - Hidden input digunakan untuk form submission
                 */
                quill.on('text-change', function() {
                    isiInput.value = quill.root.innerHTML;
                });

                /**
                 * LOAD INITIAL CONTENT
                 * 
                 * Proses:
                 * 1. Ambil content dari #initialIsi (textarea tersembunyi)
                 * 2. Set content ke editor menggunakan innerHTML
                 * 3. Clear history untuk mencegah undo ke state kosong
                 * 4. Update hidden input dengan content yang dimuat
                 * 
                 * Penting untuk edit mode: Content dari formData.isi || blog.isi
                 * akan dimuat ke editor saat halaman dibuka
                 */
                var initialNode = document.getElementById('initialIsi');
                var initialContent = '';
                
                if (initialNode) {
                    // Ambil content dari value atau textContent
                    initialContent = initialNode.value || initialNode.textContent || '';
                    // Decode HTML entities jika ada
                if (initialContent) {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = initialContent;
                        initialContent = tempDiv.innerHTML;
                    }
                }
                
                // Load content ke editor jika ada
                if (initialContent && initialContent.trim() !== '') {
                    quill.root.innerHTML = initialContent;
                    quill.history.clear(); // Clear undo/redo history
                    isiInput.value = initialContent;
                } else {
                    // Set default empty state
                    quill.root.innerHTML = '';
                    isiInput.value = '';
                }

                /**
                 * FORM VALIDATION
                 * 
                 * Validasi sebelum form submit:
                 * - Check apakah content tidak kosong
                 * - Check apakah content bukan hanya <p><br></p> (default empty)
                 * - Prevent submit jika content kosong
                 * - Update hidden input dengan content terakhir sebelum submit
                 */
                form.addEventListener('submit', function(e) {
                    var content = quill.root.innerHTML;
                    if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
                        e.preventDefault();
                        alert('Isi blog tidak boleh kosong');
                        return false;
                    }
                    // Pastikan hidden input ter-update dengan content terakhir
                    isiInput.value = content;
                });

                // Mark as initialized
                editorEl.dataset.quillInitialized = 'true';
                console.log('[Quill] Blog editor berhasil diinisialisasi');
            } catch (error) {
                console.error('[Quill] Error:', error);
                editorEl.dataset.quillInitialized = 'false';
            }
        });
    }

    /**
     * INITIALIZE BLOG PAGE
     * Fungsi utama untuk inisialisasi halaman blog
     * 
     * Proses:
     * 1. Check apakah form blog ada di halaman
     * 2. Setup sumber inputs (dynamic input fields)
     * 3. Initialize Quill editor dengan toolbar lengkap
     */
    function initBlogPage() {
        var form = document.getElementById('formBlog');
        if (!form) return; // Exit jika bukan halaman blog
        
        setupSumberInputs();
        initBlogQuillEditor();
    }

    /**
     * PAGE LOAD HANDLER
     * Menunggu DOM ready sebelum inisialisasi
     * 
     * Prioritas:
     * 1. Blog editor lengkap dijalankan terlebih dahulu
     * 2. Simple initialization sebagai fallback jika blog editor tidak terdeteksi
     * 
     * Best Practice:
     * - Check readyState untuk handle kasus DOM sudah ready
     * - Gunakan DOMContentLoaded untuk kasus DOM belum ready
     */
    function initAll() {
        // Blog editor dijalankan terlebih dahulu
        initBlogPage();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        // DOM sudah ready, langsung eksekusi blog editor
        // Gunakan setTimeout untuk memastikan semua script sudah dimuat
        setTimeout(initAll, 0);
    }
})();