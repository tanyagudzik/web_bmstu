from django.core.management.base import BaseCommand
from bmstu_lab.models import KBArticle


class Command(BaseCommand):
    help = "Наполняет базу знаний тестовыми статьями"

    def handle(self, *args, **options):
        articles = [
            {
                "title": "Принтер не печатает",
                "content": (
                    "Проверьте подключение USB-кабеля или сетевое подключение принтера. "
                    "Убедитесь, что принтер включён и не мигает красный индикатор. "
                    "Откройте Панель управления → Устройства и принтеры, проверьте статус. "
                    "Если статус 'Offline', щёлкните правой кнопкой → Использовать онлайн. "
                    "Попробуйте перезапустить службу Print Spooler: "
                    "services.msc → Print Spooler → Перезапустить."
                ),
                "description": (
                    "Printer not printing. Check USB or network cable connection. "
                    "Verify printer is turned on and no red indicator is blinking. "
                    "Open Control Panel, check printer status, restart Print Spooler service."
                ),
                "tags": "принтер, печать, spooler, offline",
                "category": "printer",
                "img_url": "/static/img/printer_error.png",
            },
            {
                "title": "VPN не подключается",
                "content": (
                    "Убедитесь, что VPN-клиент установлен и обновлён до последней версии. "
                    "Проверьте, что интернет-соединение работает (откройте любой сайт в браузере). "
                    "Проверьте правильность учётных данных (логин/пароль). "
                    "Если используется сертификат — убедитесь, что он не истёк. "
                    "Попробуйте подключиться к другому VPN-серверу. "
                    "Отключите антивирус/брандмауэр временно для диагностики."
                ),
                "description": (
                    "VPN connection failure. Verify VPN client is installed and updated. "
                    "Check internet connectivity, credentials, certificate expiration. "
                    "Try alternative VPN server. Temporarily disable firewall for diagnosis."
                ),
                "tags": "vpn, сеть, подключение, сертификат",
                "category": "network",
                "img_url": "/static/img/connection_error.png",
            },
            {
                "title": "Ошибка 502 Bad Gateway",
                "content": (
                    "Ошибка 502 означает, что прокси-сервер получил некорректный ответ "
                    "от вышестоящего сервера. Проверьте статус backend-сервиса. "
                    "Выполните: systemctl status your-app.service. "
                    "Проверьте логи: journalctl -u your-app.service --since '1 hour ago'. "
                    "Убедитесь, что порт backend не занят другим процессом: ss -tlnp | grep 8000. "
                    "Перезапустите nginx: systemctl restart nginx."
                ),
                "description": (
                    "Error 502 Bad Gateway. Proxy server received invalid response from upstream. "
                    "Check backend service status, review logs, verify port availability, "
                    "restart nginx reverse proxy."
                ),
                "tags": "502, nginx, gateway, сервер, proxy",
                "category": "software",
                "img_url": None,
            },
            {
                "title": "Не работает корпоративная почта",
                "content": (
                    "Проверьте доступ к почтовому серверу: ping mail.company.ru. "
                    "Убедитесь, что учётная запись не заблокирована (обратитесь к администратору AD). "
                    "Проверьте настройки Outlook: IMAP/SMTP серверы, порты (993/587), SSL/TLS. "
                    "Очистите кэш Outlook: закройте Outlook, удалите файлы из %LOCALAPPDATA%\\Microsoft\\Outlook\\. "
                    "Попробуйте войти через веб-интерфейс OWA."
                ),
                "description": (
                    "Corporate email not working. Ping mail server, check if AD account is locked. "
                    "Verify Outlook IMAP/SMTP settings, ports 993 and 587, SSL/TLS configuration. "
                    "Clear Outlook cache. Try OWA web interface as fallback."
                ),
                "tags": "почта, email, outlook, imap, smtp",
                "category": "email",
                "img_url": "/static/img/email_error.png",
            },
            {
                "title": "Установка Microsoft Office",
                "content": (
                    "Скачайте установщик с корпоративного портала (portal.company.ru/software). "
                    "Запустите setup.exe от имени администратора. "
                    "Выберите компоненты: Word, Excel, PowerPoint, Outlook. "
                    "При запросе ключа активации используйте KMS-сервер (автоматически). "
                    "Если установка зависает — проверьте свободное место на диске (минимум 4 ГБ). "
                    "После установки перезагрузите компьютер."
                ),
                "description": (
                    "Installing Microsoft Office. Download installer from corporate portal. "
                    "Run setup as administrator, select components Word Excel PowerPoint Outlook. "
                    "Use KMS server for activation. Requires minimum 4GB free disk space."
                ),
                "tags": "office, установка, word, excel, kms",
                "category": "software",
                "img_url": None,
            },
            {
                "title": "Ноутбук не включается",
                "content": (
                    "Убедитесь, что зарядное устройство подключено и индикатор заряда горит. "
                    "Попробуйте аппаратный сброс: отключите зарядку, удерживайте кнопку питания 15 секунд. "
                    "Подключите зарядку обратно, попробуйте включить. "
                    "Если экран чёрный, но ноутбук шумит — подключите внешний монитор (HDMI/VGA). "
                    "Проверьте, не залипла ли крышка (датчик закрытия крышки может блокировать экран). "
                    "Если ничего не помогает — обратитесь в сервисный центр."
                ),
                "description": (
                    "Laptop not turning on. Check charger and charging indicator. "
                    "Perform hard reset: disconnect charger, hold power button 15 seconds. "
                    "Try external monitor if screen is black but laptop makes noise."
                ),
                "tags": "ноутбук, питание, экран, зарядка",
                "category": "hardware",
                "img_url": None,
            },
            {
                "title": "Сброс пароля учётной записи",
                "content": (
                    "Для сброса пароля AD перейдите на портал самообслуживания: password.company.ru. "
                    "Введите логин и ответьте на контрольные вопросы. "
                    "Если портал недоступен — обратитесь к администратору по телефону 1234 (доб. 5). "
                    "Новый пароль должен содержать минимум 12 символов, заглавные и строчные буквы, "
                    "цифры и спецсимволы. Пароль нельзя повторять последние 10 паролей."
                ),
                "description": (
                    "Password reset for Active Directory account. Use self-service portal "
                    "or contact administrator. New password requires 12 characters minimum "
                    "with uppercase, lowercase, digits and special characters."
                ),
                "tags": "пароль, сброс, AD, учётная запись, active directory",
                "category": "access",
                "img_url": None,
            },
            {
                "title": "Нет доступа к сетевой папке",
                "content": (
                    "Проверьте, что вы подключены к корпоративной сети (VPN или локальная сеть). "
                    "Попробуйте открыть папку через полный UNC-путь: \\\\server\\share. "
                    "Проверьте, что ваша учётная запись добавлена в группу доступа (обратитесь к владельцу ресурса). "
                    "Очистите кэш учётных данных: Панель управления → Диспетчер учётных данных → Удалить. "
                    "Перезагрузите компьютер после изменения группы."
                ),
                "description": (
                    "Cannot access network shared folder. Verify corporate network connection. "
                    "Try full UNC path. Check Active Directory group membership. "
                    "Clear Windows Credential Manager cache and reboot."
                ),
                "tags": "сеть, папка, доступ, smb, share",
                "category": "network",
                "img_url": None,
            },
            {
                "title": "Синий экран (BSOD)",
                "content": (
                    "Запишите код ошибки с синего экрана (например, KERNEL_DATA_INPAGE_ERROR). "
                    "Перезагрузите компьютер. Если BSOD повторяется — загрузитесь в безопасном режиме (F8). "
                    "Проверьте диск: chkdsk /f /r в командной строке от администратора. "
                    "Проверьте оперативную память: запустите средство проверки памяти Windows (mdsched.exe). "
                    "Обновите драйверы видеокарты и чипсета. "
                    "Если проблема в драйвере — имя файла обычно указано в описании BSOD."
                ),
                "description": (
                    "Blue Screen of Death BSOD. Record error code. Reboot, try Safe Mode. "
                    "Run chkdsk and Windows Memory Diagnostic. Update GPU and chipset drivers. "
                    "Driver filename is usually mentioned in BSOD description."
                ),
                "tags": "bsod, синий экран, ошибка, драйвер, память",
                "category": "hardware",
                "img_url": None,
            },
            {
                "title": "Мобильное устройство не подключается к WiFi",
                "content": (
                    "Убедитесь, что вы подключаетесь к сети Corporate-WiFi (не Guest). "
                    "Введите корпоративные учётные данные (логин без @company.ru). "
                    "Если сертификат — примите его при первом подключении. "
                    "Забудьте сеть и подключитесь заново: Настройки → WiFi → Забыть сеть. "
                    "Проверьте, что MAC-адрес устройства зарегистрирован (обратитесь к сетевому администратору). "
                    "На Android: убедитесь, что метод EAP = PEAP, аутентификация = MSCHAPV2."
                ),
                "description": (
                    "Mobile device WiFi connection issue. Connect to Corporate-WiFi network. "
                    "Enter credentials without domain suffix. Accept certificate. "
                    "Forget and rejoin network. Verify MAC address registration. "
                    "Android: set EAP to PEAP, authentication to MSCHAPV2."
                ),
                "tags": "wifi, мобильный, смартфон, android, ios, сеть",
                "category": "network",
                "img_url": "/static/img/mobile_support.png",
            },
            {
                "title": "Подключение второго монитора",
                "content": (
                    "Подключите монитор кабелем HDMI, DisplayPort или VGA. "
                    "Нажмите Win+P и выберите режим: Дублировать, Расширить или Только второй экран. "
                    "Если монитор не определяется: Параметры → Дисплей → Обнаружить. "
                    "Проверьте, что на мониторе выбран правильный вход (Input Source). "
                    "Обновите драйвер видеокарты через Диспетчер устройств. "
                    "Для док-станции: убедитесь, что установлены драйверы докстанции."
                ),
                "description": (
                    "Connecting second external monitor via HDMI DisplayPort or VGA. "
                    "Use Win+P to select display mode. Check display settings if not detected. "
                    "Verify monitor input source. Update GPU driver. Install dock station drivers."
                ),
                "tags": "монитор, экран, hdmi, displayport, док-станция",
                "category": "hardware",
                "img_url": None,
            },
            {
                "title": "Медленно работает компьютер",
                "content": (
                    "Откройте Диспетчер задач (Ctrl+Shift+Esc), проверьте загрузку CPU, RAM, диска. "
                    "Если диск 100% — возможно, идёт обновление Windows или индексация. "
                    "Отключите автозагрузку ненужных программ: Диспетчер задач → Автозагрузка. "
                    "Проверьте свободное место на диске C: (минимум 10% должно быть свободно). "
                    "Запустите очистку диска: cleanmgr. "
                    "Если RAM загружена >90% — закройте неиспользуемые приложения или обратитесь "
                    "за увеличением объёма RAM."
                ),
                "description": (
                    "Slow computer performance. Check Task Manager for CPU RAM and disk usage. "
                    "Disable unnecessary startup programs. Free disk space, run disk cleanup. "
                    "Close unused applications if RAM usage exceeds 90 percent."
                ),
                "tags": "медленно, производительность, RAM, CPU, диск, автозагрузка",
                "category": "software",
                "img_url": None,
            },
        ]

        created = 0
        for data in articles:
            _, is_new = KBArticle.objects.get_or_create(
                title=data["title"],
                defaults=data,
            )
            if is_new:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Создано {created} статей (всего в БД: {KBArticle.objects.count()})"
        ))