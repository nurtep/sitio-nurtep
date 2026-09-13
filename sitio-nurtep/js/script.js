document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. NAVEGACIÓN Y MENÚ MÓVIL
    // ==========================================
    const menuToggle = document.getElementById("mobile-menu-toggle") || document.querySelector('.hamburger');
    const navLinks = document.getElementById("nav-links") || document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            navLinks.classList.toggle("open");
            menuToggle.classList.toggle("open");
        });
    }

    // ==========================================
    // 2. DESPLAZAMIENTO SUAVE (SMOOTH SCROLL)
    // ==========================================
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (navLinks) {
                    navLinks.classList.remove("active");
                    navLinks.classList.remove("open");
                }
                if (menuToggle) menuToggle.classList.remove("open");
                
                targetElement.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });

    // ==========================================
    // 3. LÓGICA PARA CARRUSELES
    // ==========================================
    const carousels = document.querySelectorAll(".carousel-container");

    carousels.forEach((carousel, carouselIndex) => {
        const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
        const nextButton = carousel.querySelector(".carousel-btn.next");
        const prevButton = carousel.querySelector(".carousel-btn.prev");

        let currentIndex = 0;
        let autoplayTimer = null;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === 0);
        });

        const showSlide = (index) => {
            slides[currentIndex].classList.remove("active");

            if (index < 0) {
                currentIndex = slides.length - 1;
            } else if (index >= slides.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            slides[currentIndex].classList.add("active");
            resetAutoplay();
        };

        if (nextButton) nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
        if (prevButton) prevButton.addEventListener("click", () => showSlide(currentIndex - 1));

        const startAutoplay = () => {
            if (autoplayTimer) clearInterval(autoplayTimer);
            autoplayTimer = setInterval(() => {
                showSlide(currentIndex + 1);
            }, 7000);
        };

        const stopAutoplay = () => {
            if (autoplayTimer) clearInterval(autoplayTimer);
        };

        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        carousel.addEventListener("mouseenter", stopAutoplay);
        carousel.addEventListener("mouseleave", startAutoplay);

        let startX = 0;
        carousel.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        carousel.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const swipeThreshold = 40;
            if (startX - endX > swipeThreshold) {
                showSlide(currentIndex + 1);
            } else if (endX - startX > swipeThreshold) {
                showSlide(currentIndex - 1);
            }
        }, { passive: true });

        const initialDelay = carouselIndex * 1200;
        setTimeout(() => {
            startAutoplay();
        }, initialDelay);
    });

    // ==========================================
    // 4. VISOR GLOBAL EN PANTALLA COMPLETA (LIGHTBOX CON CONTADOR)
    // ==========================================
    const allCarouselImages = Array.from(document.querySelectorAll(".carousel-slide img"));
    let currentLightboxIndex = 0;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox-modal";
    lightbox.innerHTML = `
        <span class="lightbox-close" aria-label="Cerrar">&times;</span>
        <div class="lightbox-counter"></div>
        <button class="lightbox-btn lightbox-prev" aria-label="Anterior">&#10094;</button>
        <button class="lightbox-btn lightbox-next" aria-label="Siguiente">&#10095;</button>
        <div class="lightbox-wrapper">
            <img class="lightbox-content" src="" alt="Vista previa de proyecto">
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector(".lightbox-content");
    const lightboxClose = lightbox.querySelector(".lightbox-close");
    const lightboxPrev = lightbox.querySelector(".lightbox-prev");
    const lightboxNext = lightbox.querySelector(".lightbox-next");
    const lightboxCounter = lightbox.querySelector(".lightbox-counter");

    const updateLightboxImage = (index) => {
        if (allCarouselImages.length === 0) return;

        if (index < 0) {
            index = allCarouselImages.length - 1;
        } else if (index >= allCarouselImages.length) {
            index = 0;
        }

        currentLightboxIndex = index;
        const targetImg = allCarouselImages[currentLightboxIndex];
        lightboxImg.src = targetImg.src;
        lightboxImg.alt = targetImg.alt || "Imagen de Proyecto";

        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${allCarouselImages.length}`;
    };

    allCarouselImages.forEach((img, index) => {
        img.addEventListener("click", (e) => {
            e.stopPropagation();
            updateLightboxImage(index);
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    };

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-wrapper")) {
            closeLightbox();
        }
    });

    lightboxPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        updateLightboxImage(currentLightboxIndex - 1);
    });

    lightboxNext.addEventListener("click", (e) => {
        e.stopPropagation();
        updateLightboxImage(currentLightboxIndex + 1);
    });

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;

        if (e.key === "Escape") {
            closeLightbox();
        } else if (e.key === "ArrowLeft") {
            updateLightboxImage(currentLightboxIndex - 1);
        } else if (e.key === "ArrowRight") {
            updateLightboxImage(currentLightboxIndex + 1);
        }
    });

    let lbStartX = 0;
    lightbox.addEventListener("touchstart", (e) => {
        lbStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
        if (e.target.classList.contains("lightbox-close") || e.target.classList.contains("lightbox-btn")) return;

        const lbEndX = e.changedTouches[0].clientX;
        const swipeThreshold = 40;
        if (lbStartX - lbEndX > swipeThreshold) {
            updateLightboxImage(currentLightboxIndex + 1);
        } else if (lbEndX - lbStartX > swipeThreshold) {
            updateLightboxImage(currentLightboxIndex - 1);
        }
    }, { passive: true });

    // ==========================================
    // 5. CONTROL DE ENVÍO DE FORMULARIO DE CONTACTO
    // ==========================================
    const formulario = document.getElementById("form-contacto") || document.getElementById("contact-form");

    if (formulario) {
        formulario.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(formulario);
            const isEnglish = window.location.pathname.includes('/en/');

            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            })
            .then(() => {
                const msgSuccess = isEnglish 
                    ? "Message sent successfully! At Nurtep we will contact you very soon."
                    : "¡Mensaje enviado con éxito! En Nurtep nos pondremos en contacto contigo muy pronto.";
                alert(msgSuccess);
                formulario.reset();
            })
            .catch((error) => {
                const msgError = isEnglish
                    ? "There was an error sending the message. Please try again or email us directly at admon@nurtep.com"
                    : "Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo o escríbenos directamente a admon@nurtep.com";
                alert(msgError);
                console.error(error);
            });
        });
    }

    // ==========================================
    // 6. ANIMACIÓN DE CONTADOR NUMÉRICO
    // ==========================================
    const counters = document.querySelectorAll(".counter");
    const statsSection = document.querySelector(".stats-section-full") || document.querySelector(".stats-section");

    if (statsSection && counters.length > 0) {
        const activeAnimations = new Map();

        const resetCounters = () => {
            counters.forEach((counter) => {
                if (activeAnimations.has(counter)) {
                    cancelAnimationFrame(activeAnimations.get(counter));
                    activeAnimations.delete(counter);
                }
                counter.textContent = "0";
            });
        };

        const startCounting = () => {
            counters.forEach((counter) => {
                const target = +counter.getAttribute("data-target");
                const duration = 2000;
                const startTime = performance.now();

                const updateCounter = (currentTime) => {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);
                    
                    counter.textContent = Math.floor(progress * target);

                    if (progress < 1) {
                        const frameId = requestAnimationFrame(updateCounter);
                        activeAnimations.set(counter, frameId);
                    } else {
                        counter.textContent = target;
                        activeAnimations.delete(counter);
                    }
                };

                const frameId = requestAnimationFrame(updateCounter);
                activeAnimations.set(counter, frameId);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    resetCounters();
                    startCounting();
                } else {
                    resetCounters();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(statsSection);
    }

    // ==========================================
    // 7. ANIMACIÓN GENERAL AL HACER SCROLL
    // ==========================================
    const observerOptions = { threshold: 0.1 };
    const generalObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach(el => generalObserver.observe(el));

    // ==========================================
    // 8. BOTÓN VOLVER ARRIBA Y COPYRIGHT
    // ==========================================
    const scrollTopBtn = document.getElementById("scroll-top-btn");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            scrollTopBtn.style.display = (window.scrollY > 300) ? "block" : "none";
        });

        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // 9. CONTROL SWITCH DE IDIOMA (ES / EN)
    // ==========================================
    const langToggle = document.getElementById("lang-toggle");

    if (langToggle) {
        const currentPath = window.location.pathname;
        const isInEnFolder = currentPath.includes("/en/");

        if (isInEnFolder) {
            langToggle.checked = true;
            document.body.classList.add("in-en-folder");
        } else {
            langToggle.checked = false;
        }

        langToggle.addEventListener("change", () => {
            let pageName = currentPath.substring(currentPath.lastIndexOf("/") + 1);
            const isHomePage = !pageName || pageName === "" || pageName === "index.html";

            if (langToggle.checked) {
                if (isInEnFolder) {
                    window.location.href = isHomePage ? "./" : pageName;
                } else {
                    window.location.href = isHomePage ? "en/" : "en/" + pageName;
                }
            } else {
                if (isInEnFolder) {
                    window.location.href = isHomePage ? "../" : "../" + pageName;
                } else {
                    window.location.href = isHomePage ? "./" : pageName;
                }
            }
        });
    }

    // ==========================================
    // 10. CHATBOT BÁSICO NURTY (ATENCIÓN A CLIENTES)
    // ==========================================
    const toggleBtn = document.getElementById("nurty-toggle") || document.getElementById("chat-toggle");
    const closeBtn = document.getElementById("nurty-close") || document.getElementById("chat-close");
    const chatBox = document.getElementById("nurty-box") || document.getElementById("chat-box");
    const sendBtn = document.getElementById("nurty-send") || document.getElementById("send-btn");
    const input = document.getElementById("nurty-input") || document.getElementById("chat-input");
    const messagesContainer = document.getElementById("nurty-messages") || document.getElementById("chat-messages");

    if (toggleBtn && chatBox) {

        const loadChatHistory = () => {
            const savedHistory = sessionStorage.getItem("nurty_chat_history");
            if (savedHistory && messagesContainer) {
                const historyArr = JSON.parse(savedHistory);
                if (historyArr.length > 0) {
                    messagesContainer.innerHTML = "";
                    historyArr.forEach(msg => appendMessageUI(msg.text, msg.sender));
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
            
            const isChatOpen = sessionStorage.getItem("nurty_chat_open") === "true";
            if (isChatOpen) {
                chatBox.style.display = "flex";
                toggleBtn.classList.add("chat-open");
                if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            }
        };

        const saveChatMessage = (text, sender) => {
            let history = JSON.parse(sessionStorage.getItem("nurty_chat_history") || "[]");
            history.push({ text, sender });
            sessionStorage.setItem("nurty_chat_history", JSON.stringify(history));
        };

        toggleBtn.addEventListener("click", () => {
            const isFlex = chatBox.style.display === "flex";
            chatBox.style.display = isFlex ? "none" : "flex";
            toggleBtn.classList.toggle("chat-open", !isFlex);
            sessionStorage.setItem("nurty_chat_open", !isFlex);
            
            if (!isFlex && messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                chatBox.style.display = "none";
                toggleBtn.classList.remove("chat-open");
                sessionStorage.setItem("nurty_chat_open", false);
            });
        }

        function appendMessageUI(text, sender) {
            if (!messagesContainer) return null;
            const msgDiv = document.createElement("div");
            msgDiv.className = sender === "user" ? "message user user-message" : "message bot bot-message";
            
            let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formatted = formatted.replace(/\n/g, "<br>");
            
            msgDiv.innerHTML = formatted;
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgDiv;
        }

        function addMessage(text, sender) {
            appendMessageUI(text, sender);
            saveChatMessage(text, sender);
        }

        function showTypingIndicator(isEnglish) {
            if (!messagesContainer) return null;
            const msgDiv = document.createElement("div");
            msgDiv.className = "message bot bot-message nurty-typing";
            msgDiv.textContent = isEnglish ? "Nurty is typing..." : "Nurty está escribiendo...";
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgDiv;
        }

        // Llama a la función serverless de Netlify que a su vez llama a la API de Gemini
        async function fetchAIResponse(text, isEnglish) {
            const history = JSON.parse(sessionStorage.getItem("nurty_chat_history") || "[]").slice(-10);

            const response = await fetch("/.netlify/functions/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: history,
                    lang: isEnglish ? "en" : "es"
                })
            });

            if (!response.ok) {
                throw new Error("Respuesta no válida de la función de IA (" + response.status + ")");
            }

            const data = await response.json();
            if (!data || !data.reply) {
                throw new Error("Respuesta vacía de la IA");
            }

            return data.reply;
        }

        const sendMessage = async () => {
            const text = input.value.trim();
            if (!text) return;

            const isEnglish = window.location.pathname.includes('/en/');

            addMessage(text, "user");
            input.value = "";

            const typingNode = showTypingIndicator(isEnglish);

            try {
                const reply = await fetchAIResponse(text, isEnglish);
                if (typingNode) typingNode.remove();
                addMessage(reply, "bot");
            } catch (err) {
                console.error("Nurty AI error, usando respaldo local:", err);
                if (typingNode) typingNode.remove();
                // Respaldo: si la función de Netlify o la API de Gemini fallan,
                // seguimos respondiendo con el motor de reglas local para no dejar al usuario sin respuesta.
                setTimeout(() => {
                    const fallbackReply = getNurtyResponse(text);
                    addMessage(fallbackReply, "bot");
                }, 200);
            }
        };

        if (sendBtn) sendBtn.addEventListener("click", sendMessage);
        if (input) {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") sendMessage();
            });
        }

        loadChatHistory();

        function getNurtyResponse(query) {
            const q = query.toLowerCase().trim();
            const isEnglish = window.location.pathname.includes('/en/');

            // Saludos
            if (/\b(hola|hi|hello|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(q)) {
                return isEnglish
                    ? "Hello! Nice to meet you. My name is **Nurty**, your virtual assistant at Nurtep. How can I help you today?"
                    : "¡Hola! Es un gusto saludarte. Mi nombre es **Nurty**, tu asistente de atención en Nurtep. ¿En qué te puedo ayudar hoy?";
            }

            // Despedidas
            if (/\b(adios|adiós|bye|nos vemos|hasta luego|see you)\b/.test(q)) {
                return isEnglish
                    ? "Goodbye! It was a pleasure serving you. At Nurtep we remain at your service. Have a great day!"
                    : "¡Hasta luego! Fue un placer atenderte. En Nurtep quedamos a tu disposición. ¡Que tengas un excelente día!";
            }

            // Agradecimientos
            if (/\b(gracias|thank|thanks|ok|perfecto|perfect)\b/.test(q)) {
                return isEnglish
                    ? "You are very welcome! We are here to serve you. If you need anything else, I'll be right here 👷‍♂️."
                    : "¡Con todo gusto! Estamos para servirte. Si necesitas algo más, aquí estaré 👷‍♂️.";
            }

            // Aclaración sobre Proyectos Residenciales / Vivienda
            if (/\b(casa|casas|vivienda|habitacional|house|residential)\b/.test(q)) {
                return isEnglish
                    ? "Thank you for asking! However, Nurtep does **not carry out residential housing projects**. We specialize strictly in industrial buildings, commercial spaces, and corporate offices 🏢."
                    : "Agradecemos mucho tu interés, pero en Nurtep **no realizamos proyectos de vivienda o casas habitacionales**. Nuestro equipo está especializado en naves industriales, bodegas y locales comerciales 🏢.";
            }

            // Director General / Quién creó la empresa o el chatbot
            if (/\b(director|directora|ceo|dueñ[oa]|fundador|fundadora|jesus mancinas|jesús mancinas|quien.*(programo|programó|creo|creó|hizo|diseñ))\b/.test(q) ||
                /\b(who (made|created|built|programmed|designed) (you|nurty|this))\b/.test(q)) {
                return isEnglish
                    ? "Nurtep was founded and designed by **Arq. Jesús Mancinas**, our CEO. He's also the one who designed this website and programmed me, Nurty! 👷‍♂️"
                    : "Nurtep fue fundada y diseñada por el **Arq. Jesús Mancinas**, nuestro Director General (CEO). ¡Él también diseñó este sitio web y me programó a mí, Nurty! 👷‍♂️";
            }

            // Easter Egg: Curiosidades sobre el Director General (Arq. Jesús Mancinas)
            const calculateAge = (birthYear, birthMonthIndex, birthDay) => {
                const birthDate = new Date(birthYear, birthMonthIndex, birthDay);
                const now = new Date();
                let age = now.getFullYear() - birthDate.getFullYear();
                const hasHadBirthdayThisYear =
                    now.getMonth() > birthDate.getMonth() ||
                    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
                if (!hasHadBirthdayThisYear) age -= 1;
                return age;
            };

            if (/\b(edad del director|cuantos años tiene (el director|jesus|jesús)|how old is (the director|jesus))\b/.test(q)) {
                const age = calculateAge(1996, 11, 13); // 13 de diciembre de 1996
                return isEnglish
                    ? `Arq. Jesús Mancinas was born on December 13th, 1996, so he's currently **${age} years old** 🎂.`
                    : `El Arq. Jesús Mancinas nació el 13 de diciembre de 1996, así que actualmente tiene **${age} años** 🎂.`;
            }

            if (/\b(comida favorita|favorite food)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite food is **hamburgers** 🍔."
                    : "La comida favorita de nuestro director es la **hamburguesa** 🍔.";
            }

            if (/\b(color favorito|favorite color)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite color is **purple** 💜."
                    : "El color favorito de nuestro director es el **morado** 💜.";
            }

            if (/\b(pasatiempo|pasatiempos|hobby|hobbies)\b/.test(q)) {
                return isEnglish
                    ? "In his free time, our CEO enjoys **chess, the Rubik's Cube, and 3D printing** ♟️🧩🖨️."
                    : "En su tiempo libre, nuestro director disfruta del **ajedrez, el Cubo de Rubik y la impresión 3D** ♟️🧩🖨️.";
            }

            if (/\b(marca de carro|carro favorito|favorite car|car brand)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite car brand is **Toyota** 🚗."
                    : "La marca de carro favorita de nuestro director es **Toyota** 🚗.";
            }

            if (/\b(sistema operativo|operating system)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO mainly uses **Android and Windows** 📱💻."
                    : "Nuestro director utiliza principalmente **Android y Windows** 📱💻.";
            }

            if (/\b(donde nacio|dónde nació|born in|birthplace)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO was born in **Tijuana, B.C.** 🇲🇽."
                    : "Nuestro director nació en **Tijuana, B.C.** 🇲🇽.";
            }

            if (/\b(musico favorito|músico favorito|banda favorita|favorite musician|favorite band)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite music act is **Daft Punk** 🎧."
                    : "El músico favorito de nuestro director es **Daft Punk** 🎧.";
            }

            if (/\b(sabor de agua|flavor of water)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite \"agua fresca\" flavor is **horchata** 🥤."
                    : "El sabor de agua favorito de nuestro director es la **horchata** 🥤.";
            }

            if (/\b(clima prefiere|prefiere el clima|clima favorito|favorite weather)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO prefers **cold weather** ❄️."
                    : "A nuestro director le gusta más el **clima frío** ❄️.";
            }

            if (/\b(marca de tenis|tenis favorit|sneaker brand|favorite shoe)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite sneaker brand is **Nike** 👟."
                    : "La marca de tenis favorita de nuestro director es **Nike** 👟.";
            }

            if (/\b(ciudad favorita|favorite city)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO's favorite city is **Paris** 🗼."
                    : "La ciudad favorita de nuestro director es **París** 🗼.";
            }

            if (/\b(cuanto mide|estatura del director|how tall)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO is **180 cm** tall 📏."
                    : "Nuestro director mide **180 cm** 📏.";
            }

            if (/\b(cuanto pesa|peso del director|how much does.*weigh)\b/.test(q)) {
                return isEnglish
                    ? "Our CEO weighs **115 kg** ⚖️."
                    : "Nuestro director pesa **115 kg** ⚖️.";
            }

            if (/\b(curiosidad|curiosidades|dato curioso|datos curiosos|fun fact|trivia|cuentame sobre el director|cuéntame sobre el director|tell me about the director)\b/.test(q)) {
                return isEnglish
                    ? "Fun fact! Our CEO, **Arq. Jesús Mancinas**, was born in Tijuana, loves hamburgers, purple, cold weather, Toyota cars, Nike sneakers, and spends his free time playing chess, solving the Rubik's Cube, and 3D printing 😄. Want to know something more specific about him?"
                    : "¡Dato curioso! Nuestro director, el **Arq. Jesús Mancinas**, nació en Tijuana, le encantan las hamburguesas, el color morado, el clima frío, los autos Toyota y los tenis Nike, y en su tiempo libre juega ajedrez, arma el Cubo de Rubik y hace impresión 3D 😄. ¿Quieres saber algo más específico sobre él?";
            }

            // Años de experiencia (cálculo dinámico desde la fundación)
            if (/\b(experiencia|años tienen|cuando (se fundo|fue fundada)|cuándo (se fundó|fue fundada)|founded|years of experience|how long.*(company|business|nurtep))\b/.test(q)) {
                const foundingDate = new Date(2025, 11, 1); // 01 de diciembre de 2025
                const now = new Date();
                let years = now.getFullYear() - foundingDate.getFullYear();
                const hasHadAnniversaryThisYear =
                    now.getMonth() > foundingDate.getMonth() ||
                    (now.getMonth() === foundingDate.getMonth() && now.getDate() >= foundingDate.getDate());
                if (!hasHadAnniversaryThisYear) years -= 1;
                years = Math.max(years, 0);
                return isEnglish
                    ? `Nurtep was founded on **December 1st, 2025**, which means we currently have around **${years} year(s)** of experience in industrial construction 🏗️.`
                    : `Nurtep se fundó el **01 de diciembre de 2025**, por lo que actualmente contamos con aproximadamente **${years} año(s)** de experiencia en construcción industrial 🏗️.`;
            }

            // Zonas / Regiones de cobertura
            if (/\b(zona|zonas|region|región|regiones|donde (trabajan|operan)|cobertura|where do you (work|operate)|areas do you cover)\b/.test(q)) {
                return isEnglish
                    ? "We currently offer our services in **Tijuana** and **Rosarito**, Baja California 📍."
                    : "Actualmente ofrecemos nuestros servicios en la ciudad de **Tijuana** y **Rosarito**, Baja California 📍.";
            }

            // Portafolio / Proyectos anteriores
            if (/\b(portafolio|portfolio|referencias|proyectos anteriores|previous (work|projects)|que (proyectos|obras) han (hecho|realizado))\b/.test(q)) {
                return isEnglish
                    ? "We've worked on projects such as **industrial dining halls, corporate offices, structures, and foundations**. Check out our Projects gallery for more! 📸"
                    : "Hemos realizado proyectos como **comedores industriales, oficinas corporativas, estructuras y cimentaciones**. ¡Échale un vistazo a nuestra galería de Proyectos! 📸";
            }

            // Certificaciones y permisos
            if (/\b(certificacion|certificación|certificado|permiso|licencia|certified|certification|license|permit)\b/.test(q)) {
                return isEnglish
                    ? "Yes, Nurtep holds current **certifications and permits** to operate, including **DC-3** compliance for industrial safety and civil protection regulations ✅."
                    : "Sí, en Nurtep contamos con **certificaciones y permisos vigentes** para operar, incluyendo el **DC-3** para cumplir con normativas de seguridad industrial y protección civil ✅.";
            }

            // Sectores atendidos
            if (/\b(sector|sectores|industria|industry|specializ|especializ)\b/.test(q)) {
                return isEnglish
                    ? "We work with clients across **the entire industrial sector** — we're not limited to a single industry 🏭."
                    : "Trabajamos con clientes de **todo el sector industrial**, no nos limitamos a una sola industria en particular 🏭.";
            }

            // Tiempo de construcción de una nave nueva
            if (/\b(cuanto tiempo|cuánto tiempo|tiempo de (construccion|construcción)|construction time|how long.*(build|construct))\b/.test(q)) {
                return isEnglish
                    ? "It depends on the scale and type of system you need. We'd start with an executive project and financial analysis to give you an estimated construction schedule 📅."
                    : "Depende de la magnitud y el tipo de sistema que quieras manejar. Se necesitaría un proyecto ejecutivo y un análisis financiero para tener un programa de obra estimado 📅.";
            }

            // Materiales de construcción
            if (/\b(material|materiales|acero|concreto|prefabricado|steel|concrete|prefab)\b/.test(q)) {
                return isEnglish
                    ? "The materials (steel, concrete, prefabricated, etc.) depend on the analysis and requirements of each specific project 🔩."
                    : "Los materiales que utilizamos (acero, concreto, prefabricados, etc.) dependen del análisis y los requerimientos de cada proyecto en particular 🔩.";
            }

            // Diseño y planeación arquitectónica
            if (/\b(diseño arquitectonico|diseño arquitectónico|planeacion|planeación|architectural design|blueprint)\b/.test(q)) {
                return isEnglish
                    ? "Yes, at Nurtep we handle the full process: **planning, execution, and control** of your project, including architectural design 📐."
                    : "Sí, en Nurtep manejamos la **planeación, ejecución y control** completos de tu proyecto, incluyendo el diseño arquitectónico 📐.";
            }

            // Tamaño de las naves
            if (/\b(tamaño|tamano|dimension|dimensión|size|minimo|mínimo|maximo|máximo|minimum|maximum)\b/.test(q)) {
                return isEnglish
                    ? "There is **no defined limit** on the minimum or maximum size of the industrial buildings we can construct 📏."
                    : "No hay un **límite definido** en cuanto al tamaño mínimo o máximo de las naves industriales que podemos construir 📏.";
            }

            // Mantenimiento: tipo
            if (/\b(mantenimiento preventivo|mantenimiento correctivo|tipo de mantenimiento|maintenance type|preventive|corrective)\b/.test(q)) {
                return isEnglish
                    ? "We offer **both preventive and corrective maintenance** 🔧."
                    : "Ofrecemos **ambos tipos de mantenimiento: preventivo y correctivo** 🔧.";
            }

            // Mantenimiento: frecuencia
            if (/\b(frecuencia|cada cuanto|cada cuánto|que tan seguido|how often)\b/.test(q)) {
                return isEnglish
                    ? "It depends on the area and the material it's made of — maintenance frequency is evaluated case by case 🗓️."
                    : "Depende del área y del material del que esté hecho; la frecuencia de mantenimiento se evalúa caso por caso 🗓️.";
            }

            // Mantenimiento: emergencias fuera de horario
            if (/\b(emergencia|urgencia|fuera de horario|emergency|urgent|after hours)\b/.test(q)) {
                return isEnglish
                    ? "We attend after-hours emergencies **only when covered under warranty** for work we've previously completed 🚨."
                    : "Atendemos emergencias fuera de horario **únicamente cuando aplica garantía** por trabajos que hayamos realizado previamente 🚨.";
            }

            // Mantenimiento: contratos
            if (/\b(contrato de mantenimiento|maintenance contract|contrato anual)\b/.test(q)) {
                return isEnglish
                    ? "Yes, we offer **annual maintenance contracts** as well as per-project agreements 📄."
                    : "Sí, ofrecemos **contratos de mantenimiento anual**, así como acuerdos por proyecto 📄.";
            }

            // Ampliación sin detener operaciones
            if (/\b(ampliar|ampliacion|ampliación|expand|expansion|sin detener|sin parar|without stopping)\b/.test(q)) {
                return isEnglish
                    ? "Yes, we can expand an existing building **without stopping your operations**, as long as we agree on the conditions beforehand 🏗️."
                    : "Sí, podemos ampliar una nave existente **sin detener tus operaciones**, siempre y cuando estemos de acuerdo con las condiciones 🏗️.";
            }

            // Alcance de remodelación
            if (/\b(remodelacion|remodelación|remodel|renovation)\b/.test(q)) {
                return isEnglish
                    ? "A remodeling project can include **roofing, flooring, lighting, insulation**, and anything else your project requires 🛠️."
                    : "Un proyecto de remodelación puede incluir **techos, pisos, iluminación, aislamiento** y todo lo que tu proyecto requiera 🛠️.";
            }

            // Normativas de seguridad
            if (/\b(normativa|proteccion civil|protección civil|seguridad industrial|dc-3|dc3|safety regulation)\b/.test(q)) {
                return isEnglish
                    ? "Yes, we carry out adequations to comply with industrial safety and civil protection regulations, and we hold **DC-3** certification ✅."
                    : "Sí, realizamos adecuaciones para cumplir con normativas de seguridad industrial y protección civil, y contamos con certificación **DC-3** ✅.";
            }

            // Garantía
            if (/\b(garantia|garantía|warranty|guarantee)\b/.test(q)) {
                return isEnglish
                    ? "Yes, we offer a warranty on our construction and remodeling work. If you'd like it in writing, just request a contract that includes it 📝."
                    : "Sí, ofrecemos garantía sobre la construcción o remodelación realizada. Si la necesitas por escrito, solo solicita un contrato que la incluya 📝.";
            }

            // Documentos requeridos
            if (/\b(documentos|requisitos|documents|requirements)\b/.test(q)) {
                return isEnglish
                    ? "To start a quote, we just need you to be **a company authorized to operate in Mexico** 📋."
                    : "Para iniciar una cotización, solo necesitamos que seas **una empresa que pueda operar en México** 📋.";
            }

            // Servicios generales (lista completa)
            if (/\b(servicio|servicios|que hacen|qué hacen|what do you do|que ofrecen|qué ofrecen|offer)\b/.test(q)) {
                return isEnglish
                    ? "We offer full civil works solutions 🏗️:\n• **Construction & Finishing**: light construction, remodeling, painting, flooring, foundation, structure\n• **Specialized Installations**: electrical, plumbing, sanitary, HVAC, mechanical\n• **Safety Systems & Trades**: fire protection systems, ironwork, carpentry, glazing"
                    : "Ofrecemos soluciones integrales de obra civil 🏗️:\n• **Construcción y Acabados**: obra ligera, remodelación, pintura, piso, cimentación, estructura\n• **Instalaciones Especializadas**: eléctrica, hidráulica, sanitaria, HVAC, mecánica\n• **Sistemas de Seguridad y Oficios**: sistema contra incendios, herrería, carpintería, cancelería";
            }

            // Cotizaciones, Citas y Precios
            if (/\b(cotiz|cotizacion|cotización|cuanto cuesta|costo|precio|metro cuadrado|m2|quote|cost|price|cita|visita|terreno|agendar|appointment|schedule)\b/.test(q)) {
                return isEnglish
                    ? "The price varies depending on the quality required, delivery time, and site conditions. For quotes, technical specs, or scheduling a site visit, please contact us directly 📐:\n• **Phone / WhatsApp**: 664-666-4984\n• **Email**: admon@nurtep.com"
                    : "El costo y propuesta varían según la calidad requerida del proyecto, el tiempo de entrega y las condiciones de ejecución 🏗️. Para agendar una cita o cotizar tu proyecto, comunícate directamente con nosotros:\n• **Teléfono / WhatsApp**: 664-666-4984\n• **Correo**: admon@nurtep.com";
            }

            // Datos de Contacto
            if (/\b(contacto|telefono|teléfono|correo|whatsapp|contact|phone|email)\b/.test(q)) {
                return isEnglish
                    ? "Here is our direct contact info 📲:\n• **Phone / WhatsApp**: 664-666-4984\n• **Email**: admon@nurtep.com\nOr fill out the contact form on our website!"
                    : "Te comparto nuestros medios de contacto directo 📲:\n• **Teléfono / WhatsApp**: 664-666-4984\n• **Correo**: admon@nurtep.com\nO puedes dejarnos tus datos en el formulario de contacto de la página.";
            }

            // Horarios de Atención
            if (/\b(horario|horarios|abierto|hours|schedule)\b/.test(q)) {
                return isEnglish
                    ? "Our commercial and technical business hours are:\n• **Monday to Friday**: 8:00 AM – 5:00 PM\n• **Saturday & Sunday**: Closed 🕒\nHowever, I'm here to help you 24/7!"
                    : "Nuestros horarios de atención técnica y comercial son:\n• **Lunes a Viernes**: 8:00 AM – 5:00 PM\n• **Sábado y Domingo**: Cerrado 🕒\n¡Aunque yo estoy disponible para ayudarte las 24 horas del día!";
            }

            // Respuesta por defecto
            return isEnglish
                ? "We are glad to help you! To schedule a consultation or request a project proposal, please reach out via Phone/WhatsApp at **+52 664-666-4984** or email us at **admon@nurtep.com**."
                : "Con gusto te ayudamos. Para agendar una cita o realizar una propuesta para tu proyecto, contáctanos directamente vía WhatsApp/Teléfono al **664-666-4984** o por correo a **admon@nurtep.com**.";
        }
    }
});