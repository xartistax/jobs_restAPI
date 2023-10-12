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



router.get("/list/limit/:limit/industry/:industry", (req, res, next) => {
    const limit = parseInt(req.params.limit);
    const industry_id = parseInt(req.params.industry);

    let query;
    let queryParams;

    query = `SELECT job_id, title, place, company_id, company_name, industry_id
        FROM (
            SELECT job_id, title, place, company_id, company_name, industry_id, RAND() as r
            FROM jobs
            WHERE industry_id = ?
            ORDER BY r
        ) AS subquery
        GROUP BY company_id
        ORDER BY r
        LIMIT ?
        `;

    queryParams = [industry_id, limit];


        // Obtain a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
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
})




// Modify route to handle optional parameters
router.get("/list/limit/:limit/region/:region/county/:county/industry/:industry", (req, res, next) => {
    
    const limit = parseInt(req.params.limit);
    const industry_id = parseInt(req.params.industry);

    const region = req.params.region ? replaceSpecialCharacters(req.params.region) : null;
    const county = req.params.county ? replaceSpecialCharacters(req.params.county) : null;



    let query;
    let queryParams;

    if (region === county || (!region || !county)) {
        // If region and county are the same, or if one of them is not provided
        query = `SELECT job_id, title, place, company_id, company_name, industry_id
        FROM (
            SELECT job_id, title, place, company_id, company_name, industry_id, RAND() as r
            FROM jobs
            WHERE place = ? AND industry_id = ?
            ORDER BY r
        ) AS subquery
        GROUP BY company_id
        ORDER BY r
        LIMIT ?
        `;
        queryParams = [region || county, industry_id, limit];
    } else {
        // If region and county are different
        query = `SELECT job_id, title, place, company_id, company_name, industry_id
        FROM (
            SELECT DISTINCT job_id, title, place, company_id, company_name, industry_id, RAND() as r
            FROM jobs 
            WHERE (place = ? OR place = ?) AND industry_id = ?
            ORDER BY r
        ) AS subquery
        GROUP BY company_id
        ORDER BY r
        LIMIT ? `;
        queryParams = [region, county, industry_id, limit];
    }

    // Obtain a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
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








router.get("/tmplate", (req, res, next) => {
    let query = 'SELECT * FROM jobs ORDER BY RAND() LIMIT 1';

    // Obtain a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
        connection.query(query, (error, results, fields) => {
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










module.exports = router