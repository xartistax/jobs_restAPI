const express = require('express');
const router = express.Router()
const db = require('../db');




// Function to replace special characters like "ü" with "u"
function replaceSpecialCharacters(input) {
    const characterMap = {
        'ü': 'u',
        // Add more character replacements as needed
    };

    let result = input;
    for (const [search, replace] of Object.entries(characterMap)) {
        result = result.replace(new RegExp(search, 'g'), replace);
    }

    return result;
}






router.get("/list/limit/:limit/region/:region/county/:county", (req, res, next) => {

    const limit = parseInt(req.params.limit);
    const region = replaceSpecialCharacters(req.params.region);
    const county = replaceSpecialCharacters(req.params.county);



    let query;

    if (region === county) {
        // If region and county are the same, use query 1
        query = 'SELECT job_id, title FROM jobs WHERE place = ? ORDER BY RAND() LIMIT ?';
    } else {
        // If region and county are different, use query 2
        query = 'SELECT job_id, title FROM jobs WHERE place = ? OR place = ? ORDER BY RAND() LIMIT ?';
    }




    




    // Obtain a connection from the pool
    db.getConnection((err, connection) => {

        
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
       const queryParams = region === county ? [region, limit] : [region, county, limit];
        connection.query(query, queryParams, (error, results, fields) => {
            // Release the connection back to the pool
            connection.release();

            if (error) {
                // Handle query error
                return next(error);
            } else if (results.length === 0) {
                return next(error);
            }

            res.status(200).json({
                message: "success",
                results
            });
        });
    });
});







router.get("/single/:id", (req,res,next) => {
    const id = req.params.id

    res.status(200).json({
        message:"success",
        id
    })

}) 





module.exports = router