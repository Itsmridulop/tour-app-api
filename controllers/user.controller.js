exports.getUsers = (req,res) => {
    res.status(200).json({
        status: 'success',
        data: '<DATA OF ALL USERS>'
    })
}

exports.getOneUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: '<DATA OF ONE USER>'
    })
}

exports.createUser =  (req, res) => {
    res.status(201).json({
        status: 'success',
        data: '<DATA OF NEW USER>'
    })
}

exports.updateUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: '<DATA OF UPDATED USER>'
    })
}

exports.deleteUser = (req, res) => {
    res.status(204).send('User is deleted successfully.')
}