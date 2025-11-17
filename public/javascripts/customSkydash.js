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