import sqlite3

DB_NAME = "banking.db"

conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# Customers
cursor.execute("""
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    monthly_income REAL,
    credit_score INTEGER
)
""")

# Accounts
cursor.execute("""
CREATE TABLE IF NOT EXISTS accounts (
    account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    balance REAL NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
)
""")

# Transactions
cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
)
""")

# Loans
cursor.execute("""
CREATE TABLE IF NOT EXISTS loans (
    loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    loan_type TEXT NOT NULL,
    principal REAL NOT NULL,
    outstanding REAL NOT NULL,
    interest_rate REAL NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
)
""")

# -------------------------
# Sample customer
# -------------------------

cursor.execute("""
INSERT OR IGNORE INTO customers
(customer_id, name, email, phone, monthly_income, credit_score)
VALUES (?, ?, ?, ?, ?, ?)
""", (
    "CUST1001",
    "Rahul Sharma",
    "rahul@example.com",
    "9876543210",
    65000,
    780
))

# -------------------------
# Sample account
# -------------------------

cursor.execute("""
INSERT OR IGNORE INTO accounts
(account_id, customer_id, account_type, balance)
VALUES (?, ?, ?, ?)
""", (
    "ACC1001",
    "CUST1001",
    "Savings",
    52430.50
))

# -------------------------
# Sample transactions
# -------------------------

transactions = [
    ("ACC1001", "DEBIT", 1299, "Amazon"),
    ("ACC1001", "CREDIT", 65000, "Salary"),
    ("ACC1001", "DEBIT", 2450, "Electricity Bill")
]

for transaction in transactions:

    cursor.execute("""
    INSERT INTO transactions
    (account_id, transaction_type, amount, description)
    SELECT ?, ?, ?, ?
    WHERE NOT EXISTS (
        SELECT 1 FROM transactions
        WHERE account_id = ?
        AND transaction_type = ?
        AND amount = ?
        AND description = ?
    )
    """, (
        *transaction,
        *transaction
    ))

# -------------------------
# Sample loan
# -------------------------

cursor.execute("""
INSERT OR IGNORE INTO loans
(customer_id, loan_type, principal, outstanding, interest_rate, status)
VALUES (?, ?, ?, ?, ?, ?)
""", (
    "CUST1001",
    "Personal Loan",
    300000,
    245000,
    10.5,
    "ACTIVE"
))

conn.commit()
conn.close()

print("Database initialized successfully.")