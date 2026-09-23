import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000";

const CUSTOMER_ID = "CUST1001";
const ACCOUNT_ID = "ACC1001";

function App() {

  // =====================================================
  // LOGIN STATE
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("securebank_logged_in") === "true"
  );


  // =====================================================
  // BANKING STATE
  // =====================================================

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loans, setLoans] = useState([]);

  const [showChat, setShowChat] = useState(false);

  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(null);


  // =====================================================
  // LOAD BANKING DATA
  // =====================================================

  const loadData = async () => {

    try {

      setLoading(true);

      const [
        customerResponse,
        accountResponse,
        transactionResponse,
        loanResponse
      ] = await Promise.all([

        fetch(
          `${API}/api/customer/${CUSTOMER_ID}`
        ),

        fetch(
          `${API}/api/account/${ACCOUNT_ID}`
        ),

        fetch(
          `${API}/api/account/${ACCOUNT_ID}/transactions`
        ),

        fetch(
          `${API}/api/loans/${CUSTOMER_ID}`
        )

      ]);


      const customerData =
        await customerResponse.json();

      const accountData =
        await accountResponse.json();

      const transactionData =
        await transactionResponse.json();

      const loanData =
        await loanResponse.json();


      setCustomer(customerData);

      setAccount(accountData);

      setTransactions(
        Array.isArray(transactionData)
          ? transactionData
          : []
      );

      setLoans(
        Array.isArray(loanData)
          ? loanData
          : []
      );


      setLastUpdated(new Date());

    }

    catch (error) {

      console.error(
        "Failed to load banking data:",
        error
      );

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD DATA AFTER LOGIN
  // =====================================================

  useEffect(() => {

    if (!isLoggedIn) {
      return;
    }


    loadData();


    // Refresh every 15 seconds

    const interval =
      setInterval(
        loadData,
        15000
      );


    return () => {
      clearInterval(interval);
    };

  }, [isLoggedIn]);


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };


  const firstName =
    customer?.name?.split(" ")[0] ||
    "Customer";


  // =====================================================
  // LOGIN
  // =====================================================

  if (!isLoggedIn) {

    return (

      <Login
        onLogin={() => {

          localStorage.setItem(
            "securebank_logged_in",
            "true"
          );

          setIsLoggedIn(true);

        }}
      />

    );

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "securebank_logged_in"
    );

    setIsLoggedIn(false);

    setCustomer(null);

    setAccount(null);

    setTransactions([]);

    setLoans([]);

    setShowChat(false);

  };


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="app">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">


        {/* LOGO */}

        <div className="logo-area">

          <div className="logo-icon">
            🏦
          </div>

          <div>

            <div className="logo">
              SecureBank
            </div>

            <div className="logo-subtitle">
              AI Banking
            </div>

          </div>

        </div>


        {/* NAVIGATION */}

        <div className="nav-links">

          <button className="nav-link active">
            Dashboard
          </button>

          <button className="nav-link">
            Accounts
          </button>

          <button className="nav-link">
            Loans
          </button>

          <button className="nav-link">
            Transactions
          </button>

        </div>


        {/* PROFILE */}

        <div className="profile">


          <div className="api-status">

            <span></span>

            Live

          </div>


          <div className="profile-avatar">

            {firstName.charAt(0)}

          </div>


          <div className="profile-name">

            {customer?.name ||
              "Loading..."}

          </div>


          {/* LOGOUT */}

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>


        </div>

      </nav>



      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">


        {/* WELCOME */}

        <section className="welcome">


          <div>

            <div className="section-label">
              PERSONAL BANKING
            </div>


            <h1>

              Good afternoon,{" "}

              {firstName}

              {" "}👋

            </h1>


            <p>
              Here's your financial overview.
            </p>

          </div>


          <div className="updated">

            <span className="live-dot"></span>

            Banking data synced


            {lastUpdated && (

              <span>

                •{" "}

                {lastUpdated.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )}

              </span>

            )}

          </div>


        </section>



        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="cards">


          {/* BALANCE */}

          <div className="card balance-card">


            <div className="card-heading">


              <div>

                <span className="card-label">

                  Available Balance

                </span>


                <h2>

                  ₹
                  {formatMoney(
                    account?.balance
                  )}

                </h2>

              </div>


              <div className="card-icon balance-icon">

                ₹

              </div>


            </div>


            <div className="account-number">

              <span className="status-dot"></span>


              {account?.account_type ||
                "Savings"}


              <span className="separator">
                •
              </span>


              •••• {ACCOUNT_ID.slice(-4)}

            </div>


            <div className="balance-footer">

              <span>
                Available to spend
              </span>


              <button
                onClick={loadData}
              >
                ↻ Refresh
              </button>

            </div>


          </div>



          {/* CREDIT SCORE */}

          <div className="card">


            <div className="card-heading">


              <div>

                <span className="card-label">

                  Credit Score

                </span>


                <h2>

                  {customer?.credit_score ||
                    "--"}

                </h2>

              </div>


              <div className="card-icon credit-icon">

                ★

              </div>


            </div>


            <div className="score-bar">

              <div
                style={{
                  width: `${Math.min(
                    (
                      (customer?.credit_score ||
                        0) /
                      900
                    ) *
                    100,
                    100
                  )}%`
                }}
              ></div>

            </div>


            <div className="score-info">

              <span className="positive">

                ● Good standing

              </span>


              <span>
                / 900
              </span>

            </div>


          </div>



          {/* MONTHLY INCOME */}

          <div className="card">


            <div className="card-heading">


              <div>

                <span className="card-label">

                  Monthly Income

                </span>


                <h2>

                  ₹

                  {Number(
                    customer?.monthly_income ||
                    0
                  ).toLocaleString(
                    "en-IN"
                  )}

                </h2>

              </div>


              <div className="card-icon income-icon">

                ↗

              </div>

            </div>


            <div className="income-info">

              <span className="positive">

                ● Verified income

              </span>

            </div>


            <div className="income-line">

              <span></span>

            </div>


          </div>


        </section>



        {/* =================================================
            DASHBOARD GRID
        ================================================= */}

        <div className="dashboard-grid">


          {/* =================================================
              TRANSACTIONS
          ================================================= */}

          <section className="transactions">


            <div className="section-header">


              <div>

                <h2>
                  Recent Transactions
                </h2>


                <p>
                  Your latest account activity
                </p>

              </div>


              <button
                className="refresh-button"
                onClick={loadData}
              >

                ↻ Refresh

              </button>


            </div>


            <div className="transaction-list">


              {loading ? (

                <div className="empty-state">

                  Loading transactions...

                </div>

              ) : transactions.length === 0 ? (

                <div className="empty-state">

                  No transactions found.

                </div>

              ) : (

                transactions.map(
                  (transaction, index) => {


                    const isCredit =
                      transaction.transaction_type ===
                      "CREDIT";


                    return (

                      <div
                        className="transaction"
                        key={
                          transaction.transaction_id ||
                          index
                        }
                      >


                        <div
                          className={`transaction-icon ${isCredit
                              ? "credit-bg"
                              : "debit-bg"
                            }`}
                        >

                          {isCredit
                            ? "↓"
                            : "↑"}

                        </div>



                        <div className="transaction-info">


                          <strong>

                            {transaction.description ||
                              "Bank transaction"}

                          </strong>


                          <span>

                            {transaction.timestamp

                              ? new Date(
                                transaction.timestamp
                              ).toLocaleString()

                              : "Recent transaction"}

                          </span>


                        </div>



                        <div className="transaction-right">


                          <strong
                            className={
                              isCredit
                                ? "amount credit"
                                : "amount debit"
                            }
                          >

                            {isCredit
                              ? "+"
                              : "-"}

                            ₹

                            {Number(
                              transaction.amount ||
                              0
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>


                          <span
                            className={`transaction-status ${transaction.status ===
                                "PENDING"
                                ? "pending"
                                : ""
                              }`}
                          >

                            {transaction.status ||
                              "COMPLETED"}

                          </span>


                        </div>


                      </div>

                    );

                  }
                )

              )}


            </div>


          </section>



          {/* =================================================
              AI PREVIEW
          ================================================= */}

          <section className="ai-preview">


            <div className="ai-header">


              <div className="ai-brand">


                <div className="ai-avatar">
                  ✦
                </div>


                <div>

                  <h2>
                    SecureBank AI
                  </h2>


                  <p>

                    <span></span>

                    Banking assistant

                  </p>

                </div>


              </div>


              <div className="ai-badge">

                AI

              </div>


            </div>



            <div className="ai-body">


              <div className="ai-welcome">


                <div className="mini-bot">
                  ✦
                </div>


                <div>


                  <strong>

                    How can I help you?

                  </strong>


                  <p>

                    Ask me about your balance,
                    transactions, loans or
                    interest rates.

                  </p>


                </div>


              </div>



              <div className="quick-questions">


                <button
                  onClick={() =>
                    setShowChat(true)
                  }
                >

                  💰 Check my balance

                </button>


                <button
                  onClick={() =>
                    setShowChat(true)
                  }
                >

                  ↕ Recent transactions

                </button>


                <button
                  onClick={() =>
                    setShowChat(true)
                  }
                >

                  💳 Loan information

                </button>


              </div>


            </div>



            <button
              className="open-ai"
              onClick={() =>
                setShowChat(true)
              }
            >

              Open AI Assistant

              <span>
                →
              </span>

            </button>


          </section>


        </div>



        {/* =================================================
            LOAN STRIP
        ================================================= */}

        <section className="loan-strip">


          <div className="loan-icon">
            💳
          </div>


          <div className="loan-text">


            <strong>

              {loans.length > 0

                ? `${loans.length} active loan${loans.length > 1
                  ? "s"
                  : ""
                }`

                : "No active loans"}

            </strong>


            <span>

              {loans.length > 0

                ? "Ask SecureBank AI for EMI and repayment details."

                : "Explore loan options with SecureBank AI."}

            </span>


          </div>


          <button
            onClick={() =>
              setShowChat(true)
            }
          >

            Ask AI →

          </button>


        </section>


      </main>



      {/* =================================================
          FLOATING AI BUTTON
      ================================================= */}

      {!showChat && (

        <button
          className="chat-button"
          onClick={() =>
            setShowChat(true)
          }
        >

          <span className="chat-button-icon">
            ✦
          </span>


          <span>
            Ask SecureBank AI
          </span>


        </button>

      )}



      {/* =================================================
          CHATBOT
      ================================================= */}

      {showChat && (

        <Chatbot
          account={account}
          customer={customer}
          onClose={() =>
            setShowChat(false)
          }
        />

      )}


    </div>

  );

}



