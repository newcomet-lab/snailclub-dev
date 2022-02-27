const html = `
<script>
    /(trident|msie)/i.test(navigator.userAgent) && document.getElementById && window.addEventListener && window.addEventListener("hashchange", function () { var t, e = location.hash.substring(1); /^[A-z0-9_-]+$/.test(e) && (t = document.getElementById(e)) && (/^(?:a|select|input|button|textarea)$/i.test(t.tagName) || (t.tabIndex = -1), t.focus()) }, !1);
</script>
<script src="/wp-content/themes/s3c/js/jquery.min.js"></script>
<script src="/wp-content/themes/s3c/js/bootstrap.min.js"></script>
<script src="/wp-content/themes/s3c/js/owl.carousel.min.js"></script>
<script src="/wp-content/themes/s3c/js/wow.js"></script>
<script>

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    if (mediaQuery.matches) {
        function openNav() {
            var element = document.getElementById("hamburgertoggle");
            element.classList.toggle("hamburgertoggleshowmob");
        }
    }
    const mediaQuery1 = window.matchMedia('(min-width: 769px)');
    if (mediaQuery1.matches) {
        function openNav() {
            var element = document.getElementById("hamburgertoggle");
            element.classList.toggle("hamburgertoggleshow");
        }
    }

    $(document).on('click', function () {
        $('.hamburgertoggle').removeClass('hamburgertoggleshow');
        $('.hamburgertoggle').removeClass('hamburgertoggleshowmob');
        //document.getElementById("hamburgertoggle").style.width = "0";
        //document.getElementById("hamburgertoggle").style.right = "0";
    });
    $(".hamburgermenu").click(function (event) {
        event.stopPropagation();
    });
</script>
<script>
    $(function () {
        $('a[href*=#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\\//, '') === this.pathname.replace(/^\\//, '') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top + 0
                    }, 800);
                    return false;
                }
            }
        });
    });
</script>
<script>
    wow = new WOW(
        {
            animateClass: 'animated',
            offset: 100,
            callback: function (box) {
                console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
            }
        }
    );
    wow.init();
</script>
<script>
    var owl = $('.owl-banner');
    owl.owlCarousel({
        loop: true,
        nav: false,
        margin: 0,
        autoplay: true,
        autoplayTimeout: 2000,
        autoplayHoverPause: true,
        smartSpeed: 1500,
        dots: false,
        touchDrag: true,
        mouseDrag: true,
        center: false,
        items: 1,
    });
</script>
`;

export default html;