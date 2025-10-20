from django.shortcuts import render
from django.urls import reverse

# каталог услуг (как в странице 1)
ITEMS = [
    {"id": 1,
     "img": "img/printer_error.png",
     "title": "Не работает принтер",
     "desc": "Устройство не подключается к сети или драйвер не отвечает",
     "eta": "2 часа"},
    {"id": 2,
     "img": "img/email_error.png",
     "title": "Нет доступа к корпоративной почте",
     "desc": "Проблемы с подключением к корпоративному почтовому ящику",
     "eta": "8 часов"},
    {"id": 3,
     "img": "img/connection_error.png",
     "title": "Отсутствует интернет-соединение",
     "desc": "Проблемы с подключением устройств к сети Интернет", "eta": "6 часов"},
    {"id": 4,
     "img": "img/installation_needed.png",
     "title": "Требуется установка ПО",
     "desc": "Установка и настройка требуемого программного обеспечения",
     "eta": "4 часа"},
]

def _mock_current_request():
    return {
        "id": 101,
        "status": "Черновик",
        "owner": "Пользователь",
        "room": "Офис 105",
        "created": "2025-10-18 12:00",
        "calc_result": "",
        "lines": [
            {
                "service_id": 1,
                "title": "Не работает принтер",
                "eta": "2 часа",
                "qty": 1,
                "order": None,
                "main": False,
                "comment": "IP-адрес принтера, проверил подключение к сети, перезагрузил",
            },
            {
                "service_id": 3,
                "title": "Отсутствует интернет-соединение",
                "eta": "6 часов",
                "qty": 2,
                "order": None,
                "main": False,
                "comment": "Не работает проводной и беспроводной интернет",
            },
        ],
    }

def _filter_items_by_query(items, q: str):
    q = (q or "").strip().lower()
    if not q:
        return items, ""
    return [it for it in items if q in it["title"].lower()], q

def support_services(request):
    filtered, q = _filter_items_by_query(ITEMS, request.GET.get("q"))

    req = _mock_current_request()
    ctx = {
        "items": filtered,
        "q": q,  # чтобы значение сохранилось в <input value="{{ q }}">
        # бейдж показываем на странице 1
        "badge_count": len(req["lines"]),
        "badge_url": reverse("support_request", args=[req["id"]]),
    }
    return render(request, "pages/support_services.html", ctx)

def support_service(request, service_id: int):
    item = next((x for x in ITEMS if x["id"] == service_id), None)
    if not item:
        return render(request, "pages/support_service.html", {"not_found": True}, status=404)
    # на странице 2 бейдж НЕ передаём
    return render(request, "pages/support_service.html", {"item": item})

def support_request(request, rid: int):
    req = _mock_current_request()
    if rid != req["id"]:
        return render(request, "pages/support_request.html",
                      {"not_found": True}, status=404)
    return render(request, "pages/support_request.html", {"req": req})