/* =========================================================
   LOGIN COMPONENT
========================================================= */

function Login({ onLogin }) {


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");


  const handleLogin = (e) => {

    e.preventDefault();

    setError("");


    // PHASE 1 DEMO LOGIN

    if (
      email.trim().toLowerCase() ===
      "rahul@securebank.com" &&
      password === "123456"
    ) {

      onLogin();

    } else {

      setError(
        "Invalid email or password. Use the demo credentials shown below."
      );

    }

  };


  return (

    <div className="login-page">


      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="login-left">


        <div className="login-brand">


          <div className="login-logo">
            🏦
          </div>


          <div>

            <strong>
              SecureBank
            </strong>

            <span>
              AI Banking
            </span>

          </div>


        </div>



        <div className="login-content">


          <div className="login-tag">

            ✦ AI-POWERED BANKING

          </div>


          <h1>

            Banking made
            <br />

            <span>
              smarter.
            </span>

          </h1>


          <p>

            Manage your finances,
            track transactions, and get
            instant answers with
            SecureBank AI.

          </p>



          <div className="login-features">


            <div>

              <span>
                ✓
              </span>

              Secure banking dashboard

            </div>


            <div>

              <span>
                ✓
              </span>

              Real-time transaction insights

            </div>


            <div>

              <span>
                ✓
              </span>

              AI-powered banking assistant

            </div>


          </div>


        </div>


      </div>



      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="login-right">


        <form
          className="login-card"
          onSubmit={handleLogin}
        >


          <div className="mobile-login-logo">
            🏦
          </div>


          <h2>
            Welcome back
          </h2>


          <p className="login-subtitle">

            Sign in to access your
            banking dashboard

          </p>



          {/* EMAIL */}

          <label>
            Email address
          </label>


          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />



          {/* PASSWORD */}

          <div className="password-label">


            <label>
              Password
            </label>


            <button
              type="button"
              onClick={() =>
                alert(
                  "Phase 1 demo password: 123456"
                )
              }
            >

              Forgot password?

            </button>


          </div>


          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />



          {/* ERROR */}

          {error && (

            <div className="login-error">

              ⚠ {error}

            </div>

          )}



          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
          >

            Sign in

            <span>
              →
            </span>

          </button>



          {/* DEMO CREDENTIALS */}

        


          <div className="login-security">

            🔒 SecureBank demo environment

          </div>


        </form>


      </div>


    </div>

  );

}



