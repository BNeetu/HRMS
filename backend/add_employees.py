import sqlite3

conn = sqlite3.connect('hrms.db')
c = conn.cursor()

# Sample employees
employees = [
    ('EMP001', 'Raj Kumar', 'raj.kumar@example.com', 1),
    ('EMP002', 'Priya Singh', 'priya.singh@example.com', 2),
    ('EMP003', 'Amit Patel', 'amit.patel@example.com', 3),
    ('EMP004', 'Sneha Gupta', 'sneha.gupta@example.com', 4),
    ('EMP005', 'Vikram Sharma', 'vikram.sharma@example.com', 1),
]

for emp_id, full_name, email, dept_id in employees:
    c.execute(
        'INSERT INTO employees (employee_id, full_name, email, department_id) VALUES (?, ?, ?, ?)',
        (emp_id, full_name, email, dept_id)
    )

conn.commit()

# Show what was added
c.execute('''SELECT e.id, e.employee_id, e.full_name, e.email, d.name 
             FROM employees e 
             LEFT JOIN departments d ON e.department_id = d.id''')
print("\nEmployees Added:")
print("=" * 80)
for row in c.fetchall():
    print(f"ID: {row[0]}, EmpID: {row[1]}, Name: {row[2]}, Email: {row[3]}, Dept: {row[4]}")
print("=" * 80)

conn.close()
