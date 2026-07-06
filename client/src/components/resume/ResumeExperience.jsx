// Historial laboral: título del puesto, fechas, bullets y logros.
export default function ResumeExperience({ model }) {
  const { jobs, t } = model;
  return (
    <>
      {jobs.map((job, i) => (
        <div className="rs-item" key={i}>
          <h3 className="rs-item-title">
            {[job.role, job.company].filter(Boolean).join(" — ")}
            {job.location ? <span className="rs-loc">, {job.location}</span> : null}
          </h3>
          {job.dates ? <p className="rs-dates">{job.dates}</p> : null}
          {job.bullets.length ? (
            <ul className="rs-bullets">
              {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          ) : null}
          {job.achievements.length ? (
            <>
              <p className="rs-subhead">{t("cv.achievements")}</p>
              <ul className="rs-bullets">
                {job.achievements.map((a, j) => <li key={j}>{a}</li>)}
              </ul>
            </>
          ) : null}
        </div>
      ))}
    </>
  );
}
