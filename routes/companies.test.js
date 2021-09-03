process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let test1; 
beforeEach(async()=>{
  const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ('t', 'test', 'test company') RETURNING *`);
  test1 = results.rows[0]
});

afterEach(async()=>{
  await db.query(`DELETE FROM companies`)
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
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({company: test1});
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








