(function() {
    'use strict';
    
    function initSimpleQuill() {
    const editorEl = document.querySelector("#editor");
    const initialIsiEl = document.querySelector("#initialIsi");

    if (!editorEl || !initialIsiEl) return;

        var form = document.getElementById('formBlog');
        if (form) {
            return;
        }
        
        if (editorEl.classList.contains('ql-container') || 
            editorEl.querySelector('.ql-toolbar') || 
            editorEl.dataset.quillInitialized === 'true' ||
            editorEl.dataset.quillInitialized === 'initializing') {
            return;
        }

        if (typeof Quill === 'undefined') {
            setTimeout(initSimpleQuill, 100);
            return;
        }

        try {
            editorEl.dataset.quillInitialized = 'initializing';
            
            try {
                var SizeStyle = Quill.import('attributors/style/size');
                if (SizeStyle) {
                    SizeStyle.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
                    Quill.register(SizeStyle, true);
                }
            } catch (e) {
                console.error('[Quill] Error registering SizeStyle:', e);
            }

            var toolbarOptions = [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'] }],
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
                                    
                                    var reader = new FileReader();
                                    reader.onload = function(e) {
                                            var range = quill.getSelection(true);
                                        quill.insertEmbed(range.index, 'image', e.target.result);
                                    };
                                    reader.readAsDataURL(file);
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

            var initialContent = initialIsiEl.value || initialIsiEl.textContent || '';
            if (initialContent && initialContent.trim() !== '') {
                quill.root.innerHTML = initialContent;
                quill.history.clear();
            } else {
                quill.root.innerHTML = '<p style="font-size: 12px;"><br></p>';
                quill.history.clear();
            }

            quill.on("text-change", function() {
                const isiInput = document.getElementById("isi");
                if (isiInput) {
                    isiInput.value = quill.root.innerHTML;
                }
            });
            
            const isiInput = document.getElementById("isi");
            if (isiInput) {
                isiInput.value = quill.root.innerHTML;
            }
            
            var form = document.getElementById('formBlog');
            if (form) {
                form.addEventListener('submit', function(e) {
                    var content = quill.root.innerHTML;
                    if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
                        e.preventDefault();
                        return false;
                    }
                    if (isiInput) {
                        isiInput.value = content;
                    }
                });
            }
            
            editorEl.dataset.quillInitialized = 'true';
        } catch (error) {
            console.error('[Quill] Error initializing editor:', error);
            editorEl.dataset.quillInitialized = 'false';
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(initSimpleQuill, 50);
        });
    } else {
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
        if (this && this.getAttribute && this.getAttribute('data-loading-skip') === 'true') {
            return;
        }
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
    'use strict';
    
    function setupImagePreview() {
        $(document).on('change', 'input[type="file"][accept*="image"][data-preview]', function(e) {
            const files = e.target.files;
            const previewId = this.getAttribute('data-preview') || 'previewTambah';
            const preview = document.getElementById(previewId);
            const previewContainer = document.getElementById(previewId + 'Container');
            
            if (files.length > 0 && files.length === 1 && !this.hasAttribute('multiple')) {
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
                if (previewContainer) {
                    previewContainer.style.display = 'none';
                }
            }
        });

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupImagePreview);
    } else {
        setupImagePreview();
    }
})();

