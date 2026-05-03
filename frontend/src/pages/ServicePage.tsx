import { useParams } from 'react-router-dom'
import { services } from '../mocks/services'

function ServicePage() {
  const { id } = useParams()

  const item = services.find((s) => s.id === Number(id))

  if (!item) {
    return (
      <div className="space">
        <div className="cards-header">
          <p className="cards-question">Выбранная услуга</p>
        </div>

        <div className="cards-divider"></div>

        <section className="cards-surface">
          <p>Услуга не найдена.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space">
      <div className="cards-header">
        <p className="cards-question">Выбранная услуга</p>
      </div>

      <div className="cards-divider"></div>

      <section className="cards-surface">
        <div
          className="request-detail"
          style={{ display: 'flex', gap: '20px', alignItems: 'center' }}
        >
          <div className="request-detail__icon">
            {item.img ? (
              <img
                src={item.img}
                alt={item.title}
                style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ width: 120, height: 120 }} />
            )}
          </div>

          <div className="request-detail__text">
            <h2 className="request-detail__title">{item.title}</h2>
            <p className="request-detail__desc">{item.desc}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicePage