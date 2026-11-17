-- Task 1 - PostgreSQL and basic SQL
-- Database: task1_db

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  credit_hours INTEGER CHECK (credit_hours BETWEEN 1 AND 4)
);

INSERT INTO courses (code, title, credit_hours) VALUES
  ('CS-301', 'Full Stack Web Development', 3),
  ('CS-302', 'Database Systems', 3),
  ('CS-201', 'Data Structures', 4),
  ('CS-101', 'Introduction to Computing', 2),
  ('MTH-201', 'Linear Algebra', 3),
  ('ENG-101', 'English Composition', 2);

-- (a) list all courses ordered by title
SELECT * FROM courses ORDER BY title;

-- (b) list courses with 3 or more credit hours
SELECT * FROM courses WHERE credit_hours >= 3;

-- (c) change the title of one course
UPDATE courses SET title = 'Advanced Full Stack Web Development' WHERE code = 'CS-301';

-- (d) delete one course by code
DELETE FROM courses WHERE code = 'ENG-101';

-- (e) count the courses for each value of credit_hours
SELECT credit_hours, COUNT(*) AS course_count
FROM courses GROUP BY credit_hours ORDER BY credit_hours;

-- CHECK constraint test (must fail with "violates check constraint"):
-- INSERT INTO courses (code, title, credit_hours) VALUES ('CS-999', 'Bad Course', 9);
