import sqlite3

conn = sqlite3.connect('hrms.db')
c = conn.cursor()

# Add sample departments
departments = [
    ('IT', 'Information Technology'),
    ('HR', 'Human Resources'),
    ('Finance', 'Finance Department'),
    ('Operations', 'Operations'),
]

for name, desc in departments:
    c.execute('INSERT OR IGNORE INTO departments (name, description) VALUES (?, ?)', (name, desc))

conn.commit()

# Verify
c.execute('SELECT id, name FROM departments')
print("Departments added:")
for row in c.fetchall():
    print(f"  ID {row[0]}: {row[1]}")

conn.close()
