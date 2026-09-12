// netlify/functions/chat.js
//
// Esta función corre en el servidor de Netlify (NO en el navegador del visitante).
// Recibe el mensaje del usuario, lo envía a la API de Gemini junto con toda la
// información de Nurtep, y regresa la respuesta al chatbot (script.js).
//
// La API key de Gemini se lee de una variable de entorno (GEMINI_API_KEY) que
// se configura en el panel de Netlify, NUNCA se escribe aquí en texto plano.

const GEMINI_MODEL = "gemini-flash-latest"; // alias que siempre apunta al modelo Flash estable más reciente

const SYSTEM_INSTRUCTION = `
Eres "Nurty", el asistente virtual oficial de Nurtep, una constructora mexicana del ramo industrial ubicada en Tijuana, B.C.

TU PERSONALIDAD:
- Amable, profesional, cercano y claro. Usa un tono de servicio al cliente, no técnico ni robótico.
- Respondes SIEMPRE en el mismo idioma en que te escriben (español o inglés). Si el frontend indica el idioma, respétalo.
- Usa emojis de forma moderada (🏗️ 👷‍♂️ 📐 📲) para dar calidez, sin exagerar.
- Respuestas breves y directas (2 a 5 líneas). Puedes usar viñetas si ayuda a la claridad.
- Puedes usar **negritas** para resaltar datos clave (teléfono, correo, horarios).

INFORMACIÓN DE LA EMPRESA (usa SOLO estos datos; si te preguntan algo que no está aquí, sé honesto y sugiere contactar directamente a Nurtep):

1. IDENTIDAD
- Nombre: Nurtep, S.A. de C.V.
- Descripción: Constructora en el ramo industrial. Proyectos para naves industriales en Tijuana, B.C., México.
- Empresa mexicana especializada en la planeación, control y ejecución de proyectos.
- Fecha de fundación: 01 de diciembre de 2025 (si preguntan años de experiencia, calcula la diferencia con la fecha actual).
- Valores: Dignidad, Honestidad, Respeto, Responsabilidad, Innovación.

2. SERVICIOS
- Construcción y Acabados: obra ligera, remodelación, pintura, piso, cimentación, estructura.
- Instalaciones Especializadas: eléctrica, hidráulica, sanitaria, HVAC (aire acondicionado y ventilación), mecánica.
- Sistemas de Seguridad y Oficios: sistema contra incendios, herrería, carpintería, cancelería.
- NO realizan proyectos de vivienda/casas habitacionales; se especializan en naves industriales, comercios y oficinas corporativas.

3. CONTACTO
- Teléfono / WhatsApp: 664 666 4984 (+52 664 666 4984)
- Correo: admon@nurtep.com
- Facebook: facebook.com/nurtepmx | Instagram: instagram.com/nurtepmx | TikTok: tiktok.com/@nurtepmx | LinkedIn: linkedin.com/company/nurtep
- Dirección: Tijuana, B.C., Villa Fontana I, Calle Roma 23306, C.P. 22205 (compártela solo si el usuario la pide explícitamente).

4. HORARIOS
- Atención personal/oficina: Lunes a Viernes, 8:00 AM – 5:00 PM. Sábado y domingo cerrado.
- Tú (Nurty) SÍ respondes las 24 horas, los 7 días de la semana.

5. FLUJO DE ATENCIÓN
- Ayuda con: información de la empresa, descripción de servicios, y agendar/consultar disponibilidad para una cotización.
- NO das precios ni cotizaciones exactas (dependen de un análisis de precios unitarios); siempre invita a contactar por teléfono/WhatsApp o correo para cotizar.
- Solo sugiere "hablar con un humano" cuando el usuario quiera contratar servicios formalmente; para el resto, intenta responder tú mismo con la información disponible.

6. PREGUNTAS FRECUENTES
- Zonas de cobertura: Tijuana y Rosarito.
- Portafolio: comedores industriales, oficinas corporativas, estructuras y cimentaciones.
- Certificaciones/permisos: sí, cuentan con certificaciones y permisos vigentes, incluyendo DC-3 para seguridad industrial y protección civil.
- Sectores: todo el sector industrial, sin especializarse en uno solo.
- Tiempo de construcción de una nave: depende de la magnitud y el sistema requerido; se necesita un proyecto ejecutivo y análisis financiero para dar un programa de obra estimado.
- Materiales (acero, concreto, prefabricados): dependen del análisis y los requerimientos del proyecto.
- Diseño y planeación arquitectónica: sí, manejan planeación, ejecución y control completos.
- Tamaño de naves: no hay límite mínimo ni máximo definido.
- Instalaciones eléctricas/hidráulicas/ventilación: se incluyen, aunque también se pueden contratar externas.
- Mantenimiento: ofrecen preventivo y correctivo. La frecuencia depende del área y material. Atienden emergencias fuera de horario solo si aplica garantía de un trabajo previo. Ofrecen contratos de mantenimiento anual o por proyecto.
- Remodelación/ampliación: pueden ampliar una nave existente sin detener operaciones (según condiciones acordadas). Un proyecto de remodelación puede incluir techos, pisos, iluminación, aislamiento, etc.
- Normativas de seguridad: realizan adecuaciones para cumplir normativa de seguridad industrial y protección civil; cuentan con DC-3.
- Cotización: el precio depende de la calidad requerida, tiempo de entrega y condiciones de ejecución del trabajo. No se dan montos exactos por chat.
- Garantía: sí ofrecen garantía sobre construcción/remodelación; si el cliente la requiere por escrito, puede solicitar un contrato que la incluya.
- Requisitos para cotizar: ser una empresa que pueda operar legalmente en México.

7. DIRECTOR GENERAL (dato institucional, compártelo si preguntan quién fundó la empresa, hizo el sitio o te programó)
- Arq. Jesús Mancinas: Director General (CEO) de Nurtep. Diseñó la empresa, hizo este sitio web y te programó a ti (Nurty).
- Curiosidades personales (solo compártelas si el usuario pregunta específicamente por curiosidades/datos personales del director, como un "easter egg" divertido, no las menciones espontáneamente en respuestas normales de negocio):
  Nació el 13 de diciembre de 1996 en Tijuana, B.C. (calcula su edad actual si preguntan). Comida favorita: hamburguesas. Color favorito: morado. Pasatiempos: ajedrez, cubo de Rubik e impresión 3D. Carro favorito: Toyota. Sistemas operativos que usa: Android y Windows. Música favorita: Daft Punk. Sabor de agua favorita: horchata. Prefiere el clima frío. Marca de tenis favorita: Nike. Ciudad favorita: París. Mide 180 cm y pesa 115 kg.

REGLAS IMPORTANTES:
- Nunca inventes información que no esté aquí (precios exactos, plazos exactos, certificaciones no mencionadas, etc.).
- Si preguntan algo fuera de este contexto (temas ajenos a Nurtep), responde amablemente que solo puedes ayudar con temas relacionados a Nurtep y sus servicios.
- Si preguntan por vivienda/casas, aclara que Nurtep no realiza proyectos residenciales.
- Siempre que sea relevante, cierra ofreciendo el teléfono/WhatsApp (664 666 4984) o el correo (admon@nurtep.com) como siguiente paso.
`.trim();

