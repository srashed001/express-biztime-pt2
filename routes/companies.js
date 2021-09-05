const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next)=> {
    try{
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({companies: results.rows});

    } catch(e){
        return next(e)
    }
});

router.get("/:code", async (req, res, next)=> {
    try{
        const {code} = req.params;
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if(results.rows.length === 0){
            throw new ExpressError(`Company with code ${code} not found`, 404)
        }
        const invoiceRes = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code]);
        const industryRes = await db.query(
            `SELECT i.name
            FROM industries AS i
            LEFT JOIN industries_company AS ic
            ON i.code = ic.indust_code
            WHERE ic.comp_code = $1`, [code])
        const company = results.rows[0];
        company.invoices = invoiceRes.rows;
        company.industries = industryRes.rows.map(r => r.name)
        return res.json({company});

    } catch(e){
        return next(e)
    }
});

router.post("/", async (req, res, next)=> {
    try{
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]});

    } catch(e){
        return next(e)
    }
});

router.put("/:code", async (req, res, next)=> {
    try{
        const {code} = req.params;
        const {name, description} = req.body; 
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`, [name, description, code]);
        if(results.rows.length === 0){
            throw new ExpressError(`Company with code ${code} not found`, 404)
        }
        return res.json({company: results.rows[0]});

    } catch(e){
        return next(e)
    }
});

router.delete("/:code", async (req, res, next)=> {
    try{
        const {code} = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING *`, [code]);
        if(results.rows.length === 0){
            throw new ExpressError(`Company with code ${code} not found`, 404)
        }
        return res.json({status: "deleted"});

    } catch(e){
        return next(e)
    }
});


module.exports = router; 

