document.addEventListener('DOMContentLoaded', function () {
    var toggleButtons = document.querySelectorAll('.toggle-password')
    toggleButtons.forEach(function (toggleButton) {
        var inputGroup = toggleButton.closest('.input-group')
        if (!inputGroup) return
        var passwordInput = inputGroup.querySelector('input[type="password"], input[type="text"]')
        var toggleIcon = toggleButton.querySelector('i')
        if (!passwordInput || !toggleIcon) return
        toggleButton.addEventListener('click', function () {
            var isPassword = passwordInput.type === 'password'
            passwordInput.type = isPassword ? 'text' : 'password'
            if (isPassword) {
                toggleIcon.classList.remove('bi-eye-slash')
                toggleIcon.classList.add('bi-eye')
            } else {
                toggleIcon.classList.remove('bi-eye')
                toggleIcon.classList.add('bi-eye-slash')
            }
        })
    })

    var container = document.querySelector('.flash-container-auth')
    if (container) {
        var flashes = container.querySelectorAll('.flash')
        flashes.forEach(function (el) {
            var timeout = el.classList.contains('flash-success') ? 4000 : 8000
            function removeEl() {
                el.style.animation = 'flash-out 180ms ease-in forwards'
                setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el) }, 200)
            }
            setTimeout(removeEl, timeout)
            el.addEventListener('click', removeEl)
        })
        container.addEventListener('click', function(e){
            var el = e.target.closest('.flash')
            if (!el) return
            el.style.animation = 'flash-out 180ms ease-in forwards'
            setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el) }, 200)
        })
    }
})

