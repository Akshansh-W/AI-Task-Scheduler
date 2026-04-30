import './Header.css'

function Header({ activePage, onPageChange }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">AI</span>
        <div>
          <p className="eyebrow">Task Scheduler</p>
          <h1>Chronos AI</h1>
        </div>
      </div>

      <nav className="page-tabs" aria-label="Scheduler pages">
        <button
          className={activePage === 'form' ? 'active' : ''}
          type="button"
          onClick={() => onPageChange('form')}
        >
          New Task
        </button>
        <button
          className={activePage === 'records' ? 'active' : ''}
          type="button"
          onClick={() => onPageChange('records')}
        >
          Records
        </button>
      </nav>
    </header>
  )
}

export default Header
