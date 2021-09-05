process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let test1; 
let invoiceTest1;
beforeEach(async()=>{
  let results = await db.query(`INSERT INTO companies (code, name, description) VALUES ('t', 'test', 'test company') RETURNING *`);
  test1 = results.rows[0];
  let invoiceRes = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *`, [test1.code, 100])
  invoiceTest1 = invoiceRes.rows[0]
  invoiceTest1.add_date = null

});

afterEach(async()=>{
  await db.query(`DELETE FROM companies`)
  await db.query(`DELETE FROM invoices`)
});

afterAll(async()=>{
  await db.end(); 
});

describe("GET /companies", ()=>{
  test("GET list of all companies", async ()=>{
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({companies:[test1]});
  })
});

describe("GET /companies/:code", ()=>{
  test("GET company based on code param", async ()=>{
    const res = await request(app).get(`/companies/${test1.code}`);
    res.body.company.invoices[0].add_date = null
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: {
      code: test1.code,
      description: test1.description,
      industries: [],
      invoices: [invoiceTest1],
      name: test1.name
    }});
  });

  test("Responds with 404 for invalid code", async ()=>{
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
  })
});

describe("POST /companies", ()=>{
  test("Create single company", async ()=>{
    const test2 = {
      code: "t2",
      name: "test2", 
      description: "test2 company"
    }
    const res = await request(app).post(`/companies`).send(test2)
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({company: test2});
  });
});

describe("PUT /companies/:code", ()=>{
  test("Edit single company", async ()=>{
    const test2 = {
      name: "test2", 
      description: "test2 company"
    };

    const res = await request(app).put(`/companies/${test1.code}`).send(test2)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: {code: 't', name: "test2", description: "test2 company"}});
  });

  test("Responds with 404 for invalid id", async ()=>{
    const test2 = {
      name: "test2", 
      type: "admin"
    };

    const res = await request(app).patch(`/companies/0`).send(test2);
    expect(res.statusCode).toBe(404);
  })
});

describe("DELETE /companies/:code", ()=>{
  test("Deletes single company", async ()=>{

    const res = await request(app).delete(`/companies/${test1.code}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({status: "deleted"});
  });

  test("Responds with 404 for invalid id", async ()=>{

    const res = await request(app).delete(`/users/0`);
    expect(res.statusCode).toBe(404);
  })
});

// =========================invoice tests ===============================================

describe("GET /invoices", ()=>{
  test("GET list of all invoices", async ()=>{
    const res = await request(app).get('/invoices');

    res.body.invoices[0].add_date = null;

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({invoices:[invoiceTest1]});
  })
});


describe("GET /invoices/:id", ()=>{
  test("GET single invoice", async ()=>{
    const res = await request(app).get(`/invoices/${invoiceTest1.id}`);

    res.body.invoice.add_date = null;
    invoiceTest1.company = test1;

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({invoice: invoiceTest1});
  });

  test("Responds with 404 for invalid code", async ()=>{
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  })
});

describe("POST /invoices", ()=>{
  test("Create single invoice", async ()=>{
    const invoiceTest2 = {
      comp_code: test1.code,
      amt: 400 
    }

    const res = await request(app).post(`/invoices`).send(invoiceTest2)
    

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({invoice: {
      id: expect.any(Number),
      comp_code: test1.code, 
      amt: 400,
      paid: false,
      add_date: expect.any(String),
      paid_date: null
    } });
  });
});

describe("PUT /invoices/:id", ()=>{
  test("Edit single invoice with different amount and paid status", async ()=>{
    const invoiceUpdate = {
      amt: 100, 
      paid: true
    };

    const res = await request(app).put(`/invoices/${invoiceTest1.id}`).send(invoiceUpdate)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({invoice: {
      id: invoiceTest1.id,
      comp_code: test1.code, 
      amt: 100,
      paid: true,
      add_date: expect.any(String),
      paid_date: expect.any(String)
    }});
  });

  test("Responds with 404 for invalid id", async ()=>{
  
    const res = await request(app).patch(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  })
});

describe("DELETE /invoices/:id", ()=>{
  test("Deletes single invoice", async ()=>{

    const res = await request(app).delete(`/invoices/${invoiceTest1.id}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({status: "deleted"});
  });

  test("Responds with 404 for invalid id", async ()=>{

    const res = await request(app).delete(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  })
});








