(function () {
        var b = document.body,
          mq = document.getElementById("mq");

        /* Letreiro: o texto é repetido 8x para nunca "acabar" */
        var t =
          "<span>40% smaller than others on the market</span><span>•</span><span>40% smaller than others on the market</span><span>•</span>";
        mq.innerHTML = t.repeat(8);

        /* Cortina de entrada: sobe após carregar (ou em 1,5s, o que vier primeiro) */
        addEventListener("load", function () {
          setTimeout(function () {
            b.classList.add("ready");
          }, 250);
        });
        setTimeout(function () {
          b.classList.add("ready");
        }, 1500);

        /* Fade ao rolar: elementos .rv ganham a classe "in" ao aparecer 15% */
        var io = new IntersectionObserver(
          function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.15 },
        );
        document.querySelectorAll(".rv").forEach(function (el) {
          io.observe(el);
        });

        /* Parallax + letreiro */
        var ps = [].slice.call(document.querySelectorAll("[data-p]")),
          tk = false,
          unit = 900; /* largura de 1 repetição do texto do letreiro */

        /* Mede 1 repetição de verdade (muda com a tela/fonte). O letreiro anda
           em múltiplos dessa medida, então o "reinício" nunca dá salto. */
        function measure() {
          unit = mq.scrollWidth / 8 || 900;
        }
        function upd() {
          var vh = innerHeight;
          ps.forEach(function (el) {
            var r = el.parentNode.getBoundingClientRect();
            if (r.bottom < -200 || r.top > vh + 200) return; /* fora da tela */
            var c =
              r.top + r.height / 2 - vh / 2; /* distância ao centro da tela */
            el.style.transform =
              "translate3d(0," + c * -parseFloat(el.dataset.p) + "px,0)";
          });
          mq.style.transform =
            "translateX(" + (-(scrollY * 0.5) % unit) + "px)";
          tk = false;
        }
        addEventListener(
          "scroll",
          function () {
            if (!tk) {
              tk = true;
              requestAnimationFrame(upd);
            }
          },
          { passive: true },
        );
        addEventListener("resize", function () {
          measure();
          upd();
        });
        addEventListener("load", function () {
          measure();
          upd();
        });
        measure();
        upd();

        /* Formulário: envia ao Mailchimp (via iframe oculto) e troca por "Thanks!" */
        document.getElementById("nl").addEventListener("submit", function () {
          var f = this;
          setTimeout(function () {
            f.style.display = "none";
          }, 0);
          document.getElementById("ok").style.display = "block";
        });
      })();