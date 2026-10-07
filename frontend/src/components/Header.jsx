import "./Header.css";

function Header({ activePage, onLogOut, onPageChange, user }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">AI</span>
        <div>
          <p className="eyebrow">Task Scheduler</p>
          <h1>Chronos AI</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <nav className="page-tabs" aria-label="Scheduler pages">
          <button className={activePage === "form" ? "active" : ""} type="button" onClick={() => onPageChange("form")}>
            New Task
          </button>
          <button className={activePage === "records" ? "active" : ""} type="button" onClick={() => onPageChange("records")}>
            Records
          </button>
        </nav>
        <div className="account-actions">
          <span className="account-name" title={user.email}>
            {user.name || user.email}
          </span>
          <button className="logout-button" onClick={onLogOut} type="button">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
