const Tour = require('../model/tour.model')

exports.getTour = async (_, res) => {
    try {
        const tours = await Tour.find()
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: tours
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.getOneTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: "success",
            data: tour
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)
        res.status(200).json({
            status: 'success',
            data: newTour
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const udatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            data: udatedTour
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).send('Tour is deleted successfully.')
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}