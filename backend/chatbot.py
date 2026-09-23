from intent import detect_intent
from database import get_connection


def get_balance(account_id):

    conn = get_connection()

    account = conn.execute(
        """
        SELECT account_id, account_type, balance
        FROM accounts
        WHERE account_id = ?
        """,
        (account_id,)
    ).fetchone()

    conn.close()

    if not account:
        return None

    return dict(account)


def get_transactions(account_id):

    conn = get_connection()

    transactions = conn.execute(
        """
        SELECT
            transaction_id,
            transaction_type,
            amount,
            description,
            timestamp
        FROM transactions
        WHERE account_id = ?
        ORDER BY timestamp DESC
        LIMIT 5
        """,
        (account_id,)
    ).fetchall()

    conn.close()

    return [dict(t) for t in transactions]


def get_account_info(account_id):

    conn = get_connection()

    account = conn.execute(
        """
        SELECT
            account_id,
            account_type,
            balance
        FROM accounts
        WHERE account_id = ?
        """,
        (account_id,)
    ).fetchone()

    conn.close()

    if not account:
        return None

    return dict(account)


def get_customer(customer_id):

    conn = get_connection()

    customer = conn.execute(
        """
        SELECT
            customer_id,
            name,
            monthly_income,
            credit_score
        FROM customers
        WHERE customer_id = ?
        """,
        (customer_id,)
    ).fetchone()

    conn.close()

    if not customer:
        return None

    return dict(customer)


# ---------------------------------------
# Main chatbot function
# ---------------------------------------

def process_query(message, customer_id, account_id):

    intent, tokens = detect_intent(message)

    # -----------------------------------
    # Balance
    # -----------------------------------

    if intent == "BALANCE_CHECK":

        account = get_balance(account_id)

        if not account:
            return {
                "response": "I couldn't find your account.",
                "intent": intent,
                "tokens": tokens
            }

        return {
            "response": (
                f"Your current {account['account_type'].lower()} "
                f"account balance is ₹"
                f"{account['balance']:,.2f}."
            ),
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Transactions
    # -----------------------------------

    if intent == "TRANSACTION_HISTORY":

        transactions = get_transactions(account_id)

        if not transactions:
            return {
                "response": "You don't have any recent transactions.",
                "intent": intent,
                "tokens": tokens
            }

        lines = ["Here are your 5 most recent transactions:\n"]

        for t in transactions:

            sign = "+" if t["transaction_type"] == "CREDIT" else "-"

            lines.append(
                f"• {t['description']}: "
                f"{sign}₹{t['amount']:,.2f}"
            )

        return {
            "response": "\n".join(lines),
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Account information
    # -----------------------------------

    if intent == "ACCOUNT_INFO":

        account = get_account_info(account_id)

        if not account:
            return {
                "response": "Account information could not be found.",
                "intent": intent,
                "tokens": tokens
            }

        masked_account = (
            "••••" + account["account_id"][-4:]
        )

        return {
            "response": (
                f"Your account is a {account['account_type']} "
                f"account ending in {masked_account}."
            ),
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Loan eligibility
    # -----------------------------------

    if intent == "LOAN_ELIGIBILITY":

        customer = get_customer(customer_id)

        if not customer:
            return {
                "response": "Customer information could not be found.",
                "intent": intent,
                "tokens": tokens
            }

        # Simple demo eligibility rule
        if (
            customer["monthly_income"] >= 30000
            and customer["credit_score"] >= 700
        ):

            response = (
                "Based on your current profile, you meet the "
                "basic criteria for personal-loan eligibility. "
                "Final approval is subject to the bank's "
                "verification and lending policies."
            )

        else:

            response = (
                "Your current profile does not meet the "
                "basic demo eligibility criteria."
            )

        return {
            "response": response,
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Loan information
    # -----------------------------------

    if intent == "LOAN_INFO":

        return {
            "response": (
                "We currently provide information about "
                "Personal Loans, Home Loans and Education Loans. "
                "Ask me about eligibility, interest rates or "
                "loan requirements."
            ),
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Interest rates
    # -----------------------------------

    if intent == "INTEREST_RATE":

        return {
            "response": (
                "Our demo banking knowledge base contains "
                "current product-rate information for Personal, "
                "Home and Education Loans. I can retrieve the "
                "relevant rate for you."
            ),
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Card block
    # -----------------------------------

    if intent == "CARD_BLOCK":

        return {
            "response": (
                "For security, your card should be blocked "
                "through the bank's authorized card-control service. "
                "This prototype does not execute card blocking."
            ),
            "intent": intent,
            "tokens": tokens
        }


    # -----------------------------------
    # Unknown
    # -----------------------------------

    return {
        "response": (
            "I can help you with your balance, recent "
            "transactions, account information, loans and "
            "banking questions. What would you like to know?"
        ),
        "intent": intent,
        "tokens": tokens
    }