import defaultImg from '../assets/hero.png';

export interface IKBArticle {
    id: number;
    title: string;
    content: string;
    description: string;  // English — для SigLIP
    tags: string;
    category: string;
    img_url: string | null;
    image: string;         // для отображения
    embedding?: number[];
}

export const KB_ARTICLES_MOCK: IKBArticle[] = [
    {
        id: 1,
        title: "Принтер не печатает",
        content: "Проверьте подключение USB-кабеля или сетевое подключение принтера...",
        description: "Printer not printing. Check USB or network cable connection. Verify printer is turned on and no red indicator is blinking. Open Control Panel, check printer status, restart Print Spooler service.",
        tags: "принтер, печать, spooler",
        category: "printer",
        img_url: "/img/printer_error.png",
        image: defaultImg,
    },
    {
        id: 2,
        title: "VPN не подключается",
        content: "Убедитесь, что VPN-клиент установлен и обновлён до последней версии...",
        description: "VPN connection failure. Verify VPN client is installed and updated. Check internet connectivity, credentials, certificate expiration. Try alternative VPN server. Temporarily disable firewall for diagnosis.",
        tags: "vpn, сеть, подключение",
        category: "network",
        img_url: "/img/connection_error.png",
        image: defaultImg,
    },
    {
        id: 3,
        title: "Ошибка 502 Bad Gateway",
        content: "Ошибка 502 означает, что прокси-сервер получил некорректный ответ...",
        description: "Error 502 Bad Gateway. Proxy server received invalid response from upstream. Check backend service status, review logs, verify port availability, restart nginx reverse proxy.",
        tags: "502, nginx, gateway, сервер",
        category: "software",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 4,
        title: "Не работает корпоративная почта",
        content: "Проверьте доступ к почтовому серверу...",
        description: "Corporate email not working. Ping mail server, check if AD account is locked. Verify Outlook IMAP/SMTP settings, ports 993 and 587, SSL/TLS configuration. Clear Outlook cache. Try OWA web interface as fallback.",
        tags: "почта, email, outlook",
        category: "email",
        img_url: "/img/email_error.png",
        image: defaultImg,
    },
    {
        id: 5,
        title: "Установка Microsoft Office",
        content: "Скачайте установщик с корпоративного портала...",
        description: "Installing Microsoft Office. Download installer from corporate portal. Run setup as administrator, select components Word Excel PowerPoint Outlook. Use KMS server for activation. Requires minimum 4GB free disk space.",
        tags: "office, установка, word, excel",
        category: "software",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 6,
        title: "Ноутбук не включается",
        content: "Убедитесь, что зарядное устройство подключено...",
        description: "Laptop not turning on. Check charger and charging indicator. Perform hard reset: disconnect charger, hold power button 15 seconds. Try external monitor if screen is black but laptop makes noise.",
        tags: "ноутбук, питание, экран",
        category: "hardware",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 7,
        title: "Сброс пароля учётной записи",
        content: "Для сброса пароля AD перейдите на портал самообслуживания...",
        description: "Password reset for Active Directory account. Use self-service portal or contact administrator. New password requires 12 characters minimum with uppercase, lowercase, digits and special characters.",
        tags: "пароль, сброс, AD",
        category: "access",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 8,
        title: "Нет доступа к сетевой папке",
        content: "Проверьте, что вы подключены к корпоративной сети...",
        description: "Cannot access network shared folder. Verify corporate network connection. Try full UNC path. Check Active Directory group membership. Clear Windows Credential Manager cache and reboot.",
        tags: "сеть, папка, доступ, smb",
        category: "network",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 9,
        title: "Синий экран (BSOD)",
        content: "Запишите код ошибки с синего экрана...",
        description: "Blue Screen of Death BSOD. Record error code. Reboot, try Safe Mode. Run chkdsk and Windows Memory Diagnostic. Update GPU and chipset drivers. Driver filename is usually mentioned in BSOD description.",
        tags: "bsod, синий экран, ошибка",
        category: "hardware",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 10,
        title: "Мобильное устройство не подключается к WiFi",
        content: "Убедитесь, что вы подключаетесь к сети Corporate-WiFi...",
        description: "Mobile device WiFi connection issue. Connect to Corporate-WiFi network. Enter credentials without domain suffix. Accept certificate. Forget and rejoin network. Verify MAC address registration. Android: set EAP to PEAP, authentication to MSCHAPV2.",
        tags: "wifi, мобильный, android",
        category: "network",
        img_url: "/img/mobile_support.png",
        image: defaultImg,
    },
    {
        id: 11,
        title: "Подключение второго монитора",
        content: "Подключите монитор кабелем HDMI, DisplayPort или VGA...",
        description: "Connecting second external monitor via HDMI DisplayPort or VGA. Use Win+P to select display mode. Check display settings if not detected. Verify monitor input source. Update GPU driver. Install dock station drivers.",
        tags: "монитор, экран, hdmi",
        category: "hardware",
        img_url: null,
        image: defaultImg,
    },
    {
        id: 12,
        title: "Медленно работает компьютер",
        content: "Откройте Диспетчер задач (Ctrl+Shift+Esc)...",
        description: "Slow computer performance. Check Task Manager for CPU RAM and disk usage. Disable unnecessary startup programs. Free disk space, run disk cleanup. Close unused applications if RAM usage exceeds 90 percent.",
        tags: "медленно, производительность, RAM",
        category: "software",
        img_url: null,
        image: defaultImg,
    },
];