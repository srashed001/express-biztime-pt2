DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime_test;

\c biztime_test

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS industries_company;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE industries_company (
    indust_code text NOT NULL REFERENCES industries,
    comp_code text NOT NULL REFERENCES companies,
    PRIMARY KEY(indust_code, comp_code)
);

-- INSERT INTO companies
--   VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
--          ('ibm', 'IBM', 'Big blue.');

-- INSERT INTO invoices (comp_Code, amt, paid, paid_date)
--   VALUES ('apple', 100, false, null),
--          ('apple', 200, false, null),
--          ('apple', 300, true, '2018-01-01'),
--          ('ibm', 400, false, null);

-- INSERT INTO industries (code, name)
--     VALUES ('acct', 'Accounting'),
--             ('sec', 'Cyber Security'),
--             ('opp', 'Operating Systems'),
--             ('hard', 'Hardware Manufacturing');

-- INSERT INTO industries_company (indust_code, comp_code)
--     VALUES ('acct', 'ibm'),
--             ('sec', 'ibm'),
--             ('opp', 'apple'),
--             ('hard', 'apple');
    
-- `SELECT i.name
-- FROM industries AS i
-- LEFT JOIN industries_company AS ic
-- ON i.code = ic.indust_code
-- WHERE ic.comp_code = 1;`