/* =========================================================
   CHATBOT COMPONENT
========================================================= */

function Chatbot({
  account,
  customer,
  onClose
}) {


  const firstName =
    customer?.name?.split(" ")[0] ||
    "there";


  const [messages, setMessages] =
    useState([

      {
        sender: "bot",

        text:
          `Hello ${firstName}! 👋\n\n` +
          "I'm SecureBank AI. I can help you with your balance, transactions, loans, EMIs and banking information."
      }

    ]);


  const [input, setInput] =
    useState("");


  const [loading, setLoading] =
    useState(false);



  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async (
    messageText = input
  ) => {


    if (
      !messageText.trim() ||
      loading
    ) {

      return;

    }


    const userMessage =
      messageText.trim();


    // USER MESSAGE

    setMessages((prev) => [

      ...prev,

      {
        sender: "user",
        text: userMessage
      }

    ]);


    setInput("");

    setLoading(true);



    try {


      const response =
        await fetch(
          `${API}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              message:
                userMessage,

              customer_id:
                customer?.customer_id ||
                CUSTOMER_ID,

              account_id:
                account?.account_id ||
                ACCOUNT_ID

            })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Unable to process request"
        );

      }



      // BOT RESPONSE

      setMessages((prev) => [

        ...prev,

        {
          sender: "bot",

          text:
            data.response ||
            data.message ||
            data.answer ||
            "I couldn't process that request."
        }

      ]);


    }

    catch (error) {


      console.error(
        "Chat error:",
        error
      );


      setMessages((prev) => [

        ...prev,

        {
          sender: "bot",

          text:
            "Sorry, I couldn't connect to the banking service. Please make sure the Flask backend is running."
        }

      ]);

    }


    finally {

      setLoading(false);

    }

  };



  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {


    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendMessage();

    }

  };



  // =====================================================
  // CHAT UI
  // =====================================================

  return (

    <div className="chat-overlay">


      <div className="chat-window">


        {/* HEADER */}

        <div className="chat-header">


          <div className="chat-title">


            <div className="chat-avatar">
              ✦
            </div>


            <div>


              <strong>
                SecureBank AI
              </strong>


              <small>

                <span></span>

                Connected to banking API

              </small>


            </div>


          </div>


          <button
            className="close-chat"
            onClick={onClose}
          >

            ×

          </button>


        </div>



        {/* MESSAGES */}

        <div className="chat-messages">


          {messages.map(
            (message, index) => (

              <div
                key={index}
                className={`message-row ${message.sender}`}
              >


                {message.sender ===
                  "bot" && (

                    <div className="message-avatar">
                      ✦
                    </div>

                  )}


                <div>


                  <div className="message">

                    {message.text}

                  </div>


                  <small className="message-time">

                    {message.sender ===
                      "bot"

                      ? "SecureBank AI"

                      : "You"}

                  </small>


                </div>


              </div>

            )
          )}



          {/* TYPING */}

          {loading && (

            <div className="message-row bot">


              <div className="message-avatar">
                ✦
              </div>


              <div className="message typing">


                <span></span>

                <span></span>

                <span></span>


              </div>


            </div>

          )}


        </div>



        {/* SUGGESTIONS */}

        <div className="suggestions">


          <button
            onClick={() =>
              sendMessage(
                "What is my current balance?"
              )
            }
          >

            💰 Balance

          </button>


          <button
            onClick={() =>
              sendMessage(
                "Show my recent transactions"
              )
            }
          >

            ↕ Transactions

          </button>


          <button
            onClick={() =>
              sendMessage(
                "What loans do I have?"
              )
            }
          >

            💳 Loans

          </button>


          <button
            onClick={() =>
              sendMessage(
                "What are the current interest rates?"
              )
            }
          >

            % Interest

          </button>


        </div>



        {/* INPUT */}

        <div className="chat-input">


          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask a banking question..."
            disabled={loading}
          />


          <button
            onClick={() =>
              sendMessage()
            }
            disabled={loading}
          >

            {loading
              ? "…"
              : "➤"}

          </button>


        </div>



        <div className="chat-security">

          🔒 Your banking data stays secure

        </div>


      </div>


    </div>

  );

}


export default App;