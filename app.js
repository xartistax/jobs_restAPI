const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser');
/// Routes
const jobRoutes = require('./routes/jobs');
const companyRoutes = require('./routes/companys');

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use( (req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', '*')
        return res.status(200).json({})
    }

    next()

})
app.use('/jobs', jobRoutes)
app.use('/companys', companyRoutes)


app.use( (req,res,next) => {
    const error = new Error('Somethings wrong here')
    error.status = 404;
    next(error)
} )
app.use( (error , req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error : {
            message: error.message
        }
    })
})

module.exports = app