(function() {
    'use strict';
    
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

    function registerCustomSize() {
        if (typeof Quill === 'undefined') {
            return false;
        }
        try {
            var SizeStyle = Quill.import('attributors/style/size');
            if (SizeStyle) {
                SizeStyle.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
                Quill.register(SizeStyle, true);
                return true;
            }
        } catch (e) {
            console.error('[Quill] Error registering SizeStyle:', e);
        }
        return false;
    }

    function waitForQuill(callback, maxAttempts) {
        var attempts = maxAttempts || 0;
        
        if (typeof Quill !== 'undefined') {
            registerCustomSize();
            callback();
            return;
        }
        
        if (attempts >= 50) {
            console.error('[Quill] Library tidak ditemukan setelah 5 detik. Pastikan CDN dimuat.');
            return;
        }
        
        setTimeout(function() {
            waitForQuill(callback, attempts + 1);
        }, 100);
    }

    function dataURLtoFile(dataurl) {
        try {
            var arr = dataurl.split(',');
            var mime = arr[0].match(/:(.*?);/)[1];
            var bstr = atob(arr[1]);
            var n = bstr.length;
            var u8arr = new Uint8Array(n);
            
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            var filename = 'image-' + Date.now() + '.' + (mime.split('/')[1] || 'png');
            return new File([u8arr], filename, {type: mime});
        } catch (err) {
            console.error('[Quill] Error converting data URL:', err);
            return null;
        }
    }


    function initBlogQuillEditor() {
        var editorEl = document.getElementById('editor');
        var isiInput = document.getElementById('isi');
        var form = document.getElementById('formBlog');
        
        if (!editorEl || !isiInput || !form) {
            return;
        }
        
        if (editorEl.classList.contains('ql-container') || 
            editorEl.querySelector('.ql-toolbar') || 
            editorEl.dataset.quillInitialized === 'true') {
            return;
        }
        
        editorEl.dataset.quillInitialized = 'initializing';

        waitForQuill(function() {
            try {
                if (typeof Quill === 'undefined') {
                    return;
                }

                function uploadEditorImage(file) {
                    var formData = new FormData();
                    formData.append('image', file);
                    return fetch('/pustakawan/blog/upload-editor-image', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    })
                        .then(function(resp) {
                            if (!resp.ok) {
                                throw new Error('Upload gagal');
                            }
                            return resp.json();
                        })
                        .then(function(json) {
                            return json && json.url ? json.url : null;
                        });
                }

                function insertImageUrl(url) {
                    if (!url) return;
                    var range = quill.getSelection(true);
                    if (!range) {
                        range = { index: quill.getLength() };
                    }
                    quill.insertEmbed(range.index, 'image', url, 'user');
                    quill.setSelection(range.index + 1, 0, 'silent');
                }

                var toolbarOptions = [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'font': [] }],
                    [{ 'size': ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'] }],
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
                
                var quill = new Quill('#editor', {
                    theme: 'snow',
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
                                        uploadEditorImage(file)
                                            .then(function(url) { insertImageUrl(url); })
                                            .catch(function(err) { console.error('[Quill] Upload image error:', err); });
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

                quill.root.addEventListener('drop', function(e) {
                    e.preventDefault();
                    var files = e.dataTransfer.files;
                    if (!files || files.length === 0) return;
                    
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (file.type.indexOf('image') === -1) continue;
                        (function(f) {
                            uploadEditorImage(f)
                                .then(function(url) { insertImageUrl(url); })
                                .catch(function(err) { console.error('[Quill] Upload image error:', err); });
                        })(file);
                    }
                });
                
                quill.root.addEventListener('dragover', function(e) {
                    e.preventDefault();
                });

                quill.root.addEventListener('paste', function(e) {
                    var clipboardData = e.clipboardData || window.clipboardData;
                    if (!clipboardData) return;
                    
                    var items = clipboardData.items;
                    if (!items) return;
                    
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            e.preventDefault();
                            
                            var file = items[i].getAsFile();
                            if (!file) return;
                            uploadEditorImage(file)
                                .then(function(url) { insertImageUrl(url); })
                                .catch(function(err) { console.error('[Quill] Upload image error:', err); });
                            
                            return;
                        }
                    }
                });

                quill.on('text-change', function(delta, oldDelta, source) {
                    isiInput.value = quill.root.innerHTML;
                    
                    if (source === 'user') {
                        var selection = quill.getSelection(true);
                        if (selection) {
                            var format = quill.getFormat(selection);
                            if (!format.size && selection.length === 0) {
                                quill.format('size', '12px', 'user');
                            }
                        }
                    }
                });

                var initialNode = document.getElementById('initialIsi');
                var initialContent = '';
                
                if (initialNode) {
                    initialContent = initialNode.value || initialNode.textContent || '';
                if (initialContent) {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = initialContent;
                        initialContent = tempDiv.innerHTML;
                    }
                }
                
                if (initialContent && initialContent.trim() !== '') {
                    quill.root.innerHTML = initialContent;
                    quill.history.clear();
                    isiInput.value = initialContent;
                } else {
                    quill.root.innerHTML = '<p style="font-size: 12px;"><br></p>';
                    quill.history.clear();
                    isiInput.value = '<p style="font-size: 12px;"><br></p>';
                }

                quill.on('selection-change', function(range) {
                    if (range && range.length === 0) {
                        var format = quill.getFormat(range);
                        if (!format.size) {
                            setTimeout(function() {
                                quill.format('size', '12px', 'user');
                            }, 0);
                        }
                    }
                });

                form.addEventListener('submit', function(e) {
                    var content = quill.root.innerHTML;
                    if (!content || content.trim() === '' || content.trim() === '<p><br></p>') {
                        e.preventDefault();
                        return false;
                    }
                    isiInput.value = content;
                });

                editorEl.dataset.quillInitialized = 'true';
            } catch (error) {
                console.error('[Quill] Error:', error);
                editorEl.dataset.quillInitialized = 'false';
            }
        });
    }

    function initBlogPage() {
        var form = document.getElementById('formBlog');
        if (!form) return;
        
        setupSumberInputs();
        initBlogQuillEditor();
        setupBlogTaxonomySearch(form);
    }

    function setupBlogTaxonomySearch(form) {
        function getSelectedIds(name) {
            var nodes = form.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked');
            var ids = [];
            nodes.forEach(function(node) {
                if (node && node.value) ids.push(String(node.value));
            });
            return Array.from(new Set(ids));
        }

        function renderOptions(listEl, name, items, selectedIds, labelKey, idPrefix) {
            if (!listEl) return;
            listEl.innerHTML = '';

            if (!Array.isArray(items) || items.length === 0) {
                var empty = document.createElement('p');
                empty.className = 'text-muted mb-0';
                empty.textContent = name === 'tag[]' ? 'Belum ada tag' : 'Belum ada kategori';
                listEl.appendChild(empty);
                return;
            }

            items.forEach(function(item) {
                if (!item || typeof item.id === 'undefined' || item.id === null) return;
                var idStr = String(item.id);
                var inputId = idPrefix + idStr;

                var label = document.createElement('label');
                label.className = 'blog-multi-option blog-multi-option--light';
                label.setAttribute('for', inputId);

                var input = document.createElement('input');
                input.className = 'blog-multi-option__checkbox';
                input.type = 'checkbox';
                input.name = name;
                input.value = idStr;
                input.id = inputId;
                if (selectedIds.indexOf(idStr) !== -1) {
                    input.checked = true;
                }

                var span = document.createElement('span');
                span.className = 'blog-multi-option__label';
                span.textContent = (item[labelKey] || '').toString();

                label.appendChild(input);
                label.appendChild(span);
                listEl.appendChild(label);
            });
        }

        function fetchAndRender(endpoint, q, selectedName, listEl, labelKey, idPrefix) {
            var selectedIds = getSelectedIds(selectedName);
            var params = new URLSearchParams();
            if (q) params.set('q', q);
            if (selectedIds.length) params.set('selected', selectedIds.join(','));

            return fetch(endpoint + '?' + params.toString(), {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin'
            })
                .then(function(resp) { return resp.json(); })
                .then(function(json) {
                    var items = json && Array.isArray(json.data) ? json.data : [];
                    renderOptions(listEl, selectedName, items, selectedIds, labelKey, idPrefix);
                })
                .catch(function() {
                    renderOptions(listEl, selectedName, [], selectedIds, labelKey, idPrefix);
                });
        }

        var kategoriForm = document.getElementById('kategoriSearchForm');
        var kategoriInput = document.getElementById('kategoriSearchInput');
        var kategoriClear = document.getElementById('kategoriSearchClear');
        var kategoriSubmit = document.getElementById('kategoriSearchSubmit');
        var kategoriList = document.getElementById('kategoriList');

        if (kategoriForm && kategoriInput && kategoriClear && kategoriSubmit && kategoriList) {
            function doKategoriSearch() {
                var q = (kategoriInput.value || '').toString().trim();
                fetchAndRender('/pustakawan/blog/kategori/search', q, 'kategori[]', kategoriList, 'nama_kategori', 'kategori');
            }

            kategoriSubmit.addEventListener('click', function() {
                doKategoriSearch();
            });

            kategoriInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    doKategoriSearch();
                }
            });

            kategoriClear.addEventListener('click', function() {
                kategoriInput.value = '';
                fetchAndRender('/pustakawan/blog/kategori/search', '', 'kategori[]', kategoriList, 'nama_kategori', 'kategori');
            });
        }

        var tagForm = document.getElementById('tagSearchForm');
        var tagInput = document.getElementById('tagSearchInput');
        var tagClear = document.getElementById('tagSearchClear');
        var tagSubmit = document.getElementById('tagSearchSubmit');
        var tagList = document.getElementById('tagList');

        if (tagForm && tagInput && tagClear && tagSubmit && tagList) {
            function doTagSearch() {
                var q = (tagInput.value || '').toString().trim();
                fetchAndRender('/pustakawan/blog/tag/search', q, 'tag[]', tagList, 'nama_tag', 'tag');
            }

            tagSubmit.addEventListener('click', function() {
                doTagSearch();
            });

            tagInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    doTagSearch();
                }
            });

            tagClear.addEventListener('click', function() {
                tagInput.value = '';
                fetchAndRender('/pustakawan/blog/tag/search', '', 'tag[]', tagList, 'nama_tag', 'tag');
            });
        }
    }

    function initAll() {
        initBlogPage();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        setTimeout(initAll, 0);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    $('#updateStatusModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const status = button.data('status');
        const modal = $(this);
        const modalContent = modal.find('#updateStatusModalContent');
        const modalHeader = modal.find('#updateStatusModalHeader');
        
        modal.find('#statusInput').val(status);
        
        // Remove previous status classes
        modalContent.removeClass('blog-status-modal-valid blog-status-modal-invalid');
        modalHeader.removeClass('blog-status-modal-header-valid blog-status-modal-header-invalid');
        
        if (status === 'Valid') {
            modal.find('#updateStatusModalLabel').text('Setujui Blog');
            modal.find('#submitBtn').removeClass('btn-danger').addClass('btn-success').html('<i class="mdi mdi-check"></i> Setujui');
            modalContent.addClass('blog-status-modal-valid');
            modalHeader.addClass('blog-status-modal-header-valid');
        } else {
            modal.find('#updateStatusModalLabel').text('Tolak Blog');
            modal.find('#submitBtn').removeClass('btn-success').addClass('btn-danger').html('<i class="mdi mdi-close"></i> Tolak');
            modalContent.addClass('blog-status-modal-invalid');
            modalHeader.addClass('blog-status-modal-header-invalid');
        }
    });
});