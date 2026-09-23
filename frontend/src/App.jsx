import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000";

function App() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const customerId = "CUST1001";
  const accountId = "ACC1001";

  const loadData = async () => {
    try {
      const customerResponse = await fetch(
        `${API}/api/customer/${customerId}`
      );

      const accountResponse = await fetch(
        `${API}/api/account/${accountId}`
      );

      const transactionResponse = await fetch(
        `${API}/api/account/${accountId}/transactions`
      );

      const customerData = await customerResponse.json();
      const accountData = await accountResponse.json();
      const transactionData = await transactionResponse.json();

      setCustomer(customerData);
      setAccount(accountData);
      setTransactions(transactionData);
    } catch (error) {
      console.error("Failed to load banking data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          🏦 SecureBank
        </div>

        <div className="nav-links">
          <span>Dashboard</span>
          <span>Accounts</span>
          <span>Loans</span>
          <span>Transactions</span>
        </div>

        <div className="profile">
          👤 {customer?.name || "Loading..."}
        </div>

      </nav>


      {/* MAIN */}

      <main className="main">

        <div className="welcome">

          <h1>
            Good afternoon, {customer?.name?.split(" ")[0] || "Customer"} 👋
          </h1>

          <p>
            Here's your financial overview.
          </p>

        </div>


        {/* CARDS */}

        <div className="cards">

          <div className="card balance-card">

            <p>Available Balance</p>

            <h2>
              ₹{account?.balance?.toLocaleString("en-IN", {
                minimumFractionDigits: 2
              }) || "0.00"}
            </h2>

            <span>
              {account?.account_type || "Savings"} ••••1001
            </span>

          </div>


          <div className="card">

            <p>Credit Score</p>

            <h2>
              {customer?.credit_score || "--"}
            </h2>

            <span className="positive">
              Good standing
            </span>

          </div>


          <div className="card">

            <p>Monthly Income</p>

            <h2>
              ₹{customer?.monthly_income?.toLocaleString("en-IN") || "0"}
            </h2>

            <span>
              Verified income
            </span>

          </div>

        </div>


        {/* TRANSACTIONS */}

        <section className="transactions">

          <div className="section-header">

            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest account activity</p>
            </div>

            <button onClick={loadData}>
              ↻ Refresh
            </button>

          </div>


          <div className="transaction-list">

            {transactions.map((transaction) => (

              <div
                className="transaction"
                key={transaction.transaction_id}
              >

                <div className="transaction-icon">

                  {transaction.transaction_type === "CREDIT"
                    ? "↓"
                    : "↑"}

                </div>


                <div className="transaction-info">

                  <strong>
                    {transaction.description}
                  </strong>

                  <span>
                    {new Date(
                      transaction.timestamp
                    ).toLocaleString()}
                  </span>

                </div>


                <div
                  className={
                    transaction.transaction_type === "CREDIT"
                      ? "amount credit"
                      : "amount debit"
                  }
                >

                  {transaction.transaction_type === "CREDIT"
                    ? "+"
                    : "-"}
                  
                  ₹{transaction.amount.toLocaleString("en-IN")}

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>


      {/* AI BUTTON */}

      <button
        className="chat-button"
        onClick={() => setShowChat(true)}
      >
        🤖
        <span>Ask AI</span>
      </button>


      {/* CHATBOT */}

      {showChat && (
        <Chatbot
          account={account}
          customer={customer}
          onClose={() => setShowChat(false)}
        />
      )}

    </div>
  );
}


/* -------------------------------- */
/* CHATBOT */
/* -------------------------------- */

function Chatbot({ account, customer, onClose }) {

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        `Hello ${customer?.name?.split(" ")[0] || "there"}! 👋\n\n` +
        "I'm your SecureBank AI Assistant. I can help with balances, transactions, loans and banking questions."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);


  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = input;

    setMessages(prev => [
      ...prev,
      {
        sender: "user",
        text: userMessage
      }
    ]);

    setInput("");
    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: userMessage,
            customer_id: customer?.customer_id || "CUST1001",
            account_id: account?.account_id || "ACC1001"
          })
        }
      );

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.response || data.message || "I couldn't process that request."
        }
      ]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't connect to the banking service."
        }
      ]);

    }

    setLoading(false);
  };


  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }

  };


  return (

    <div className="chat-window">

      <div className="chat-header">

        <div>
          <strong>🤖 SecureBank AI</strong>
          <small>AI Banking Assistant</small>
        </div>

        <button onClick={onClose}>
          ×
        </button>

      </div>


      <div className="chat-messages">

        {messages.map((message, index) => (

          <div
            key={index}
            className={`message ${message.sender}`}
          >
            {message.text}
          </div>

        ))}

        {loading && (
          <div className="message bot">
            Thinking...
          </div>
        )}

      </div>


      <div className="suggestions">

        <button onClick={() => setInput("What is my current balance?")}>
          Balance
        </button>

        <button onClick={() => setInput("Show my recent transactions")}>
          Transactions
        </button>

        <button onClick={() => setInput("What loans do you offer?")}>
          Loans
        </button>

      </div>


      <div className="chat-input">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a banking question..."
        />

        <button onClick={sendMessage}>
          ➤
        </button>

      </div>

    </div>

  );
}

export default App;