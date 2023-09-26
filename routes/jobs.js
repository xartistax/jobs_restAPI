const express = require('express');
const router = express.Router()
const db = require('../db');
const pool = require('../db');




router.get("/list/limit/:limit", (req, res, next) => {
    const limit = parseInt(req.params.limit);
    const query = 'SELECT job_id,title FROM jobs LIMIT ?';

    // Obtain a connection from the pool
    db.getConnection((err, connection) => {
        if (err) {
            // Handle connection error
            return next(err);
        }

        // Perform the database query
        connection.query(query, [limit], (error, results, fields) => {
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