const fs = require('fs')

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.checkID = (req, res, next) => {
    const tour = tours.find(tour => tour.id === parseInt(req.params.id))
    if (!tour) return res.status(404).send('Requested tour not found.')
    next()
}

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) return res.status(400).send('Missing value name or price')
    next()
}

exports.getTour = (_, res) => {
    console.log(res)
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: tours
    })
}

exports.getOneTour = (req, res) => {
    const tour = tours.find(tour => tour.id === parseInt(req.params.id))
    res.status(200).json({
        status: "success",
        data: tour
    })
}

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1
    const newTour = { id: newId, ...req.body }
    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), error => {
        if (error) console.log(error)
        res.status(201).json({
            message: "Your tour is added successfully.",
            status: "success",
            data: {
                tour: newTour
            }
        })
    })
}

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: '<UPDATED TOUR DATA...>'
    })
}

exports.deleteTour = (req, res) => {
    res.status(204).send('Tour is deleted successfully.')
}