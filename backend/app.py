from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_connection
from chatbot import process_query
app = Flask(__name__)
CORS(app)


# --------------------------------
# Health check
# --------------------------------

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "message": "Banking API is running"
    })


# --------------------------------
# Get customer
# --------------------------------

@app.route("/api/customer/<customer_id>", methods=["GET"])
def get_customer(customer_id):

    conn = get_connection()

    customer = conn.execute("""
        SELECT *
        FROM customers
        WHERE customer_id = ?
    """, (customer_id,)).fetchone()

    conn.close()

    if not customer:
        return jsonify({
            "error": "Customer not found"
        }), 404

    return jsonify(dict(customer))


# --------------------------------
# Get account
# --------------------------------

@app.route("/api/account/<account_id>", methods=["GET"])
def get_account(account_id):

    conn = get_connection()

    account = conn.execute("""
        SELECT *
        FROM accounts
        WHERE account_id = ?
    """, (account_id,)).fetchone()

    conn.close()

    if not account:
        return jsonify({
            "error": "Account not found"
        }), 404

    return jsonify(dict(account))


# --------------------------------
# Get transactions
# --------------------------------

@app.route("/api/account/<account_id>/transactions", methods=["GET"])
def get_transactions(account_id):

    conn = get_connection()

    transactions = conn.execute("""
        SELECT *
        FROM transactions
        WHERE account_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
    """, (account_id,)).fetchall()

    conn.close()

    return jsonify([
        dict(transaction)
        for transaction in transactions
    ])


# --------------------------------
# Make transaction
# --------------------------------

@app.route("/api/transactions", methods=["POST"])
def create_transaction():

    data = request.json

    account_id = data.get("account_id")
    transaction_type = data.get("transaction_type")
    amount = data.get("amount")
    description = data.get("description", "")

    if not account_id or not transaction_type or not amount:

        return jsonify({
            "error": "Missing required fields"
        }), 400

    if amount <= 0:

        return jsonify({
            "error": "Amount must be greater than zero"
        }), 400

    if transaction_type not in ["DEBIT", "CREDIT"]:

        return jsonify({
            "error": "Invalid transaction type"
        }), 400

    conn = get_connection()

    account = conn.execute("""
        SELECT *
        FROM accounts
        WHERE account_id = ?
    """, (account_id,)).fetchone()

    if not account:

        conn.close()

        return jsonify({
            "error": "Account not found"
        }), 404

    current_balance = account["balance"]

    # Debit
    if transaction_type == "DEBIT":

        if current_balance < amount:

            conn.close()

            return jsonify({
                "error": "Insufficient balance"
            }), 400

        new_balance = current_balance - amount

    # Credit
    else:

        new_balance = current_balance + amount

    # Update account
    conn.execute("""
        UPDATE accounts
        SET balance = ?
        WHERE account_id = ?
    """, (
        new_balance,
        account_id
    ))

    # Add transaction
    cursor = conn.execute("""
        INSERT INTO transactions
        (account_id, transaction_type, amount, description)
        VALUES (?, ?, ?, ?)
    """, (
        account_id,
        transaction_type,
        amount,
        description
    ))

    transaction_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "transaction_id": transaction_id,
        "account_id": account_id,
        "transaction_type": transaction_type,
        "amount": amount,
        "new_balance": new_balance
    })


# --------------------------------
# Get loans
# --------------------------------

@app.route("/api/loans/<customer_id>", methods=["GET"])
def get_loans(customer_id):

    conn = get_connection()

    loans = conn.execute("""
        SELECT *
        FROM loans
        WHERE customer_id = ?
    """, (customer_id,)).fetchall()

    conn.close()

    return jsonify([
        dict(loan)
        for loan in loans
    ])


@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.get_json()

    message = data.get("message", "").strip()

    customer_id = data.get(
        "customer_id",
        "CUST1001"
    )

    account_id = data.get(
        "account_id",
        "ACC1001"
    )

    if not message:

        return jsonify({
            "error": "Message is required"
        }), 400

    result = process_query(
        message,
        customer_id,
        account_id
    )

    return jsonify(result)

# --------------------------------
# Run server
# --------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )