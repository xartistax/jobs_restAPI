const express = require('express');
const router = express.Router() 
const db = require('../db');
 










router.get("/list/limit/:limit/industry/:industry/min/:min/max/:max", (req, res, next) => {

    const limit = parseInt(req.params.limit);
    const industry = parseInt(req.params.industry);

    const min = parseInt(req.params.min);
    const max = parseInt(req.params.max);




    let query;


        // If region and county are the same, use query 1


        query = 
        `   SELECT companys.company_id, companys.name, companys.contact_address, companys.phone, companys.portrait_description, companys.industry, companys.images, 
        COUNT(jobs.company_id) AS job_count
            FROM companys
            LEFT JOIN jobs ON companys.company_id = jobs.company_id
            WHERE jobs.publication_date >= NOW() - INTERVAL 100 DAY OR jobs.publication_date IS NULL
            GROUP BY companys.company_id, companys.name
            HAVING job_count > ? AND job_count <= ? AND industry = ? AND portrait_description != 'null'
            ORDER BY job_count DESC 
            LIMIT ?
            `
         

    

    // Obtain a connection from the pool
    db.getConnection((err, connection) => {

         
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
       const queryParams = [min,max,industry,limit];
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
    let query = 'SELECT * FROM companys ORDER BY RAND() LIMIT 1';

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