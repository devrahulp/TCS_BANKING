import re


# ---------------------------------------
# Tokenization
# ---------------------------------------

def tokenize(text):
    """
    Convert user query into normalized tokens.
    """

    return re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())


# ---------------------------------------
# Intent detection
# ---------------------------------------

INTENT_KEYWORDS = {

    "BALANCE_CHECK": [
        "balance",
        "available balance",
        "how much money",
        "money in my account",
        "account balance"
    ],

    "TRANSACTION_HISTORY": [
        "transaction",
        "transactions",
        "transaction history",
        "recent transactions",
        "recent spending",
        "spent",
        "payments"
    ],

    "ACCOUNT_INFO": [
        "account information",
        "account details",
        "account number",
        "account type",
        "my account"
    ],

    "LOAN_INFO": [
        "loan",
        "loans",
        "personal loan",
        "home loan",
        "education loan"
    ],

    "LOAN_ELIGIBILITY": [
        "eligible",
        "eligibility",
        "qualify",
        "can i get a loan",
        "can i apply"
    ],

    "INTEREST_RATE": [
        "interest rate",
        "interest",
        "rate",
        "emi rate"
    ],

    "CARD_BLOCK": [
        "block card",
        "block my card",
        "card stolen",
        "lost card",
        "freeze card"
    ]
}


def detect_intent(text):

    normalized_text = text.lower()

    tokens = tokenize(text)

    # -----------------------------------
    # Specific intents first
    # -----------------------------------

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["LOAN_ELIGIBILITY"]
    ):
        return "LOAN_ELIGIBILITY", tokens

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["INTEREST_RATE"]
    ):
        return "INTEREST_RATE", tokens

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["CARD_BLOCK"]
    ):
        return "CARD_BLOCK", tokens

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["TRANSACTION_HISTORY"]
    ):
        return "TRANSACTION_HISTORY", tokens

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["BALANCE_CHECK"]
    ):
        return "BALANCE_CHECK", tokens

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["ACCOUNT_INFO"]
    ):
        return "ACCOUNT_INFO", tokens

    if any(
        phrase in normalized_text
        for phrase in INTENT_KEYWORDS["LOAN_INFO"]
    ):
        return "LOAN_INFO", tokens

    return "UNKNOWN", tokens