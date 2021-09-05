const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next)=> {
    try{
        const results = await db.query(`SELECT * FROM industries`);
        const industries = await Promise.all(results.rows.map(async r => {
            const res = await db.query(`SELECT comp_code FROM industries_company WHERE indust_code = $1`, [r.code]);
            r.comp_code = res.rows.map(r => r.comp_code)
            return r
        }));
        
        return res.json({industries});

    } catch(e){
        return next(e)
    }
});

router.post("/", async (req, res, next)=> {
    try{
        const {code, name} = req.body;
        const results = await db.query(`INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING *`, [code, name]);
        return res.status(201).json({industry: results.rows[0]});

    } catch(e){
        return next(e)
    }
});

router.post("/:code", async (req, res, next)=> {
    try{
        const {code} = req.params;
        console.log(code)
        const {comp_code} = req.body;
        console.log(comp_code)
        const results = await db.query(`INSERT INTO industries_company (indust_code, comp_code) VALUES ($1, $2) RETURNING *`, [code, comp_code]);
        return res.status(201).json({industry_company: results.rows[0]});

    } catch(e){
        return next(e)
    }
});


module.exports = router; 