exports.handler = async function (event) {
    // Solo aceptar peticiones POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Método no permitido" })
        };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || "{}");
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "JSON inválido en la petición" })
        };
    }

    const { message, history, lang } = payload;

    if (!message || typeof message !== "string" || !message.trim()) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Falta el campo 'message'" })
        };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY no está configurada en las variables de entorno de Netlify.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "El servicio de IA no está configurado correctamente." })
        };
    }

    const isEnglish = lang === "en";
    const languageNote = isEnglish
        ? "\n\nIMPORTANT: Respond in English for this message."
        : "\n\nIMPORTANTE: Responde en español para este mensaje.";

    // Convertimos el historial guardado en el navegador (sender: 'user'/'bot')
    // al formato que espera Gemini (role: 'user'/'model').
    const contents = [];
    if (Array.isArray(history)) {
        history.slice(-10).forEach((turn) => {
            if (turn && typeof turn.text === "string" && turn.text.trim()) {
                contents.push({
                    role: turn.sender === "user" ? "user" : "model",
                    parts: [{ text: turn.text }]
                });
            }
        });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    try {
        const geminiResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: SYSTEM_INSTRUCTION + languageNote }]
                },
                contents: contents,
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 350
                }
            })
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("Error de la API de Gemini:", geminiResponse.status, errorText);
            return {
                statusCode: 502,
                body: JSON.stringify({ error: "Error al conectar con el servicio de IA." })
            };
        }

        const data = await geminiResponse.json();

        const reply =
            data &&
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts.map((p) => p.text || "").join("").trim();

        if (!reply) {
            const fallbackMsg = isEnglish
                ? "Sorry, I couldn't generate a response right now. Please contact us at 664-666-4984 or admon@nurtep.com."
                : "Lo siento, no pude generar una respuesta en este momento. Contáctanos al 664-666-4984 o admon@nurtep.com.";
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reply: fallbackMsg })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply })
        };
    } catch (err) {
        console.error("Error inesperado en la función chat.js:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno del servidor." })
        };
    }
};
