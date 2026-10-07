import "./HomePage.css";

function HomePage({ onGetStarted, onLogIn }) {
  return (
    <main className="welcome-page">
      <header className="welcome-nav">
        <a className="welcome-brand" href="#home" aria-label="Chronos AI home">
          <span className="welcome-mark">C</span>
          <span>
            chronos<span className="brand-accent">.</span>
          </span>
        </a>
        <button className="welcome-login" onClick={onLogIn} type="button">
          Log in <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="welcome-hero">
        <div className="welcome-copy">
          <p className="welcome-kicker">
            <span /> YOUR DAY, WITH A LITTLE MORE ROOM
          </p>
          <h1>
            Make room for
            <br />
            the work that <em>matters.</em>
          </h1>
          <p className="welcome-description">
            Turn a deadline into a clear, realistic plan. Chronos breaks big tasks into focused steps, so you can get moving without figuring it all
            out first.
          </p>
          <div className="welcome-actions">
            <button className="welcome-primary" onClick={onGetStarted} type="button">
              Create your free account <span aria-hidden="true">→</span>
            </button>
            <span className="welcome-note">Thoughtful planning starts here.</span>
          </div>
          <div className="welcome-proof">
            <span className="proof-icon" aria-hidden="true">
              ✳
            </span>
            <p>
              <strong>One task at a time.</strong>
              <br />A calmer way to make real progress.
            </p>
          </div>
        </div>

        <div className="schedule-art" aria-label="Example of a planned workday">
          <div className="schedule-art-top">
            <div>
              <p className="art-label">TUESDAY, OCTOBER 13</p>
              <h2>Your focus plan</h2>
            </div>
            <span className="art-day">
              Today <span aria-hidden="true">⌄</span>
            </span>
          </div>
          <div className="art-progress">
            <div className="progress-label">
              <span>Daily progress</span>
              <strong>2 of 4 steps</strong>
            </div>
            <div className="progress-track">
              <span />
            </div>
          </div>
          <div className="art-timeline">
            <div className="time-mark">9:00</div>
            <div className="timeline-entry complete-entry">
              <span className="entry-dot" />
              <div>
                <small>45 MIN · DEEP WORK</small>
                <strong>Outline project proposal</strong>
                <span>Shape the core idea and goals</span>
              </div>
              <b aria-label="Complete">✓</b>
            </div>
            <div className="time-mark">10:00</div>
            <div className="timeline-entry current-entry">
              <span className="entry-dot" />
              <div>
                <small>30 MIN · RESEARCH</small>
                <strong>Gather supporting sources</strong>
                <span>Find three useful references</span>
              </div>
              <i>UP NEXT</i>
            </div>
            <div className="time-mark">11:00</div>
            <div className="timeline-entry">
              <span className="entry-dot" />
              <div>
                <small>25 MIN · WRITING</small>
                <strong>Draft the opening section</strong>
                <span>Start with the problem statement</span>
              </div>
            </div>
          </div>
          <div className="art-footer">
            <span>✦</span> A plan shaped around your deadline
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>CHRONOS AI</span>
        <span>Plan with intention. Finish with focus.</span>
      </footer>
    </main>
  );
}

export default HomePage;
