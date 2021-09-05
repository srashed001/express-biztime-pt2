const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next)=> {
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: results.rows});

    } catch(e){
        return next(e)
    }
});

router.get("/:id", async (req, res, next)=> {
    try{
        const {id} = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if(results.rows.length === 0){
            throw new ExpressError(`Invoice with id ${id} not found`, 404)
        }
        const {comp_code} = results.rows[0];
        const companyRes = await db.query(`SELECT * FROM companies WHERE code=$1`, [comp_code]);
        const invoice = results.rows[0];
        invoice.company = companyRes.rows[0];

        return res.json({invoice});

    } catch(e){
        return next(e)
    }
});

router.post("/", async (req, res, next)=> {
    try{
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});

    } catch(e){
        return next(e)
    }
});

router.put("/:id", async (req, res, next)=> {
    try{
        const {id} = req.params;
        const {amt, paid} = req.body; 
        let paid_date; 
        const paidRes = await db.query(`SELECT paid_date FROM invoices WHERE id =$1`, [id]);
        if(paidRes.rows.length === 0){
            throw new ExpressError(`Invoice with id ${id} not found`, 404)
        }
        const {paid_date: currPaidDate} = paidRes.rows;
        if(!currPaidDate && paid){
            paid_date = new Date();
        } else if (!paid){
            paid_date = null;
        } else {
            paid_date = currPaidDate
        }

        const results = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *`, [amt, paid, paid_date, id]);

        return res.json({invoice: results.rows[0]});

    } catch(e){
        return next(e)
    }
});

router.delete("/:id", async (req, res, next)=> {
    try{
        const {id} = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING *`, [id]);
        if(results.rows.length === 0){
            throw new ExpressError(`Invoice with ${id} not found`, 404)
        }
        return res.json({status: "deleted"});

    } catch(e){
        return next(e)
    }
});


module.exports = router; 