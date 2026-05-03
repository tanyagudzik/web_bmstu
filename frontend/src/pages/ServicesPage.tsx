import { useState } from 'react'
import { Link } from 'react-router-dom'
import { services } from '../mocks/services'

function ServicesPage() {
  const [query, setQuery] = useState('')

  const filtered = services.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space">
      {/* верхняя часть как в surface_base */}
      <div className="cards-header">
        <p className="cards-question">
          Какой вид услуги наиболее актуален для вашего запроса?
        </p>

        <a className="tag-alert" href="#" aria-label="Текущий запрос">
          <img
            className="tag-alert__icon"
            src="/img/mobile.png"
            alt="Текущий запрос"
          />
          <span className="tag-alert__text">Текущий запрос</span>
          <span className="tag-alert__count">0</span>
        </a>

      </div>

      <div className="cards-divider"></div>

      <section className="cards-surface">
        <form className="searchbar" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Найти услугу…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn--primary">
            Поиск
          </button>
        </form>

        {query && filtered.length === 0 && (
          <p className="searchbar__empty">По запросу ничего не найдено.</p>
        )}

        <div className="container">
          {filtered.map((item) => (
            <div className="card" key={item.id}>
              <div className="card__header">
                {item.img ? (
                  <img
                    src={item.img}
                    className="card__icon"
                    alt={item.title}
                  />
                ) : (
                  <div className="card__icon" />
                )}

                <div className="card__headtexts">
                  <p className="card__title">{item.title}</p>
                </div>
              </div>

              <div className="card__footer">
                <span className="card__eta">{item.eta}</span>

                <div className="card__actions">
                  <Link
                    to={`/support_service/${item.id}`}
                    className="btn btn--outline card__action-btn"
                  >
                    Подробнее
                  </Link>

                  <button
                    type="button"
                    className="btn btn--primary card__action-btn"
                  >
                    Добавить в заявку
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ServicesPage