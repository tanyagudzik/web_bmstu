import { currentRequest } from '../mocks/services'

function RequestPage() {
  const req = currentRequest

  return (
    <div className="space">
      <div className="cards-header">
        <p className="cards-question">Текущая заявка</p>
      </div>

      <div className="cards-divider"></div>

      <section className="cards-surface">
        <section className="request-wrap req">
          {req.lines.length > 0 ? (
            <div className="req-form">
              <div className="req__box">
                <div className="request-head">
                  <dl className="req-meta">
                    <dt>ID заявки:</dt>
                    <dd>{req.id}</dd>

                    <dt>Статус:</dt>
                    <dd>{req.status}</dd>

                    <dt>Дата создания:</dt>
                    <dd>{req.createdAt}</dd>

                    <dt>Создатель:</dt>
                    <dd>{req.requester}</dd>

                    <dt>Дата формирования:</dt>
                    <dd>{req.requestedAt}</dd>

                    <dt>Дата завершения:</dt>
                    <dd>{req.finishedAt}</dd>

                    <dt>Помещение:</dt>
                    <dd>
                      <input
                        type="text"
                        className="req-room-input"
                        defaultValue={req.room}
                        placeholder="Помещение"
                      />
                    </dd>
                  </dl>
                </div>
              </div>

              <div className="req__list">
                {req.lines.map((line) => (
                  <article className="req-line" key={line.id}>
                    <div className="req-line__img">
                      {line.img ? (
                        <img src={line.img} alt={line.title} />
                      ) : (
                        <span className="req-line__img-empty">нет фото</span>
                      )}
                    </div>

                    <div className="req-line__main">
                      <div className="req-line__title">{line.title}</div>
                    </div>

                    <div className="req-line__eta">{line.eta || '—'}</div>

                    <div className="req-line__comment">
                      <input
                        type="text"
                        className="req-line__input"
                        defaultValue={line.comment}
                        placeholder="Комментарий"
                      />
                    </div>

                    <button
                      type="button"
                      className="req-line__remove"
                      title="Удалить услугу из заявки"
                    >
                      &times;
                    </button>
                  </article>
                ))}
              </div>

              <div className="req__actions">
                <button
                  type="button"
                  className="btn btn--primary card__action-btn"
                >
                  Оформить заявку
                </button>

                <button
                  type="button"
                  className="btn btn--outline btn--danger-outline card__action-btn"
                >
                  Удалить заявку
                </button>
              </div>
            </div>
          ) : (
            <div className="req__box">
              <div className="request-head">
                <dl className="req-meta">
                  <dt>ID заявки:</dt>
                  <dd>{req.id}</dd>

                  <dt>Статус:</dt>
                  <dd>{req.status}</dd>

                  <dt>Дата создания:</dt>
                  <dd>{req.createdAt}</dd>

                  <dt>Создатель:</dt>
                  <dd>{req.requester}</dd>

                  <dt>Помещение:</dt>
                  <dd>{req.room || '—'}</dd>
                </dl>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

export default RequestPage