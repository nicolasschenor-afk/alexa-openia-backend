const Alexa = require('ask-sdk-core');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hola. ¿Qué necesitás?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Decime qué necesitás.')
            .getResponse();
    }
};

const ChatGPTIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChatGPTIntent';
    },

    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots || {};
        const consulta = slots.consulta?.value;

        if (!consulta) {
            return handlerInput.responseBuilder
                .speak('No llegué a entenderte. Probá de nuevo.')
                .reprompt('¿Qué necesitás?')
                .getResponse();
        }

        try {
            const response = await openai.responses.create({
                model: 'gpt-5-mini',
                instructions:
                    'Sos un asistente por voz integrado con Alexa. ' +
                    'Respondé en español rioplatense, de forma natural, directa y breve. ' +
                    'La respuesta será leída en voz alta, así que evitá markdown, listas largas y explicaciones innecesarias.',
                input: consulta,
                max_output_tokens: 180
            });

            const respuesta =
                response.output_text ||
                'No pude generar una respuesta en este momento.';

            return handlerInput.responseBuilder
                .speak(respuesta)
                .reprompt('¿Necesitás algo más?')
                .getResponse();

        } catch (error) {
            console.log('OpenAI error:', error);

            return handlerInput.responseBuilder
                .speak('Tuve un problema al procesar eso. Probá nuevamente.')
                .reprompt('¿Qué necesitás?')
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Podés hacerme una pregunta y voy a intentar ayudarte.')
            .reprompt('¿Qué necesitás?')
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
            );
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Listo.')
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log('Error:', error);

        return handlerInput.responseBuilder
            .speak('Hubo un problema. Probá nuevamente.')
            .reprompt('¿Qué necesitás?')
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ChatGPTIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
