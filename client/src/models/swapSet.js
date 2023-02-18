const mongoose = require('mongoose')

const swapSetSchema = new mongoose.Schema({
    timestamp: {type: Date, required: true},
    type: {type: String, required: true},
    inputQty: Number,
    delta: Number,
    deltaPercentage: Number,
    deltaRefToken: Number,
    tokenSequence: String,
    exchangeSequence: String,
    optimizedInput: Boolean,
    tradeTriggered: Boolean,
    theoreticalDelta: Number,
    theoreticalDeltaPercentage: Number,
    theoreticalDeltaRefToken: Number,
    trueDelta: Number,
    deltaAge: Number,
})

swapSetSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('SwapSet', swapSetSchema)
