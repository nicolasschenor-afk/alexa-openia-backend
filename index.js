const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.get('/', (req, res) => {
    res.send('Alexa OpenAI backend funcionando');
});

app.post('/ask', async (req, res) => {
    try {
        const consulta = req.body.consulta;

        if (!consulta) {
            return res.status(400).json({
                error: 'Falta la consulta'
            });
        }

        const response = await openai.responses.create({
            model: 'gpt-5-mini',
            instructions:
                'Sos un asistente por voz integrado con Alexa. ' +
                'Respondé en español rioplatense, de manera natural, directa y breve. ' +
                'La respuesta será leída en voz alta. Evitá markdown, listas largas y explicaciones innecesarias.',
            input: consulta,
            max_output_tokens: 180
        });

        res.json({
            respuesta: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'No se pudo procesar la consulta'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});
