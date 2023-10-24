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



router.get("/industry/limit/:limit/industry/:industry/region/:region/county/:county", (req, res, next) => {
    const limit = parseInt(req.params.limit);
    const industry_id = parseInt(req.params.industry);

    const region = req.params.region ? replaceSpecialCharacters(req.params.region) : null;
    const county = req.params.county ? replaceSpecialCharacters(req.params.county) : null;

    let query;
    let queryParams;

    if (region === county || (!region || !county)) {
        // If region and county are the same, or if one of them is not provided
        query = `SELECT job_id, title, place, company_id, company_name, industry_id
        FROM jobs
        WHERE place = ? AND industry_id = ?
        ORDER BY publication_date DESC
        LIMIT ?
        `;
        queryParams = [region || county, industry_id, limit];
    } else {
        // If region and county are different
        query = `SELECT DISTINCT job_id, title, place, company_id, company_name, industry_id
        FROM jobs 
        WHERE (place = ? OR place = ?) AND industry_id = ?
        ORDER BY publication_date DESC
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

router.get("/lehrstellen/limit/:limit/industry/:industry", (req, res, next) => {
    const limit = parseInt(req.params.limit);
    const industry_id = parseInt(req.params.industry);

    let query;
    let queryParams;

    // Conditionally build the query string
    if (industry_id === 999) {
        query = `
            SELECT job_id, title, place, company_id, company_name, industry_id, employment_position_ids, employment_type_ids, education_ids
            FROM (
                SELECT job_id, title, place, company_id, company_name, industry_id, employment_position_ids, employment_type_ids, education_ids, RAND() as r
                FROM jobs
                WHERE title LIKE '%lehrstellen%' AND template_text LIKE '%lehrstellen%' OR  title LIKE '%EFZ%' AND template_text LIKE '%EFZ%'
                ORDER BY r
            ) AS subquery
            GROUP BY company_id
            ORDER BY r
            LIMIT ?
        `;
        queryParams = [limit];
    } else {
        query = `
            SELECT job_id, title, place, company_id, company_name, industry_id, employment_position_ids, employment_type_ids, education_ids
            FROM (
                SELECT job_id, title, place, company_id, company_name, industry_id, employment_position_ids, employment_type_ids, education_ids, RAND() as r
                FROM jobs
                WHERE industry_id = ? AND (title LIKE '%Lehrstelle%' AND template_text LIKE '%Lehrstelle%' OR  title LIKE '%EFZ%' AND template_text LIKE '%EFZ%')
                ORDER BY r
            ) AS subquery
            GROUP BY company_id
            ORDER BY r
            LIMIT ?
        `;
        queryParams = [industry_id, limit];
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


router.get("/single/:id/", (req, res, next) => {

    let query = `SELECT job_id, title, place, company_id, company_name, industry_id FROM jobs WHERE job_id = ? `;

    const id = req.params.id;



    // Obtain a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
        connection.query(query, [id], (error, results, fields) => {
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



router.get("/list/query/:query/", (req, res, next) => {

    

    /**
     * first split the user's input query into individual words and then create placeholders for each word in the title column. We also create an array of search parameters with '%' wildcard added to each word. Finally, we use the CONCAT function to search for rows where the title column contains any of the words from the user's input query.
     */
   


    const searchQuery = req.params.query;

    // Split the search query into individual words
    const searchWords = searchQuery.split(" ");

    // Create an array to hold the placeholders for each word in the search query
    const placeholders = searchWords.map(() => "?").join(" OR ");

    // Create an array of search parameters by adding '%' wildcard to each word
    const searchParams = searchWords.map((word) => `%${word}%`);

    let query = `SELECT job_id, title, place, company_id, company_name, industry_id
        FROM jobs WHERE `;
    query += `CONCAT(' ', title, ' ') LIKE ${placeholders}`; 




    // Obtain a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
        connection.query(query, searchParams, (error, results, fields) => {
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





module.exports = router