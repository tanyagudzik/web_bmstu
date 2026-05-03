export interface Service {
  id: number
  title: string
  desc: string
  eta: string
  img: string
}

export interface RequestLine {
  id: number
  serviceId: number
  title: string
  eta: string
  img: string
  comment: string
}

export interface SupportRequestMock {
  id: number
  status: string
  createdAt: string
  requester: string
  requestedAt: string
  finishedAt: string
  room: string
  lines: RequestLine[]
}

export const services: Service[] = [
  {
    id: 1,
    title: 'Удаленная установка ПО',
    desc: 'Установка программ удаленно через подключение.',
    eta: '30 мин',
    img: '/default-image.png',
  },
  {
    id: 2,
    title: 'Настройка сети',
    desc: 'Помощь с подключением к сети и интернету.',
    eta: '1 час',
    img: '/default-image.png',
  },
  {
    id: 3,
    title: 'Диагностика ПК',
    desc: 'Поиск и устранение проблем компьютера.',
    eta: '2 часа',
    img: '/default-image.png',
  },
]

export const currentRequest: SupportRequestMock = {
  id: 101,
  status: 'черновик',
  createdAt: '18.04.2026 20:00',
  requester: 'Тестовый пользователь',
  requestedAt: '—',
  finishedAt: '—',
  room: '207',
  lines: [
    {
      id: 1,
      serviceId: 1,
      title: 'Удаленная установка ПО',
      eta: '30 мин',
      img: '/default-image.png',
      comment: 'Нужно установить офисный пакет',
    },
    {
      id: 2,
      serviceId: 2,
      title: 'Настройка сети',
      eta: '1 час',
      img: '/default-image.png',
      comment: 'Периодически пропадает интернет',
    },
  ],
}